import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useLayoutEffect, useContext } from 'react';
import { nanoid } from 'nanoid';
import StateContext from '../components/StateContext';
import Layout from '../components/Layout';
import { fetchUser } from '../lib/fetchUser';

const editData = {
  username: '',
  name: '',
  email: ''
};

export default function Profile({ holdRendering }) {
  const router = useRouter();
  const [appState, setAppState] = useContext(StateContext);
  const [data, setData] = useState({
    edit: false,
    valueChanged: false,

    editName: '',
    editUsername: '',
    editEmail: '',
  });
  const [copyText, setCopyText] = useState('copy');

  const handleInputChange = (name, value) => {
    editData = { ...editData, [name]: value };
    // console.log(editData[name]);
    if(value) {
      setData({ ...data, valueChanged: true });
    }

  }

  const copyLink = () => {

    if(navigator.clipboard) {
      try {
        navigator.clipboard.writeText(
          location.href.substring(0, location.href.lastIndexOf('/')) +
          '/follow/' + appState.user.link
        );
      } catch (e) {

      } finally {
        setCopyText('copied');
        setTimeout(() => {
          setCopyText('copy');
        }, 800);
      }
    }
  }

  const handleEditProfile = command => {
    if(command === 'edit') {
      setData({
        ...data, edit: true
      });
    }
    if(command === 'save') {
      console.log('setting....', editData)

      let name, username, email = '';
      // save data
      if(editData.username && data.username !== editData.username) {
        username = editData.username;
      } else {
        username = data.name;
      }
      if(editData.name && editData.name !== data.name) {
        name = editData.name;
      } else {
        name = data.name;
      }
      if(editData.email && data.email !== editData.email) {
        email = editData.email;
      } else {
        email = data.email
      }
      setData({
        ...data,
        edit: false,
        valueChanged: true,
        name,
        username,
        email
      });
      console.log('data....', data)
      // write to server in useEffect
    }
    if(command === 'cancel') {
      setData({
        ...data, edit: false
      });
    }
  }

  const getUserProfile = () => {
    return appState.user;
  }

  useEffect(() => {
    if(localStorage.getItem('hey_messenger')) {
      const localSession = JSON.parse(localStorage.getItem('hey_messenger'));
      if(localSession.isLoggedIn) {
        fetchUser(localSession.username, false, user => {
          if(user) {
            // console.log('fetched user', user)
            setAppState({ ...appState, user, active: 'profile' });
          }
        });
      } else {
        router.push('/login')
      }
    } else {
      router.push('/signup');
    }

  }, [])


  if(holdRendering && !appState.user.isLoggedIn) {
    return null
  } else {

    return (
      <Layout>
        <main className="profile_page__main">
          <Head>
            <title>My Profile</title>
          </Head>

          <div className="profile_page">
            <div className="profile_image__container">
              <img
                src={`/${appState.user.profilePhoto}`}
                alt="Avatar"
                width="50"
                height="50"
              />
            </div>

            <ProfileDetail label="username" value={`${appState.user.username && '@'}${appState.user.username}`}
              onEdit={handleInputChange} visible={data.edit} />
            <ProfileDetail label="name" value={appState.user.name}
              onEdit={handleInputChange} visible={data.edit} />
            <ProfileDetail label="email" value={appState.user.email || 'email'}
              onEdit={handleInputChange} visible={data.edit} />

            <InviteFriend
              link={location.href.substring(0, location.href.lastIndexOf('/')) +
              '/follow/' + appState.user.link}
              copyText={copyText} onClick={copyLink}
            />

            <div className="edit_buttons">
              <button
                style={{display: (data.edit ? 'none' : 'inline-block')}}
                className="edit_profile__button"
                onClick={() => handleEditProfile('edit')}
              >Edit profile
              </button>
              <button
                disabled={!data.valueChanged}
                className="edit_profile__button"
                onClick={() => handleEditProfile('save')}
                style={{display: (data.edit ? 'inline-block' : 'none')}}
              >
                Save
              </button>
              <button
                className="edit_profile__button"
                onClick={() => handleEditProfile('cancel')}
                style={{display: (data.edit ? 'inline-block' : 'none')}}
              >
                Cancel
              </button>
            </div>

            <div className="logout-container">
              <Link href="/logout">
                <a className="logout_button">Log out</a>
              </Link>
            </div>

          </div>
        </main>
      </Layout>
    );
  }
}

const Input = ({ name, onChange, placeholder }) => {
  const [value, setValue] = useState('');

  const handleChange = ({ target }) => {
    setValue(target.value);
  }

  useEffect(() => {
    onChange(name, value);
  }, [value])

  return <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={ handleChange }
  />
}

const ProfileDetail = ({ label, value, onEdit, visible }) => {
  return (
    <div className="profile_detail">
      <div className="label">{label}</div>
      <div className="value">
        {!visible && <tt>{value}</tt>}
        {visible && <span className="input">
          <Input
            name={label}
            onChange={onEdit}
            placeholder={`Change ${value}`}
          />
        </span>}
      </div>
    </div>
  );
}

const InviteFriend = ({ link, copyText, onClick }) => (
  <div className="invite_friend">
    <span className="share_link__text">Share link to invite friends</span>
    <div className="invite_group">
      <span className="user_link">{link}</span>
      <button className="copy_link__button" onClick={onClick}>
        {copyText}
      </button>
    </div>
  </div>
);

export async function getStaticProps() {
  return { props: { holdRendering: true } }
}
