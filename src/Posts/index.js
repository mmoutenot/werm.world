import React from 'react';
import FileUploader from 'react-firebase-file-uploader';
import {Link} from 'react-router-dom';
import firebase from 'firebase/app';

import Post from './Post';
import cs from './styles.module.css';

class Posts extends React.Component {
  state = {
    group: null,
    isJoiningGroup: false,

    posts: null,
    isUploading: false,
    progress: null,

    postCursor: 5,
  };

  componentDidMount () {
    this._unsubscribeToGroup = this._listenToGroup();
    this._unsubscribeToPosts = this._listenToPosts();

    if (window) {
      window.onscroll = this._onScroll;
    }
  }

  componentWillUnmount () {
    if (this._unsubscribeToGroup) {
      this._unsubscribeToGroup();
    }

    if (this._unsubscribeToPosts) {
      this._unsubscribeToPosts();
    }
  }

  _renderJoinGroup () {
    const {auth} = this.props;
    const {group, isJoiningGroup} = this.state;

    const isUserInGroup = group.userIds.indexOf(auth.currentUser.uid) > -1;
    if (isUserInGroup) {
      return;
    }

    return (
      <div style={{marginBottom: 20}}>
        {isJoiningGroup ? (
          <span>Joining...</span>
        ) : (
          <button onClick={this._onClickJoinGroup}>
            <h4>join group</h4>
          </button>
        )}
      </div>
    );
  }

  render () {
    const {storage, db, auth} = this.props;
    const {group, posts, postCursor, isUploading, progress} = this.state;

    return (
      <div className={cs.Posts}>
        <h1>
          <Link to="/">werm.world</Link>/{group ? group.name : '-----'}
        </h1>
        {group && this._renderJoinGroup()}
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
            posts
              .slice(0, postCursor)
              .map(p => <Post key={p.id} post={p} storage={storage} db={db} auth={auth} />)}
        </div>

        <div>~ that is all ~</div>
      </div>
    );
  }

  _listenToGroup () {
    const {db, groupId} = this.props;

    return db
      .collection('groups')
      .doc(groupId)
      .onSnapshot(doc => this.setState({group: {id: doc.id, ...doc.data()}}));
  }

  _listenToPosts () {
    const {db, groupId} = this.props;

    return db
      .collection('posts')
      .where('groupId', '==', groupId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        let posts = [];
        snapshot.forEach(doc => posts.push({id: doc.id, ...doc.data()}));
        this.setState({posts});
      });
  }

  _onScroll = () => {
    const {posts, postCursor} = this.state;
    if (posts.length <= postCursor) {
      return;
    }

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      this.setState({postCursor: postCursor + 5});
    }
  };

  _onClickJoinGroup = () => {
    const {groupId, db, auth} = this.props;

    this.setState({isJoiningGroup: true});

    db.collection('groups')
      .doc(groupId)
      .update({
        userIds: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid),
      })
      .then(() => {
        this.setState({isJoiningGroup: false});
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
