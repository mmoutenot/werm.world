import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import Posts from './pages/Posts';
import Groups from './pages/Groups';
import NewMultiPost from './pages/NewMultiPost';
import * as serviceWorker from './serviceWorker';
import 'typeface-roboto-mono';
import './index.css';

var config = {
  apiKey: 'AIzaSyDmmyClhlagKmtWozeb15QkABbdBQIYvbc',
  authDomain: 'werm-pix.firebaseapp.com',
  databaseURL: 'https://werm-pix.firebaseio.com',
  projectId: 'werm-pix',
  storageBucket: 'werm-pix.appspot.com',
  messagingSenderId: '512147999490',
};
firebase.initializeApp(config);
const auth = firebase.auth();
const storage = firebase.storage();
const db = firebase.firestore();
const settings = {timestampsInSnapshots: true};
db.settings(settings);

const firebaseProps = {auth, storage, db};

class App extends React.Component {
  state = {
    user: null,
    isLoadingUser: true,
  };

  componentDidMount () {
    this._unsubscribeToAuth = this._listenToAuth();
  }

  componentWillUnmount () {
    if (this._unsubscribeToAuth) {
      this._unsubscribeToAuth();
    }
  }

  _renderAuth () {
    const authConfig = {
      signInFlow: 'popup',
      signInSuccessUrl: window.location.pathname,
      signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
    };
    return <StyledFirebaseAuth uiConfig={authConfig} firebaseAuth={auth} />;
  }

  render () {
    const {user, isLoadingUser} = this.state;

    return (
      <Router>
        {user && !isLoadingUser ? (
          <>
            <Route exact path="/" render={props => <Groups {...firebaseProps} />} />
            <Switch>
              <Route
                exact
                path="/newMultiPost"
                render={props => <NewMultiPost {...firebaseProps} />}
              />
              <Route
                path="/:groupId"
                render={props => <Posts groupId={props.match.params.groupId} {...firebaseProps} />}
              />
            </Switch>
          </>
        ) : (
          this._renderAuth()
        )}
      </Router>
    );
  }

  _listenToAuth () {
    return auth.onAuthStateChanged(user => {
      if (user) {
        this.setState({user, isLoadingUser: false});
      } else {
        this.setState({user: null, isLoadingUser: false});
      }
    });
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
