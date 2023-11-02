export default class VideoProcessor {
  #mp4Demuxer
  #webMWriter
  /** 
   * 
   * @param {object} options
   * @param {import('./mp4Demuxer.js').default} options.mp4Demuxer
  */
  constructor ({ mp4Demuxer, webMWriter }) {
    this.#mp4Demuxer = mp4Demuxer
    this.#webMWriter = webMWriter
  }

  /**
   * @returns {ReadableStream}
   */
  mp4Decoder(stream) {
    return new ReadableStream({
      start: async (controller) => {
        const decoder = new VideoDecoder({
          /**
           * @param {VideoFrame} frame 
           */
          output(frame) {
            controller.enqueue(frame)
          },
          error(e) {
            console.error('Error at MP4Decoder', e)
            controller.error(e)
          }
        })
    
        return this.#mp4Demuxer.run(stream, {
          onConfig(config) {
            decoder.configure(config)
          },
          /**
           * 
           * @param {EncodedVideoChunk} chunk 
           */
          onChunk(chunk) {
            decoder.decode(chunk)
          }
        }).then(() => {
          // Temporary workaround to stop countdown
          setTimeout(() => {
            controller.close()
          }, 1000)
        })
      }
    })
  }

  encode144p(encodeConfig) {
    let _encoder;

    const readable = new ReadableStream({
      start: async (controller) => {
        const { supported } = await VideoEncoder.isConfigSupported(encodeConfig)

        if (!supported) {
          const message = 'encode144p VideoEncoder config is not supported'
          console.error(message, encodeConfig)
          controller.error(message)
          return
        }

        _encoder = new VideoEncoder({
          /**
           * 
           * @param {EncodedVideoChunk} frame 
           * @param {EncodedVideoChunkMetadata} config 
           */
          output: (frame, config) => {
            if (config.decoderConfig) {
              const decoderConfig = {
                type: 'config',
                config: config.decoderConfig
              }

              controller.enqueue(decoderConfig)
            }

            controller.enqueue(frame)
          },
          error: (err) => {
            console.error('VideoEncoder 144p', err)
            controller.error(err)
          }
        })

        await _encoder.configure(encodeConfig)
      }

    })

    const writable = new WritableStream({
      async write(frame) {
        _encoder.encode(frame)
        frame.close()
      }
    })

    return {
      readable,
      writable
    }
  }

  renderDecodedFramesAndGetEncodedChunks(renderFrame) {
    let _decoder;

    return new TransformStream({
      /**
       * 
       * @param {TransformStreamDefaultController} controller 
       */
      start: (controller) => {
        _decoder =  new VideoDecoder({
          output(frame) {
            renderFrame(frame)
          },
          error(e) {
            console.error('Error at rendering frames', e)
            controller.error(e)
          }
        })
      },
      /**
       * 
       * @param {EncodedVideoChunk} encodedChunk
       * @param {TransformStreamDefaultController} controller 
       */
      async transform(encodedChunk, controller) {
        if (encodedChunk.type === 'config') {
          await _decoder.configure(encodedChunk.config)
          return
        }
        _decoder.decode(encodedChunk)

        // need the encoded version to use webM
        controller.enqueue(encodedChunk)
      }
    })

  }

  transformIntoWebM() {
    const writable = new WritableStream({
      write: (chunk) => {
        this.#mp4Demuxer.addFrame(chunk)
      },
      close() {
        debugger
      }
    })

    return {
      readable: this.#webMWriter.getStream(),
      writable
    }
  }

  async start({ file, encoderConfig, renderFrame, sendMessage }) {
    const stream = file.stream()
    const fileName = file.name.split('/').pop().replace('.mp4', '')

    await this.mp4Decoder(stream)
      .pipeThrough(this.encode144p(encoderConfig))
      .pipeThrough(this.renderDecodedFramesAndGetEncodedChunks(renderFrame))
      .pipeThrough(this.transformIntoWebM()) 
      // .pipeTo(new WritableStream({
      //   write(frame) {
      //     renderFrame(frame)
      //   }
      // }))

    sendMessage({
      status: 'done'
  })
  }
}