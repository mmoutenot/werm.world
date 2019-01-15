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
        const fontSize = Math.min(14 + 400 / post.text.length, 100);
        content = (
          <div className={cs.PostText} style={{fontSize}}>
            {post.text}
          </div>
        );
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
}

export default Post;
