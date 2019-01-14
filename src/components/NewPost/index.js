import React from 'react';
import FileUploader from 'react-firebase-file-uploader';

import cs from './styles.module.css';

const TYPE_IMAGE = 'image';
const TYPE_TEXT = 'text';
const TYPE_SONG = 'song';

const DEFAULT_STATE = {
  isUploading: false,
  progress: null,
  type: TYPE_IMAGE,
  spotifyRef: '',
  textPostValue: '',
};

class NewPost extends React.Component {
  state = DEFAULT_STATE;

  render () {
    const {storage, parentPostId} = this.props;
    const {isUploading, progress, type, spotifyRef, textPostValue} = this.state;

    return (
      <div className={cs.NewPost}>
        <h4>{parentPostId ? 'Reply to post' : 'New post'}</h4>
        <form className={cs.NewPostTypes}>
          <div>
            <input
              type="radio"
              checked={type === TYPE_IMAGE}
              onChange={() => {
                this.setState({type: TYPE_IMAGE});
              }}
            />{' '}
            image
          </div>
          <div>
            <input
              type="radio"
              checked={type === TYPE_TEXT}
              onChange={() => {
                this.setState({type: TYPE_TEXT});
              }}
            />{' '}
            text
          </div>
          <div>
            <input
              type="radio"
              checked={type === TYPE_SONG}
              onChange={() => {
                this.setState({type: TYPE_SONG});
              }}
            />{' '}
            song
          </div>
        </form>
        <br />
        {type === TYPE_IMAGE && (
          <div className={cs.NewPostUploader}>
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
          </div>
        )}
        {type === TYPE_TEXT && (
          <div>
            <textarea
              value={textPostValue}
              onChange={e => {
                this.setState({textPostValue: e.target.value});
              }}
            />
            <button onClick={this._onClickCreateText}>It is said</button>
          </div>
        )}
        {type === TYPE_SONG && (
          <>
            <input
              value={spotifyRef}
              onChange={e => {
                this.setState({spotifyRef: e.target.value});
              }}
              placeholder="spotify:track:6hkKwagiF3RncJdS8xfuwC"
            />
            <button onClick={this._onClickCreateSong}>rewind the tape</button>
          </>
        )}
      </div>
    );
  }

  _onUploadStart = () => this.setState({isUploading: true, progress: 0});
  _onProgress = progress => this.setState({progress});
  _onUploadError = error => {
    this.setState({isUploading: false});
    console.error(error);
  };
  _onUploadSuccess = filename => {
    const storageUrl = `gs://werm-pix.appspot.com/posts/${filename}`;

    this._createPost({
      storageUrl,
      type: TYPE_IMAGE,
    });
  };

  _onClickCreateSong = () => {
    const {spotifyRef} = this.state;

    this._createPost({
      spotifyRef,
      isProcessingComplete: true,
      type: TYPE_SONG,
    });
  };

  _onClickCreateText = () => {
    const {textPostValue} = this.state;

    this._createPost({
      text: textPostValue,
      isProcessingComplete: true,
      type: TYPE_TEXT,
    });
  };

  _createPost = postParams => {
    const {auth, db, groupIds, parentPostId} = this.props;

    const userDisplayName = auth.currentUser.displayName;
    const userId = auth.currentUser.uid;

    for (let i = 0; i < groupIds.length; i++) {
      let data = {
        groupId: groupIds[i],
        userDisplayName,
        userId,
        createdAt: new Date(),
        ...postParams,
      };

      if (parentPostId) {
        data.parentPostId = parentPostId;
      }

      db.collection('posts')
        .doc()
        .set(data);
    }

    this.setState({DEFAULT_STATE});
  };
}

export default NewPost;
