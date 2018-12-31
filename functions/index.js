const functions = require('firebase-functions');
const path = require('path');
const os = require('os');
const fs = require('fs');
const mkdirp = require('mkdirp-promise');

const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const gcs = require('@google-cloud/storage')();
const {spawn} = require('child-process-promise');

exports.processImage = functions.storage.object().onFinalize(object => {
  const filePath = object.name;
  const bucketName = object.bucket;
  const metadata = object.metadata;

  const tempLocalFile = path.join(os.tmpdir(), filePath);
  const tempLocalDir = path.dirname(tempLocalFile);
  const bucket = gcs.bucket(bucketName);

  if (!object.contentType.startsWith('image/')) {
    console.log('This is not an image.');
    return null;
  }

  if (metadata.autoOrient) {
    console.log('This is already rotated');
    return null;
  }

  return mkdirp(tempLocalDir)
    .then(() => {
      // Download file from bucket.
      return bucket.file(filePath).download({destination: tempLocalFile});
    })
    .then(() => {
      console.log('The file has been downloaded to', tempLocalFile);
      // Convert the image using ImageMagick.
      return spawn('convert', [
        tempLocalFile,
        '-auto-orient',
        '-quality',
        '75',
        '-resize',
        '1200x1200>',
        tempLocalFile,
      ]);
    })
    .then(() => {
      console.log('rotated image created at', tempLocalFile);
      metadata.autoOrient = true;
      return bucket.upload(tempLocalFile, {
        destination: filePath,
        metadata: {metadata: metadata},
      });
    })
    .then(() => {
      console.log('image uploaded to Storage at', filePath);
      // Once the image has been converted delete the local files to free up disk space.
      fs.unlinkSync(tempLocalFile);
      console.log('Deleted local file', filePath);

      // mark post document as done processing
      return db
        .collection('posts')
        .where('storageUrl', '==', `gs://werm-pix.appspot.com/${filePath}`)
        .select()
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            const ref = db.collection('posts').doc(doc.id);
            ref.update({isProcessingComplete: true});
          });
        });
    });
});
