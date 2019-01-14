import React from 'react';
import {Link} from 'react-router-dom';
import firebase from 'firebase/app';

import NewPost from '../../components/NewPost';
import Post from './Post';
import cs from './styles.module.css';

class Posts extends React.Component {
  state = {
    group: null,
    isJoiningGroup: false,

    posts: null,

    postCursor: 5,

    addPostToParentPostId: null,
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
    const {isJoiningGroup} = this.state;

    return (
      <div style={{marginBottom: 20}}>
        {isJoiningGroup ? (
          <span>Joining...</span>
        ) : (
          <button onClick={this._onClickJoinGroup}>Join group</button>
        )}
      </div>
    );
  }

  render () {
    const {storage, db, auth} = this.props;
    const {group, posts, postCursor, addPostToParentPostId} = this.state;

    const isUserInGroup = group && group.userIds.indexOf(auth.currentUser.uid) > -1;

    return (
      <div className={cs.Posts}>
        <h1>
          <Link to="/">werm.world</Link>/{group ? group.name : '-----'}
        </h1>
        {group && !isUserInGroup && this._renderJoinGroup()}
        {group && isUserInGroup && (
          <NewPost auth={auth} db={db} storage={storage} groupIds={[group.id]} />
        )}
        <div className={cs.PostList}>
          {posts &&
            posts.slice(0, postCursor).map(p => {
              return (
                <div key={p.id} className={cs.PostFamily}>
                  <Post key={p.id} post={p} storage={storage} db={db} auth={auth} />
                  {p.childPosts &&
                    p.childPosts.map(childPost => (
                      <Post
                        key={childPost.id}
                        post={childPost}
                        storage={storage}
                        db={db}
                        auth={auth}
                      />
                    ))}
                  {addPostToParentPostId === p.id ? (
                    <NewPost
                      auth={auth}
                      db={db}
                      storage={storage}
                      groupIds={[group.id]}
                      parentPostId={addPostToParentPostId}
                    />
                  ) : (
                    <button
                      className={cs.PostFamilyAddPostButton}
                      onClick={() => {
                        this.setState({addPostToParentPostId: p.id});
                      }}
                    >
                      Respond
                    </button>
                  )}
                </div>
              );
            })}
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
      .orderBy('createdAt', 'asc')
      .onSnapshot(snapshot => {
        let postsById = {};
        snapshot.forEach(doc => {
          const post = {id: doc.id, ...doc.data()};
          if (post.parentPostId) {
            const parentPost = postsById[post.parentPostId] || {};
            const existingChildPosts = parentPost.childPosts || [];
            postsById[post.parentPostId] = {
              ...parentPost,
              childPosts: [...existingChildPosts, post],
            };
          } else {
            postsById[doc.id] = {...postsById[doc.id], ...post};
          }
        });
        const posts = Object.values(postsById).reverse();
        console.log(posts);
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
}

export default Posts;
