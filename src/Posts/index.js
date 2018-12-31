import React from 'react';
import FileUploader from 'react-firebase-file-uploader';
import {Link} from 'react-router-dom';
import firebase from 'firebase/app';

import Post from './Post';
import cs from './styles.module.css';

class Posts extends React.Component {
  state = {
    group: null,
    posts: null,
    isUploading: false,
    progress: null,
  };

  componentDidMount () {
    this._listenToGroup();
    this._listenToPosts();
  }

  _renderJoinGroup () {
    const {group, auth} = this.props;
    const isUserInGroup = group.userIds.indexOf(auth.currentUser.uid) > -1;
    if (isUserInGroup) {
      return;
    }

    return <button onClick={this._onClickJoinGroup}>join group</button>;
  }

  render () {
    const {storage, db, auth} = this.props;
    const {group, posts, isUploading, progress} = this.state;

    return (
      <div className={cs.Posts}>
        <h1>
          <Link to="/">werm.world</Link>/{group ? group.name : '-----'}
        </h1>
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
        <div className={cs.PostList}>
          {posts &&
            posts.map(p => <Post key={p.id} post={p} storage={storage} db={db} auth={auth} />)}
        </div>
      </div>
    );
  }

  _listenToGroup () {
    const {db, groupId} = this.props;

    db.collection('groups')
      .doc(groupId)
      .get()
      .then(doc => this.setState({group: {id: doc.id, ...doc.data()}}));
  }

  _listenToPosts () {
    const {db, groupId} = this.props;

    db.collection('posts')
      .where('groupId', '==', groupId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        let posts = [];
        snapshot.forEach(doc => posts.push({id: doc.id, ...doc.data()}));
        this.setState({posts});
      });
  }

  _onClickJoinGroup = () => {
    const {groupId, db, auth} = this.props;

    db.collection('group')
      .doc(groupId)
      .update({
        userIds: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid),
      });
  };

  _onUploadStart = () => this.setState({isUploading: true, progress: 0});
  _onProgress = progress => this.setState({progress});
  _onUploadError = error => {
    this.setState({isUploading: false});
    console.error(error);
  };
  _onUploadSuccess = async filename => {
    const {auth, db, groupId} = this.props;

    this.setState({progress: null, isUploading: false});

    const storageUrl = `gs://werm-pix.appspot.com/posts/${filename}`;

    const userDisplayName = auth.currentUser.displayName;
    const userId = auth.currentUser.uid;

    await db
      .collection('posts')
      .doc()
      .set({
        groupId,
        userDisplayName,
        userId,
        createdAt: new Date(),
        storageUrl,
      });
  };
}

export default Posts;
