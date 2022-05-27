import React, { useState } from 'react'

import '../styles/globals.css'
import '../styles/layout.css';
import '../styles/navbar.css';
import '../styles/circle-image.css';
import '../styles/contact.css';
import '../styles/message.css';
import '../styles/profile-page.css';
import '../styles/forms.css';
import '../styles/follow-param.css';

// import Layout from '../components/Layout';
import StateContext from '../components/StateContext'

function MyApp({ Component, pageProps }) {
  const [appState, setAppState] = useState({
    active: 'home',
    user: { isLoggedIn: false },
    contacts: [],
    redirectToFollow: {
      follow: '',
    }
  });
  return (
    <StateContext.Provider value={[appState, setAppState]}>
      <Component {...pageProps} />
    </StateContext.Provider>
  );
}

export default MyApp
