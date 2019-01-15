import React, {Component} from 'react';
import firebase from 'firebase/app';
import 'firebase/storage';
import moment from 'moment';

import cs from './Post.module.css';

class Post extends Component {
  state = {
    notes: null,
    downloadUrl: null,
  };

  async componentDidMount () {
    const {post, storage} = this.props;

    if (post.type === 'image') {
      const downloadUrl = await storage.refFromURL(post.storageUrl).getDownloadURL();
      this.setState({downloadUrl});
    }
  }

  render () {
    const {post} = this.props;
    const {downloadUrl} = this.state;

    let content;
    if (post.isProcessingComplete) {
      if (post.type === 'image') {
        content = (
          <div className={cs.PostImage} onClick={() => window.open(downloadUrl)}>
            <img src={downloadUrl} />
          </div>
        );
      } else if (post.type === 'song') {
        content = (
          <iframe
            src={`https://open.spotify.com/embed/${post.spotifyRef
              .split(':')
              .slice(1)
              .join('/')}`}
            width={400}
            height={400}
            frameborder="0"
            allowtransparency="true"
            allow="encrypted-media"
          />
        );
      } else if (post.type === 'text') {
        content = <div className={cs.PostText}>{post.text}</div>;
      }
    } else {
      content = <span className={cs.PostProcessing}>Processing...</span>;
    }

    return (
      <div className={cs.Post}>
        {content}
        <div className={cs.PostCredit}>
          <b>{post.userDisplayName}</b> - {moment(post.createdAt.toDate()).format('l')}
        </div>
      </div>
    );
  }

  _listenToNotes () {
    const {post, db, auth} = this.props;

    const userId = auth.currentUser.uid;

    db.collection(`posts/${post.id}/notes`)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        let notes = [];
        let hasUnreadNotes = false;
        snapshot.forEach(doc => {
          let note = {id: doc.id, ...doc.data()};

          if (!note.seenByUserIds || note.seenByUserIds.indexOf(userId) === -1) {
            note.isUnread = true;
            hasUnreadNotes = true;
          }
          notes.push(note);
        });
        this.setState({notes, hasUnreadNotes});
      });
  }

  _onAddNoteClick = () => {
    const {post, db, auth} = this.props;

    const text = prompt('Enter your note');

    if (!text || !text.length) {
      return;
    }

    const userDisplayName = auth.currentUser.displayName;
    const userId = auth.currentUser.uid;

    db.collection(`posts/${post.id}/notes`)
      .doc()
      .set({
        createdAt: new Date(),
        userDisplayName,
        userId,
        text,
        seenByUserIds: [userId],
      });
  };

  _markNotesAsSeen = () => {
    const {post, db, auth} = this.props;
    const {notes} = this.state;

    const userId = auth.currentUser.uid;

    if (notes && notes.length > 0) {
      notes.forEach(n => {
        db.collection(`posts/${post.id}/notes`)
          .doc(n.id)
          .update({
            seenByUserIds: firebase.firestore.FieldValue.arrayUnion(userId),
          });
      });
    }
  };
}

export default Post;
