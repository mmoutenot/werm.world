import React, {Component} from 'react';
import firebase from 'firebase/app';
import 'firebase/storage';
import moment from 'moment';

import cs from './Post.module.css';

class Post extends Component {
  state = {
    notes: null,
    downloadUrl: null,
    isMouseOver: true,
    // hasUnreadNotes: false,
  };

  async componentDidMount () {
    const {post, storage} = this.props;

    // this._listenToNotes();

    if (post.type === 'image') {
      const downloadUrl = await storage.refFromURL(post.storageUrl).getDownloadURL();
      this.setState({downloadUrl});
    }
  }

  // _renderNotes () {
  //   const {notes} = this.state;

  //   this._markNotesAsSeen();

  //   return (
  //     <div className={cs.PostNotes}>
  //       <button onClick={this._onAddNoteClick}>Add note</button>
  //       {notes ? (
  //         notes.map(n => (
  //           <p key={n.id}>
  //             {n.text}
  //             <br />~ <b>{n.userDisplayName}</b> {moment(n.createdAt.toDate()).fromNow()}
  //           </p>
  //         ))
  //       ) : (
  //         <p>Loading notes...</p>
  //       )}
  //     </div>
  //   );
  // }

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
      <div className={cs.Post} onMouseEnter={this._onMouseEnter} onMouseLeave={this._onMouseLeave}>
        {content}
        <div className={cs.PostCredit}>
          {/* {hasUnreadNotes && <div className={cs.UnreadNote} />} */}
          <b>{post.userDisplayName}</b> - {moment(post.createdAt.toDate()).format('l')}
          {/* <div className={cs.PostCreditNoteCount}>
            {notes
              ? `${notes.length} note${notes.length > 1 || notes.length == 0 ? 's' : ''}`
              : '- notes'}
          </div> */}
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

  _onMouseEnter = () => {
    this.setState({isMouseOver: true});
  };

  _onMouseLeave = () => {
    this.setState({isMouseOver: false});
  };

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
