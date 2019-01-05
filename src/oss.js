import OSS from 'ali-oss'
import path from 'path'

class OSSStorage {
  constructor(opt) {
    if (!opt) throw new Error('opt could not be empty')
    const { oss, client, destination, filename } = opt
    if (!oss && !client) throw new Error('oss info or client are required to set oss storage')
    this.destination = destination && typeof destination === 'function' ? destination : this.DEFAULT_DESTINATION
    this.filename = filename && typeof filename === 'function' ? filename : this.DEFAULT_FILENAME
    if (client && !(client instanceof OSS)) throw new Error('the client option is not valid oss client')
    this.oss = client || new OSS(oss)
  }

  DEFAULT_DESTINATION() {
    return ''
  }

  DEFAULT_FILENAME(req, file) {
    return file.originalname
  }

  getFileInfo(req, file) {
    return Promise.all([
      this.destination(req, file, this.oss),
      this.filename(req, file, this.oss),
    ])
  }

  async _handleFile(req, file, callback) {
    try {
      const [filePath, fileName] = await this.getFileInfo(req, file)
      const result = await this.oss.putStream(path.join(filePath, fileName), file.stream)
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
