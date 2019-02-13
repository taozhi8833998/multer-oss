import OSS from 'ali-oss'
import path from 'path'
import zlib from 'zlib'

class OSSStorage {
  constructor(opt) {
    if (!opt) throw new Error('opt could not be empty')
    const { oss, client, destination, filename, options, stream } = opt
    if (!oss && !client) throw new Error('oss info or client are required to set oss storage')
    this.destination = destination && typeof destination === 'function' ? destination : this.DEFAULT_DESTINATION
    this.filename = filename && typeof filename === 'function' ? filename : this.DEFAULT_FILENAME
    if (client && !(client instanceof OSS)) throw new Error('the client option is not a valid oss client')
    this.options = options && typeof options === 'function' ? options : this.DEFAULT_OPTIONS
    this.stream = stream && typeof stream === 'function' ? stream : this.DEFAULT_FILESTREAM
    this.oss = client || new OSS(oss)
  }

  DEFAULT_DESTINATION() {
    return ''
  }

  DEFAULT_FILENAME(req, file) {
    return file.originalname
  }

  DEFAULT_FILESTREAM(req, file) {
    return file.stream.pipe(zlib.createGzip())
  }

  DEFAULT_OPTIONS(req, file) {
    return {
      contentLength : file.size,
      headers       : {
        'Content-Encoding' : 'gzip',
        Expires            : 3600000,
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
      const [filePath, fileName, stream, options] = await this.getFileInfo(req, file)
      const result = await this.oss.putStream(path.join(filePath, fileName), stream, options)
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
