import React, {Component} from 'react';
import firebase from 'firebase/app';
import 'firebase/storage';

import cs from './Post.module.css';

class Post extends Component {
  state = {
    downloadUrl: null,
  };

  async componentDidMount () {
    const {post, storage} = this.props;
    const downloadUrl = await storage.refFromURL(post.storageUrl).getDownloadURL();
    this.setState({downloadUrl});
  }

  render () {
    const {post} = this.props;
    const {downloadUrl} = this.state;

    return (
      <div className={cs.Post}>
        {post.isProcessingComplete ? (
          <img className={cs.PostImage} src={downloadUrl} />
        ) : (
          <span className={cs.PostProcessing}>Processing...</span>
        )}
      </div>
    );
  }
}

export default Post;
