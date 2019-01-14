import React from 'react';
import {Link} from 'react-router-dom';

import NewPost from '../../components/NewPost';
import cs from './styles.module.css';

class NewMultiPost extends React.Component {
  state = {
    groups: null,
    isCheckedByGroupId: {},
  };

  componentDidMount () {
    this._listenToGroups();
  }

  render () {
    const {auth, storage, db} = this.props;
    const {groups, isCheckedByGroupId} = this.state;

    const selectedGroupIds = Object.keys(isCheckedByGroupId).filter(
      groupId => isCheckedByGroupId[groupId]
    );

    return (
      <div className={cs.NewMultiPost}>
        <h1>
          <Link to="/">werm.world</Link>
        </h1>
        <img src={require('../../assets/logo.png')} alt="logo" height={60} />
        {groups ? (
          <div className={cs.GroupList}>
            <h4>Select groups for post</h4>
            <form>
              {groups.map(g => (
                <div
                  key={g.id}
                  className={cs.GroupCheckboxItem}
                  onClick={() => {
                    this.setState({
                      isCheckedByGroupId: {
                        ...isCheckedByGroupId,
                        [g.id]: !isCheckedByGroupId[g.id],
                      },
                    });
                  }}
                >
                  <input
                    type="checkbox"
                    name={g.id}
                    value={g.id}
                    checked={isCheckedByGroupId[g.id] || false}
                    readOnly
                  />
                  {g.name}
                </div>
              ))}
            </form>
            {selectedGroupIds.length > 0 && (
              <NewPost auth={auth} db={db} storage={storage} groupIds={selectedGroupIds} />
            )}
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
}

export default NewMultiPost;
