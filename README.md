# multer-oss

[![Build Status](https://travis-ci.org/taozhi8833998/multer-oss.svg?branch=master)](https://travis-ci.org/taozhi8833998/multer-oss)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ca77da4f464c44e18f3cf057d9fe24f5)](https://app.codacy.com/app/taozhi8833998/multer-oss?utm_source=github.com&utm_medium=referral&utm_content=taozhi8833998/multer-oss&utm_campaign=Badge_Grade_Dashboard)
[![Coverage Status](https://img.shields.io/coveralls/github/taozhi8833998/multer-oss/master.svg)](https://coveralls.io/github/taozhi8833998/multer-oss?branch=master)
[![Dependencies](https://img.shields.io/david/taozhi8833998/multer-oss.svg)](https://img.shields.io/david/taozhi8833998/multer-oss)
[![Known Vulnerabilities](https://snyk.io/test/github/taozhi8833998/multer-oss/badge.svg?targetFile=package.json)](https://snyk.io/test/github/taozhi8833998/multer-oss?targetFile=package.json)
[![](https://img.shields.io/badge/Powered%20by-ganjiang-brightgreen.svg)](https://github.com/taozhi8833998/multer-oss)


[![npm version](https://badge.fury.io/js/multer-oss-new.svg)](https://badge.fury.io/js/multer-oss-new)
[![NPM downloads](http://img.shields.io/npm/dm/multer-oss-new.svg?style=flat-square)](http://www.npmtrends.com/multer-oss-new)

[![issues](https://img.shields.io/github/issues/taozhi8833998/multer-oss.svg)](https://github.com/taozhi8833998/multer-oss/issues)


[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/taozhi8833998/multer-oss/blob/master/LICENSE)

**multer upload files to aliyun oss directly.**

## :star: Features

- support upload files to [oss](https://www.aliyun.com/product/oss)
- support reduce *jpeg*, *jpg* and *png* size automatically
- support es7 features async and await
- support compressed by gzip by default

## :tada: Install

```bash
npm install multer-oss-new
```
## :rocket: Usage

### init oss storage

```javascript
const OSSStorage = require('multer-oss-new')
const zlib = require('zlib')
const storage = new OSSStorage({
  oss: { // required
    region: 'oss-region',
    internal: false,
    accessKeyId: 'access-key-id',
    accessKeySecret: 'access-key-secret',
    bucket: 'bucket'
  },
  destination: async (req, file, ossClient) => {
    return '' // return destination folder path, optional,  '' is default value
  },
  filename: async (req, file, ossClient) => {
    return file.originalname // return file name, optional, file.originalname is default value
  },
  stream: async (req, file, ossClient) => {
    return file.stream.pipe(zlib.createGzip()) // compress strem in gzip
  },
  options: async (req, file, ossClient) => { // read more https://www.npmjs.com/package/ali-oss#putstreamname-stream-options
    return {
      contentLength: file.size,
      headers: {
        'Content-Encoding': gzip, // if your stream is not in gzip format, please overriden this
        'Content-Disposition': file.originalname,
        'Expires': 3600000 // in ms
      }
    }
  }
})
```

if you already have an oss client, you can pass it to opt directly

```javascript
const OSS = require('ali-oss')
const OSSStorage = require('multer-oss-new')
const zlib = require('zlib')

const ossClient = new OSS({
  region: 'oss-region',
  internal: false,
  accessKeyId: 'access-key-id',
  accessKeySecret: 'access-key-secret',
  bucket: 'bucket'
})
const storage = new OSSStorage({
  client: ossClient, // using oss client that already exists
  destination: async (req, file, ossClient) => {
    return '' // return destination folder path, optional,  '' is default value
  },
  filename: async (req, file, ossClient) => {
    return file.originalname // return file name, optional, file.originalname is default value
  },
  stream: async (req, file, ossClient) => {
    return file.stream.pipe(zlib.createGzip()) // compress strem in gzip
  },
  options: async (req, file, ossClient) => { // read more https://www.npmjs.com/package/ali-oss#putstreamname-stream-options
    return {
      contentLength: file.size,
      headers: {
        'Content-Encoding': gzip,
        'Expires': 3600000 // in ms
      }
    }
  }
})
```

## :kissing_heart: Full Examples

Full examples for using multer-oss with express, multer

```javascript
const bodyParser = require('body-parser')
const express = require('express')
const http = require('http')
const multer = require('multer')
const OSSStorage = require('multer-oss-new')
const zlib = require('zlib')
const app = express()
const server = http.createServer(app)
const storage = new OSSStorage({
  oss: { // required
    region: 'oss-region',
    internal: false,
    accessKeyId: 'access-key-id',
    accessKeySecret: 'access-key-secret',
    bucket: 'bucket' // you could using all oss option in ali-oss pacakge
  },
  destination: async (req, file, ossClient) => {
    return '' // return destination folder path, optional,  '' is default value
  },
  filename: async (req, file, ossClient) => {
    return file.originalname // return file name, optional, file.originalname is default value
  },
  stream: async (req, file, ossClient) => {
    return file.stream.pipe(zlib.createGzip()) // compress strem in gzip
  },
  options: async (req, file, ossClient) => {
    return {
      contentLength: file.size,
      headers: {
        'Content-Encoding': gzip,
        'Expires': 3600000 // in ms
      }
    }
  }
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/upload', multer({ storage })) // for more multer usage, you could refrence multer document
app.use((error, req, res, next) => {
  res.status(500).json({isError: true, error})
})
app.use((req, res) => {
  return res.status(404).json({isError: true, error: 'Router NOT FOUNDED'})
})
server.listen(8000, err => {
  if(err) return console.error('app start failed')
  console.info('app start at 8000')
})
```

## License

[MIT](LICENSE)