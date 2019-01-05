const { expect } = require('chai')
const OSS = require('ali-oss')
const OSSStorage = require('..')

describe('multer oss storage', () => {
  const OSS_INFO = {
    region: 'oss-region',
    internal: false,
    accessKeyId: 'access-key-id',
    accessKeySecret: 'access-key-secret',
    bucket: 'bucket'
  }
  describe('init oss storage', () => {
    it('should init failed', () => {
      expect(() => new OSSStorage()).to.throw('opt could not be empty')
      expect(() => new OSSStorage({})).to.throw('oss info or client are required to set oss storage')
    })
    it('should init successfully', () => {
      const client = new OSS(OSS_INFO)
      new OSSStorage({ client })
      new OSSStorage({
        oss: OSS_INFO
      })
    })
  })
})
