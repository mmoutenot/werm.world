import React, {Component} from 'react';
import firebase from 'firebase/app';
import 'firebase/storage';
import moment from 'moment';

import cs from './Post.module.css';
import {not} from 'ip';

class Post extends Component {
  state = {
    notes: null,
    downloadUrl: null,
    isMouseOver: false,
  };

  async componentDidMount () {
    const {post, storage} = this.props;

    this._listenToNotes();

    const downloadUrl = await storage.refFromURL(post.storageUrl).getDownloadURL();
    this.setState({downloadUrl});
  }

  _renderNotes () {
    const {post} = this.props;
    const {notes} = this.state;

    return (
      <div className={cs.PostNotes}>
        <button onClick={this._onAddNoteClick}>Add note</button>
        {notes ? (
          notes.map(n => (
            <p key={n.id}>
              {n.text}
              <br />~ <b>{n.userDisplayName}</b>
            </p>
          ))
        ) : (
          <p>Loading notes...</p>
        )}
      </div>
    );
  }

  render () {
    const {post} = this.props;
    const {downloadUrl, isMouseOver} = this.state;

    let content;
    if (post.isProcessingComplete) {
      content = (
        <div className={cs.PostImage}>
          {isMouseOver && this._renderNotes()}
          <img src={downloadUrl} />
        </div>
      );
    } else {
      content = <span className={cs.PostProcessing}>Processing...</span>;
    }

    return (
      <div className={cs.Post} onMouseEnter={this._onMouseEnter} onMouseLeave={this._onMouseLeave}>
        {content}
      </div>
    );
  }

  _listenToNotes () {
    const {post, db} = this.props;
    db.collection(`posts/${post.id}/notes`)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        let notes = [];
        snapshot.forEach(doc => notes.push({id: doc.id, ...doc.data()}));
        this.setState({notes});
      });
  }

  _onMouseEnter = () => {
    this.setState({isMouseOver: true});
  };

  _onMouseLeave = () => {
    this.setState({isMouseOver: false});
  };

  _onAddNoteClick = () => {
    const {post, db, auth} = this.props;

    const text = prompt('Enter your note');
    const userDisplayName = auth.currentUser.displayName;
    const userId = auth.currentUser.uid;

    db.collection(`posts/${post.id}/notes`)
      .doc()
      .set({
        createdAt: new Date(),
        userDisplayName,
        userId,
        text,
      });
  };
}

export default Post;
