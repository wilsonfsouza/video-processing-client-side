import WebMWriter from './../deps/webm-writer2.js'
import CanvasRenderer from "./canvasRenderer.js"
import MP4Demuxer from "./mp4Demuxer.js"
import VideoProcessor from "./videoProcessor.js"

// qvga = 144p on youtube
const qvgaConstraints = {
  width: 320,
  height: 240,
}
const vgaConstraints = {
  width: 640,
  height: 480,
}
const hdConstraints = {
  width: 1280,
  height: 720,
}

const encoderConfig = {
  ...qvgaConstraints,
  bitrate: 10e6,
  // WebM
  codec: 'vp09.00.10.08',
  pt: 4,
  hardwareAccelaration: 'prefer-software',

  // MP4
  // codec: 'avc1.42002A',
  // pt: 1,
  // hardwareAccelaration: 'prefer-hardware',
  // avc: { format: 'annexb' }
}

const webmWriterConfig = {
  ...qvgaConstraints,
  codec: 'VP9',
  width: encoderConfig.width,
  height: encoderConfig.height,
  bitrate: encoderConfig.bitrate,
}

const webMWriter = new WebMWriter(webmWriterConfig)
const mp4Demuxer = new MP4Demuxer()
const videoProcessor = new VideoProcessor({
  mp4Demuxer,
  webMWriter,
})

onmessage = async ({ data }) => {
  const renderFrame = CanvasRenderer.getRenderer(data.canvas)

  await videoProcessor.start({
    file: data.file,
    renderFrame,
    encoderConfig,
    sendMessage(message) {
      self.postMessage(message)
    }
  })
}