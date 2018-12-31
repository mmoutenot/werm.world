const admin = require('firebase-admin');
var config = {
  apiKey: 'AIzaSyDmmyClhlagKmtWozeb15QkABbdBQIYvbc',
  authDomain: 'werm-pix.firebaseapp.com',
  databaseURL: 'https://werm-pix.firebaseio.com',
  projectId: 'werm-pix',
  storageBucket: 'werm-pix.appspot.com',
  messagingSenderId: '512147999490',
};
admin.initializeApp(config);

const db = admin.firestore();
const filePath = '/posts/276eb8b0-c7a4-483b-aee4-2b4e85f5d630.jpg';
const settings = {timestampsInSnapshots: true};
db.settings(settings);

return db
  .collection('posts')
  .where('storageUrl', '==', `gs://werm-pix.appspot.com/${filePath}`)
  .select()
  .get()
  .then(snapshot => {
    console.log(snapshot);
  });
