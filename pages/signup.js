import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useContext } from 'react';
import { SignupForm, Alert, Spinner } from '../components/form-components';
import StateContext from '../components/StateContext';

export default function Login() {
  const router = useRouter();
  const [appState, setAppState] = useContext(StateContext);
  const [data, setData] = useState({ username: '',
    name: '', pwd: '', signupError: false, loading: false });

  const handleFormSubmit = formData => {
    setData({ ...data, ...formData });
  }

  const handleError = hide => {
    if(hide) {
      setData({ ...data, signupError: false });
    }
  }

  const signupUser = async () => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: data.username, pwd: data.pwd, name: data.name })
    }
    const resp = await fetch('api/signup', options);
    const user = await resp.json();
    setAppState({ ...appState, user });
    setData({ ...data, signupError: !user.isLoggedIn });

    if(user.isLoggedIn) {
      localStorage.setItem('hey_messenger', JSON.stringify({
        username: user.username,
        isLoggedIn: user.isLoggedIn,
        link: user.link
      }));
    }
  }


  useEffect(() => {
    if(data.username && data.pwd && data.name) {
      setData({ ...data, loading: true });
      signupUser();
    }
  }, [data.username, data.pwd, data.name]);

  useEffect(() => {
    if(appState.user.isLoggedIn) {
      router.push('/');
    }
  }, [appState.user.isLoggedIn]);

  return (
    <main className="signup_main">
      <Head>
        <title>Create an Hey Messenger account</title>
        <link href="/favicon.png" rel='icon' />
      </Head>
      {data.loading && <Spinner />}
      <div className="signup_app__title"><em>Hey!</em> Messenger</div>
      <div className="signup_container">
        <h2>Create Account</h2>
        {data.signupError &&
          <Alert text="Unable to create account" hide={handleError} type="danger" />
        }
        <img
          src="/logo.png"
          alt="Hey Messenger"
          width="50"
          height="50"
        />
        <SignupForm loading={data.loading} formHandler={handleFormSubmit} />
        <div className="have__account">
          Have account? <a href="/login">login</a> instead.
        </div>
      </div>
    </main>
  )
}
