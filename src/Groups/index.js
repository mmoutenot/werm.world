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
        <img src={require('./logo.png')} alt="logo" height={60} />
        {groups ? (
          <div className={cs.GroupList}>
            <h4>Your groups</h4>
            {groups.map(g => (
              <div key={g.id} className={cs.GroupListItem}>
                <Link to={`/${g.id}`}>{g.name}</Link>
              </div>
            ))}
            <button onClick={this._onClickCreateGroup}>Create a group</button>
          </div>
        ) : (
          <span>Loading...</span>
        )}
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
