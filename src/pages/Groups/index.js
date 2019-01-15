import React from 'react';
import {Link} from 'react-router-dom';

import cs from './styles.module.css';

class Groups extends React.Component {
  state = {
    groups: null,
  };

  componentDidMount () {
    this._listenToGroups();
  }

  render () {
    const {groups} = this.state;

    return (
      <div className={cs.Groups}>
        <h1>werm.world</h1>
        <img src={require('../../assets/logo.png')} alt="logo" height={60} />
        {groups ? (
          <div className={cs.GroupList}>
            <h4>Your groups</h4>
            {groups.map(g => (
              <div key={g.id} className={cs.GroupListItem}>
                <Link to={`/${g.id}`}>{g.name}</Link>
              </div>
            ))}
            <Link to="/newMultiPost">
              <button onClick={this._onClickPostMultiple}>Post to multiple</button>
            </Link>
            <br />
            <br />
            <button onClick={this._onClickCreateGroup}>Create a group</button>
          </div>
        ) : (
          <div>Loading...</div>
        )}
        <hr />
        <div className={cs.Announcements}>
          <h4>What's new?</h4>
          <ul>
            <li
              onClick={() =>
                alert(
                  'Songs + text posts. And no more notes. Try it out! You can attach new posts onto old ones to to create a train of posts choo chooooooooo'
                )
              }
            >
              <a href="#">Posts of all sorts!</a>
            </li>
            <li
              onClick={() =>
                alert(
                  'Now you can post to multiple groups at once. Click the "Post to multiple" button on the home screen.'
                )
              }
            >
              <a href="#">Post to multiple</a>
            </li>
            <li
              onClick={() =>
                alert(
                  'You can add werm.world to your home screen like an app. On iOS: in Safari, there is an icon at the bottom that looks like an arrow trying to get away from a square. Click it and then select "Add to Home Screen."'
                )
              }
            >
              <a href="#">Add to homescreen</a>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  _listenToGroups () {
    const {db, auth} = this.props;

    db.collection('groups')
      .where('userIds', 'array-contains', auth.currentUser.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        let groups = [];
        snapshot.forEach(doc => groups.push({id: doc.id, ...doc.data()}));
        this.setState({groups});
      });
  }

  _onClickCreateGroup = () => {
    const {db, auth} = this.props;

    const groupName = prompt('Enter new group name');

    db.collection('groups')
      .doc()
      .set({
        createdAt: new Date(),
        name: groupName,
        userIds: [auth.currentUser.uid],
      });
  };
}

export default Groups;
