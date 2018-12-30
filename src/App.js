import React, {Component} from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
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
const auth = firebase.auth();
const storage = firebase.storage();
const db = firebase.firestore();
const settings = {timestampsInSnapshots: true};
db.settings(settings);

const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInSuccessUrl: '/',
  // We will display Google and Facebook as auth providers.
  signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
};

class App extends Component {
  state = {
    posts: null,
    isUploading: false,
    progress: null,
    isLoadingUser: true,
  };

  componentDidMount () {
    this._listenToPosts();
    this._listenToAuth();
  }

  _renderAuth () {
    return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />;
  }

  _renderPosts () {
    const {posts, isUploading, progress} = this.state;

    return (
      <div className={cs.App}>
        <h1>wermpix</h1>
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
        <div className={cs.AppPosts}>
          {posts &&
            posts.map(p => <Post key={p.id} post={p} storage={storage} db={db} auth={auth} />)}
        </div>
      </div>
    );
  }

  render () {
    const {user, isLoadingUser} = this.state;

    if (!isLoadingUser && !user) {
      return this._renderAuth();
    } else {
      return this._renderPosts();
    }
  }

  _listenToPosts () {
    db.collection('posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        let posts = [];
        snapshot.forEach(doc => posts.push({id: doc.id, ...doc.data()}));
        this.setState({posts});
      });
  }

  _listenToAuth () {
    auth.onAuthStateChanged(user => {
      if (user) {
        this.setState({user, isLoadingUser: false});
      } else {
        this.setState({user: null, isLoadingUser: false});
      }
    });
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

    const userDisplayName = auth.currentUser.displayName;
    const userId = auth.currentUser.uid;

    await db
      .collection('posts')
      .doc()
      .set({
        userDisplayName,
        userId,
        createdAt: new Date(),
        storageUrl,
      });
  };
}

export default App;
