import React, {Component} from 'react';
import firebase from 'firebase/app';
import 'firebase/storage';

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

    return <img width={400} src={downloadUrl} />;
  }
}

export default Post;
