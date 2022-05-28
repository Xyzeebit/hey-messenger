import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useContext } from 'react';
import StateContext from '../components/StateContext';


export default function FunctionalPage() {
  const router = useRouter();
  const [appState, setAppState] = useContext(StateContext);
  const [userInfo, setUserInfo] = useState({ added: false });

  const handleClick = type => {
    const paths = location.href.split('/');
    const uLink = paths[paths.length - 1];
    // console.log(path, uid)
    if(type === 'add') {
      // is logged in
      // find and add user with uid to user
      // don't add user is already added
      if(userInfo.isLoggedIn) {
        // call api route to add user then redirect to home
        addUser(userInfo.currentUser, userInfo.username, response => {
          console.log('adding user to contacts', response)
          if(response.successful) {
            setUserInfo({ ...userInfo, added: true })
            setTimeout(() => {
              router.push('/');
            }, 500);
          }
          if(!response.successful || response.exist) {
            router.push('/');
          }
        })
      }
    }
    if(type === 'login') {
      // is not logged in go to login page
      router.push(`/login?${uLink}`)
    }
  }

  async function addUser(username, userToFollow, cb) {
    const URL = `http://localhost:3000/api/users/follow/${userToFollow}`;
    const resp = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, userToFollow })
    });
    const response = await resp.json();
    if(resp.ok && response) {
      cb(response);
    }
  }

  async function getUserWithLink(uLink) {
    // const [a, path, uid] = router.asPath.split('/');

    const URL = `http://localhost:3000/api/users/findbylink/${uLink}`;
    const resp = await fetch(URL);
    const user = await resp.json();

    if(resp.ok && user) {

      if(user.successful) {
        if(localStorage.getItem('hey_messenger')) {
          const localSession = JSON.parse(localStorage.getItem('hey_messenger'));
          setUserInfo({ ...user, isLoggedIn: localSession.isLoggedIn,
            currentUser: localSession.username });
        } else {
          setUserInfo({ ...user, isLoggedIn: false });
        }

      } else {
        router.push('/');
      }

    } else {
      router.push('/');
    }
  }

  useEffect(() => {
    const paths = location.href.split('/');
    const uLink = paths[paths.length - 1];
    // console.log(paths)
    if(localStorage.getItem('hey_messenger')) {
      const localSession = JSON.parse(localStorage.getItem('hey_messenger'));

      // setUserInfo({ ...userInfo, isLoggedIn: localSession.isLoggedIn });
      if(localSession.isLoggedIn) {
        if(localSession.link !== uLink) {
          getUserWithLink(uLink);
        } else {
          router.push('/');
        }
      } else {
        if(localSession.link !== uLink) {
          getUserWithLink(uLink);
        } else {
          getUserWithLink(uLink);
        }
      }
    } else {
      // setUserInfo({ ...userInfo, isLoggedIn: false });
      getUserWithLink(uLink)
    }
  }, []);

  return (
    <div className="function_page">
      <Head>
        <title>Hey! Messenger</title>
        <link rel="icon" href="/favicon.png" />
      </Head>

      <div className="app__title"><em>Hey!</em> Messenger</div>

      <div className="function_page__main">
        <FollowUser userInfo={userInfo} onEvent={handleClick} />
      </div>
    </div>
  )
}

const UserDetails = ({ userInfo }) => {
  const { name, username, imageUrl } = userInfo;
  return (
    <div className="user_details">
      <div className="user_details__image--container">
        <img
          src={`/${imageUrl}`}
          alt={username}
          width={100}
          height={100}
        />
      </div>
      <div className="user_details__values">
        <div className="user_details__username">@{username}</div>
        <div className="user_details__name">{name}</div>
      </div>
    </div>
  )
}

const UserActions = ({ isLoggedIn, onEvent }) => {
  // console.log('actions is logged in ' + isLoggedIn)
  return (
    <div className="user_actions">
      {
        isLoggedIn ?
        <div className="user_actions__add">
          <span>Add this user to your contact</span>
          <button onClick={() => onEvent('add')}>Add user</button>
        </div>
        :
        <div className="user_actions__login">
          <span>Login to add this user to your contact list</span>
          <button onClick={() => onEvent('login')}>Login</button>
        </div>
      }
    </div>
  )
}

const FollowUser = ({ userInfo, onEvent }) => {
  return (
    <div className="follow_user">
      <UserDetails userInfo={userInfo} />
      <hr />
      {!userInfo.added && <UserActions isLoggedIn={userInfo.isLoggedIn} onEvent={onEvent} />}
      {userInfo.added && <Success />}
    </div>
  );
}

const Success = () => (
  <div className="success-positioning">
    <div className="success-icon">
      <div className="success-icon__tip" />
      <div className="success-icon__long" />
    </div>
  </div>
);
