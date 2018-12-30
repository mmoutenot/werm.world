import React, {Component} from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import FileUploader from 'react-firebase-file-uploader';

import Post from './Post';
import cs from './App.module.css';

var config = {
  apiKey: 'AIzaSyDmmyClhlagKmtWozeb15QkABbdBQIYvbc',
  authDomain: 'werm-pix.firebaseapp.com',
  databaseURL: 'https://werm-pix.firebaseio.com',
  projectId: 'werm-pix',
  storageBucket: 'werm-pix.appspot.com',
  messagingSenderId: '512147999490',
};
firebase.initializeApp(config);
const storage = firebase.storage();
const db = firebase.firestore();
const settings = {timestampsInSnapshots: true};
db.settings(settings);

class App extends Component {
  state = {
    posts: null,
    isUploading: false,
    progress: null,
  };

  componentDidMount () {
    this._listPosts();
  }

  render () {
    const {posts, isUploading, progress} = this.state;

    return (
      <div>
        <h1>wermpix</h1>
        <div>
          <ul>
            <li>upload pix</li>
          </ul>
        </div>
        <FileUploader
          accept="image/*"
          name="post"
          randomizeFilename
          storageRef={storage.ref('posts')}
          onUploadStart={this._onUploadStart}
          onUploadError={this._onUploadError}
          onUploadSuccess={this._onUploadSuccess}
          onProgress={this._onProgress}
        />
        {isUploading && <p>Progress: {progress}</p>}
        <div>{posts && posts.map(p => <Post key={p.id} post={p} storage={storage} />)}</div>
      </div>
    );
  }

  async _listPosts () {
    const querySnapshot = await db.collection('posts').get();
    let posts = [];
    querySnapshot.forEach(doc => posts.push({id: doc.id, ...doc.data()}));
    this.setState({posts});
  }

  _onUploadStart = () => this.setState({isUploading: true, progress: 0});
  _onProgress = progress => this.setState({progress});
  _onUploadError = error => {
    this.setState({isUploading: false});
    console.error(error);
  };
  _onUploadSuccess = async filename => {
    this.setState({progress: null, isUploading: false});

    const storageUrl = `gs://werm-pix.appspot.com/posts/${filename}`;

    await db
      .collection('posts')
      .doc()
      .set({
        createdAt: new Date(),
        storageUrl,
      });

    this._listPosts();
  };
}

export default App;
