import { createFile } from '../deps/mp4box.0.5.2.js'

export default class MP4Demuxer {
  #onConfig 
  #onChunk 
  #file
  /**
   * 
   * @param {ReadableStream} stream 
   * @param {object} options 
   * @param {(config: object) => void}
   * 
   * @returns {Promise<void>}
   */

  async run(stream, { onConfig, onChunk }) {
    this.#onConfig = onConfig
    this.#onChunk = onChunk

    this.#file = createFile()
    this.#file.onReady = (arguments) => {
      debugger
    }

    this.#file.onError = (error) => 
      console.error('Bad request mp4Demuxer', error)
    
    this.#init(stream)
  }

  #init(stream) {

  }
}