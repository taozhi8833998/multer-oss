import OSS from 'ali-oss'
import concat from 'concat-stream'
import imagemin from 'imagemin'
import imageminJpegtran from 'imagemin-jpegtran'
import imageminPngquant from 'imagemin-pngquant'
import path from 'path'
import { promisify } from 'util'
import zlib from 'zlib'

const gzip = promisify(zlib.gzip.bind(zlib))
const IMAGE_REGEX = /(.*)\.(jpg|jpeg|png)$/

class OSSStorage {
  constructor(opt) {
    if (!opt) throw new Error('opt could not be empty')
    const { oss, client, destination, filename, options, stream } = opt
    if (!oss && !client) throw new Error('oss info or client are required to set oss storage')
    this.destination = destination && typeof destination === 'function' ? destination : this.DEFAULT_DESTINATION
    this.filename = filename && typeof filename === 'function' ? filename : this.DEFAULT_FILENAME
    this.options = options && typeof options === 'function' ? options : this.DEFAULT_OPTIONS
    this.stream = stream && typeof stream === 'function' ? stream : this.DEFAULT_FILESTREAM
    this.oss = client || new OSS(oss)
  }

  couldMin(file) {
    // current only support jpg, jpeg, and png min
    return IMAGE_REGEX.test(file.originalname)
  }

  DEFAULT_DESTINATION() {
    return ''
  }

  DEFAULT_FILENAME(req, file) {
    return file.originalname
  }

  async DEFAULT_FILESTREAM(req, file) {
    const isImage = this.couldMin(file)
    if (!isImage) return file.stream.pipe(zlib.createGzip())
    let resolveOut = null
    let rejectOut = null
    const promise = new Promise((resolve, reject) => {
      resolveOut = resolve
      rejectOut = reject
    })
    file.stream.pipe(concat({ encoding: 'buffer' }, resolveOut))
    file.stream.on('error', rejectOut)
    const imageBuffer = await promise
    const pngMinQuality = 0.65
    const pngMaxQuality = 0.8
    const imageMinBuffer = await imagemin.buffer(imageBuffer, {
      plugins : [
        imageminJpegtran(),
        imageminPngquant({
          quality : [pngMinQuality, pngMaxQuality],
        }),
      ],
    })
    return gzip(imageMinBuffer)
  }

  DEFAULT_OPTIONS(req, file) {
    return {
      // contentLength : file.size,
      headers : {
        'Cache-Control'       : 'max-age=3600000',
        'Content-Disposition' : file.originalname,
        'Content-Encoding'    : 'gzip',
        Expires               : 3600000,
      },
    }
  }

  getFileInfo(req, file) {
    return Promise.all([
      this.destination(req, file, this.oss),
      this.filename(req, file, this.oss),
      this.stream(req, file, this.oss),
      this.options(req, file, this.oss),
    ])
  }

  async _handleFile(req, file, callback) {
    try {
      const [filePath, fileName, bufferData, options] = await this.getFileInfo(req, file)
      const result = await this.oss.put(path.join(filePath, fileName), bufferData, options)
      return callback(null, result)
    } catch(err) {
      return callback(err.toString())
    }
  }

  async _removeFile(req, file, callback) {
    try {
      const [filePath, fileName] = await this.getFileInfo(req, file)
      const result = await this.oss.delete(path.join(filePath, fileName))
      return callback(null, result)
    } catch(err) {
      return callback(err.toString())
    }
  }
}
export default OSSStorage
