require('dotenv/config')
const express = require('express')
const multer = require('multer')
const cors = require('cors')
const AWS = require('aws-sdk')
const { uuid } = require('uuidv4')

const app = express()
const port = process.env.PORT || 4000

app.use(cors())

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
})

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, '')
  },
})

const upload = multer({ storage }).single('file')

app.post('/upload', upload, (req, res) => {
  let myFile = req.file.originalname.split('.')
  const fileType = myFile[myFile.length - 1]
  console.log(fileType)
  console.log(req.file)
  if (req.file.size > 50000000) {
    res.status(400).json({ message: 'Video can upload upto 50mb only' })
  } else if (fileType !== 'mp4') {
    res.status(400).json({ message: 'You can upload videos only' })
  } else {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuid()}.${fileType}`,
      Body: req.file.buffer,
    }
    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err)
        res.status(500).send(err)
      }
      console.log(data)
      res.status(200).send(data)
    })
  }
})

app.listen(port, () => {
  console.log(`server is up at ${port}`)
})
