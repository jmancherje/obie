const fs = require('fs');
const multer = require('multer');
const Jimp = require('jimp');
const AWS = require('aws-sdk');
const Promise = require('bluebird');
const multiParty = require('connect-multiparty'),
    multiPartyMiddleware = multiParty();

const S3FS = require('s3fs')
const s3fsImp1 = new S3FS(process.env.BUCKET_NAME, {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

AWS.config.update({region: 'us-east-1'});

const s3 = new AWS.S3();

// var fs = require('fs');
// var zlib = require('zlib');

// var body = fs.createReadStream('bigfile').pipe(zlib.createGzip());
// var s3obj = new AWS.S3({params: {Bucket: 'myBucket', Key: 'myKey'}});
// s3obj.upload({Body: body}).
//   on('httpUploadProgress', function(evt) { console.log(evt); }).
//   send(function(err, data) { console.log(err, data) });

module.exports = (app, express) => {
  // app.use(multiPartyMiddleware)

  app.post('/upload', multer().single('image'), (req, res) => {
    const file = req.file;
    console.log('')
    // const files = req.files;
    console.log('file? ', file);
    // console.log('files?', files);

    return Jimp.read(file.buffer).then(function(image) {
      console.log('got image!', image);
      return new Promise(function(resolve, reject){
        image.clone()
          .resize(500, Jimp.AUTO)
          .crop(100, 100, 100, 100)
          // .quality(60)
          .getBuffer(file.mimetype, function(err, buffer) {
            if (err) {
              console.log('error getting buffer?')
              reject(err);
            } else {
              console.log('got buffer!!!!', buffer)
              resolve(buffer);
            }
          })
      })
    })
    .then(function(buffer) {
      console.log('got buffer? ', buffer);
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: file.originalname,
        ACL: 'public-read',
        ContentType: file.mimetype,
        Body: buffer
        // Body: image.bitmap.data
      };

      // s3.putObject(params, function(err, data) {
      //   if (err) {
      //   } else {
      //   }
      // })

      return new Promise(function(resolve, reject) {
        s3.putObject(params, function(err, data) {
          res.sendStatus(200);
          return;
          if (err) {
            console.error('error uploading: ', err)
            reject(err);
          } else {
            console.log('uploaded.. ', data);
            resolve(data);
          }
        });
      });


      // const s3obj = new AWS.S3({ params: params });
      // s3obj.upload({ Body: image })
      //   .on('httpUploadProgress', function(evt) {
      //     console.log('upload progress..', evt);
      //   })
      //   .send(function(err, data) {
      //     if (err) {
      //       console.error(err);
      //     } else {
      //       console.log('successfully uploaded to S3', data);
      //     }
      //   })
      // return s3fsImp1.writeFile(file.name, image.bitmap.data)
      //   .then(() => {
      //     console.log('actually uploaded photo... ')
      //     res.sendStatus(200);
      //   })
    })
    .then(function(something) {
      console.log('successfully uploaded image', something)
      res.sendStatus(200)
    })
    .catch(function(error) {
      console.log('failed up upload image..', error)
      res.sendStatus(500);
    })


    // const fileCount = Object.keys(req.files).length;
    // var fileUploadCount = 0;
    // const fileLinks = [];
    // for (var file in files) {
    //   ((file) => {
    //     const stream = fs.createReadStream(file.path);
    //     const uri = 'https://s3.amazonaws.com/' + process.env.BUCKET_NAME + '/' + encodeURI(file.originalFilename);
    //     s3fsImp1.writeFile(file.name, stream).then(() => {
    //       fileUploadCount++;
    //       fileLinks.push(uri);
    //       fs.unlink(file.path, (err) => {
    //         if (err) {
    //           console.error(err);
    //           res.send(400);
    //         }
    //       });
    //       if (fileUploadCount === fileCount) {
    //         res.json(fileLinks).status(200);
    //       }
    //     });
    //   })(files[file])
    // }
  })
}