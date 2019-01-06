# multer-oss

[![](https://img.shields.io/badge/Powered%20by-ganjiang-brightgreen.svg)](https://github.com/taozhi8833998/multer-oss)
[![Build Status](https://travis-ci.org/taozhi8833998/multer-oss.svg?branch=master)](https://travis-ci.org/taozhi8833998/multer-oss)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/taozhi8833998/multer-oss/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/multer-oss-new.svg)](https://badge.fury.io/js/multer-oss-new)
[![NPM downloads](http://img.shields.io/npm/dm/multer-oss-new.svg?style=flat-square)](http://www.npmtrends.com/multer-oss-new)
[![Coverage Status](https://img.shields.io/coveralls/github/taozhi8833998/multer-oss/master.svg)](https://coveralls.io/github/taozhi8833998/multer-oss?branch=master)
[![Dependencies](https://img.shields.io/david/taozhi8833998/multer-oss.svg)](https://img.shields.io/david/taozhi8833998/multer-oss)
[![issues](https://img.shields.io/github/issues/taozhi8833998/multer-oss.svg)](https://github.com/taozhi8833998/multer-oss/issues)


**multer upload files to aliyun oss directly.**

## :star: Features

- support upload files to [oss](https://www.aliyun.com/product/oss)
- support es7 features async and await

## :: Install

```bash
npm install multer-oss-new
```
## :rocket: Usage

### init oss storage

```javascript
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
  }
})
```

if you already have an oss client, you can pass it to opt directly

```javascript
const OSS = require('ali-oss')
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
const app = express()
const server = http.createServer(app)
const OSSStorage = require('multer-oss-new')
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

