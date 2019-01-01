import React from 'react';
import FileUploader from 'react-firebase-file-uploader';

class NewPost extends React.Component {
  state = {
    isUploading: false,
    progress: null,
  };

  render () {
    const {storage} = this.props;
    const {isUploading, progress} = this.state;

    return (
      <>
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
      </>
    );
  }

  _onUploadStart = () => this.setState({isUploading: true, progress: 0});
  _onProgress = progress => this.setState({progress});
  _onUploadError = error => {
    this.setState({isUploading: false});
    console.error(error);
  };
  _onUploadSuccess = async filename => {
    const {auth, db, groupIds} = this.props;

    this.setState({progress: null, isUploading: false});

    const storageUrl = `gs://werm-pix.appspot.com/posts/${filename}`;

    const userDisplayName = auth.currentUser.displayName;
    const userId = auth.currentUser.uid;

    for (let i = 0; i < groupIds.length; i++) {
      await db
        .collection('posts')
        .doc()
        .set({
          groupId: groupIds[i],
          userDisplayName,
          userId,
          createdAt: new Date(),
          storageUrl,
        });
    }
  };
}

export default NewPost;
