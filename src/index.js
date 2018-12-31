import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import './index.css';
import Posts from './Posts';
import Groups from './Groups';
import * as serviceWorker from './serviceWorker';

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

const AUTH_CONFIG = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInSuccessUrl: '/',
  // We will display Google and Facebook as auth providers.
  signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
};

const firebaseProps = {auth, storage, db};

class App extends React.Component {
  state = {
    user: null,
    isLoadingUser: true,
  };

  componentDidMount () {
    this._listenToAuth();
  }

  _renderAuth () {
    return <StyledFirebaseAuth uiConfig={AUTH_CONFIG} firebaseAuth={auth} />;
  }

  render () {
    const {user, isLoadingUser} = this.state;

    return (
      <Router>
        {user && !isLoadingUser ? (
          <>
            <Route exact path="/" render={props => <Groups {...firebaseProps} />} />
            <Route
              path="/:groupId"
              render={props => <Posts groupId={props.match.params.groupId} {...firebaseProps} />}
            />
          </>
        ) : (
          this._renderAuth()
        )}
      </Router>
    );
  }

  _listenToAuth () {
    auth.onAuthStateChanged(user => {
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
serviceWorker.unregister();
