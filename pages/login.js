import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useContext } from 'react';
import { LoginForm, Alert, Spinner } from '../components/form-components';
import StateContext from '../components/StateContext';

export default function Login() {
  const [appState, setAppState] = useContext(StateContext);
  const [data, setData] = useState({
    username: '',
    pwd: '',
    loginError: false,
    loading: false
  });
  const router = useRouter();

  const handleFormSubmit = formData => {
    setData({ ...data, ...formData });

  }
  const handleError = hide => {
    if(hide) {
      setData({ ...data, loginError: false });
    }
  }
  const loginUser = async () => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: data.username, pwd: data.pwd })
    }
    const resp = await fetch('api/login', options);
    const user = await resp.json();

    setAppState({ ...appState, user });
    setData({ ...data, loginError: !user.isLoggedIn, loading: false });

    if(user.isLoggedIn) {
      localStorage.setItem('hey_messenger', JSON.stringify({
        username: user.username,
        isLoggedIn: user.isLoggedIn,
        link: user.link
      }));
    }
  }

  useEffect(() => {
    if(localStorage.getItem('hey_messenger')) {
      const localSession = JSON.parse(localStorage.getItem('hey_messenger'));
      if(localSession.isLoggedIn) {
        router.push('/');
      }
    }
  }, []);

  useEffect(() => {
    if(appState.user.isLoggedIn) {
      if(appState.redirectToFollow.follow &&
        appState.redirectToFollow.follow !== appState.user.link) {
        router.push('/follow?link=' + appState.redirectToFollow.follow);
      } else {
         router.push('/');
      }
      // router.push('/');
    }
    if(data.loginError) {
      console.log('login error')
    }
  }, [appState.user.isLoggedIn, data.loginError]);

  useEffect(() => {
    if(router.asPath.indexOf('?') !== -1) {
      const [path, follow] = router.asPath.split('?');
      // console.log(path, follow)
      setAppState({ ...appState, redirectToFollow: { follow }})
    }
  }, [])

  useEffect(() => {
    if(data.username && data.pwd) {
      loginUser();
      setData({ ...data, loading: true });
    }
  }, [data.username, data.pwd]);

  return (
    <main className="login_main">
      <Head>
        <title>Login</title>
        <link href="/favicon.png" rel='icon' />
      </Head>
      {data.loading && <Spinner />}
      <div className="login_app__title"><em>Hey!</em> Messenger</div>
      <div className="login_container">
        <h2>Login</h2>
        {data.loginError &&
          <Alert text="Invalid username or password" hide={handleError} type="danger" />
        }
        <img
          src="/logo.png"
          alt="Hey Messenger"
          width="50"
          height="50"
        />
        <LoginForm loading={data.loading} formHandler={handleFormSubmit} />
        <div className="dont_have__account">
          Don't have account? <a href="/signup">signup</a> instead.
        </div>
      </div>
    </main>
  )
}
