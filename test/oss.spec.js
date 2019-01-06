const { expect } = require('chai')
const OSS = require('ali-oss')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const OSSStorage = require('..')
const done = require('./util')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const unlink = promisify(fs.unlink)
const stat = promisify(fs.stat)

describe('multer oss storage', () => {
  const OSS_INFO = {
    region: 'oss-region',
    internal: false,
    accessKeyId: 'access-key-id',
    accessKeySecret: 'access-key-secret',
    bucket: 'bucket'
  }
  const client = new OSS(OSS_INFO)
  describe('init oss storage', () => {
    it('should init failed', () => {
      expect(() => new OSSStorage()).to.throw('opt could not be empty')
      expect(() => new OSSStorage({})).to.throw('oss info or client are required to set oss storage')

      expect(() => new OSSStorage({
        client: {}
      })).to.throw('the client option is not a valid oss client')
    })
    it('should init successfully', () => {
      new OSSStorage({ client })
      new OSSStorage({
        oss: OSS_INFO
      })
      new OSSStorage({
        client,
        destination: async (req, file, oss) => {
          return ''
        },
        filename: async (req, file, oss) => {
          return file.originalname
        }
      })
    })
    it('should upload successfully', done(async () => {
      const uploadFileName = 'upload.txt'
      const ossStorage = new OSSStorage({
        client,
        destination: async (req, file, oss) => {
          oss.putStream = async (fileFullPath, fileStream) => {
            fileStream.pipe(fs.createWriteStream(path.join(__dirname, fileFullPath)))
          }
          return ''
        },
        filename: async (req, file, oss) => {
          return uploadFileName
        }
      })

      // create mock file content
      const content = 'this is an upload test content in txt file'
      const originalname = 'local.txt'
      const filePath = path.join(__dirname, originalname)
      await writeFile(filePath, content)
      const file = {
        stream: fs.createReadStream(filePath),
        originalname
      }
      await ossStorage._handleFile({}, file, () => {})
      const uploadFilePath = path.join(__dirname, uploadFileName)
      try {
        const data = await readFile(uploadFilePath, {encoding: 'utf8'})
        expect(data).to.be.eql(content)
      } catch(err) {
        throw err
      }
      await Promise.all([
        unlink(filePath),
        unlink(uploadFilePath)
      ])
    }))
    it('should throw error when upload', done(async () => {
      const ossStorage = new OSSStorage({
        client,
        destination: async (req, file, oss) => {
          oss.putStream = async (fileFullPath, fileStream) => {
            throw new Error('upload error')
          }
          return ''
        }
      })
      await ossStorage._handleFile({}, { originalname: 'local.txt' }, err => expect(err).to.be.equal('Error: upload error'))
    }))
    it('should remove uploaded file', done(async () => {
      const ossStorage = new OSSStorage({
        client,
        destination: async (req, file, oss) => {
          oss.delete = async (fileFullPath, fileStream) => unlink(path.join(__dirname, fileFullPath))
          oss.putStream = async (fileFullPath, fileStream) => {}
          return ''
        }
      })
      // create mock file content
      const content = 'this is an upload test content in txt file'
      const originalname = 'local-remove.txt'
      const filePath = path.join(__dirname, originalname)
      await writeFile(filePath, content)
      const file = {
        stream: fs.createReadStream(filePath),
        originalname
      }
      await ossStorage._removeFile({}, file, () => { })
      try {
        await stat(filePath)
        throw new Error('unlink failed')
      } catch (err) {
        if (err.message === 'unlink failed') throw err
      }
    }))
    it('should throw error when remove', done(async () => {
      const ossStorage = new OSSStorage({
        client,
        filename: async (req, file, oss) => {
          oss.delete = async (fileFullPath, fileStream) => {
            throw new Error('remove error')
          }
          return file.originalname
        }
      })
      await ossStorage._removeFile({}, { originalname: 'local.txt' }, err => expect(err).to.be.equal('Error: remove error'))
    }))
  })
})
