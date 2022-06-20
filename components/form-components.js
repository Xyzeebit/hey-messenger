import { useState } from 'react';

function Form({ showUsername, showName, showPassword, showCPassword, loading, onSubmit }) {
  const [data, setData] = useState({
    name: '',
    username: '',
    pwd: '',
    cpwd: '',

    nameErrText: 'Invalid name',
    usernameErrText: 'username should be at least 6 characters',
    pwdErrText: 'Password should be at least 6 characters',

    nameErr: false,
    usernameErr: false,
    pwdErr: false,
    cpwdErr: false,

  });

  const handleInputSubmit = evt => {
    evt.preventDefault();

    let nameErr, usernameErr, pwdErr, cpwdErr;

    if(showName) {
      // check signup data
      if(data.username.length < 6) {
        usernameErr = true;
      }
      if(data.name.length < 3) {
        nameErr = true;
      }
      if(data.pwd.length < 6) {
        pwdErr = true;
      }
      if(data.cpwd.length >= 6) {
        if(data.cpwd !== data.pwd) {
          cpwdErr = true;
        }
      } else {
        cpwdErr = true;
      }
      setData({ ...data, nameErr, usernameErr, pwdErr, cpwdErr });
    } else {
      //check login data
      if(data.username.length < 6) {
        usernameErr = true;
      }
      if(data.pwd.length < 6) {
        pwdErr = true;
      }
      setData({ ...data, usernameErr, pwdErr });
    }

    // don't submit on error
    if(showName) {
      if(!nameErr && !usernameErr && !pwdErr && !cpwdErr) {
        onSubmit({ name: data.name, username: data.username.toLowerCase(),
          pwd: data.pwd, cpwd: data.cpwd });
      }
    } else {
      if(!usernameErr && !pwdErr) {
        onSubmit({ username: data.username.toLowerCase(), pwd: data.pwd });
      }
    }
  }

  return (
    <form
      className="form_group"
      onSubmit={handleInputSubmit}
    >

      {showName && <div className="form_input__group">
        <label htmlFor="name">
          <span>Name*</span>
          {data.nameErr &&
            <small className="name_err error">{data.nameErrText}</small>}
        </label>
        <input
          type="text"
          value={data.name}
          onChange={({ target}) => setData({...data, name: target.value})}
          id="name"
          className={`${data.nameErr ? 'form_err' : ''}`}
        />
      </div>}

      {showUsername && <div className="form_input__group">
        <label htmlFor="username">
          <span>Username*</span>
          {data.usernameErr &&
            <small className="username_err error">{data.usernameErrText}</small>}
        </label>
        <input
          type="text"
          value={data.username}
          onChange={({ target}) => setData({...data, username: target.value})}
          id="username"
          className={`${data.usernameErr ? 'form_err' : ''}`}
        />
      </div>}

      {showPassword && <div className="form_input__group">
        <label htmlFor="pwd">
          <span>Password*</span>
          {data.pwdErr && <small className="pwd_err error">{data.pwdErrText}</small>}
        </label>
        <input
          type="password"
          value={data.pwd}
          onChange={({ target}) => setData({...data, pwd: target.value})}
          id="pwd"
          className={`${data.pwdErr ? 'form_err' : ''}`}
        />
      </div>}

      {showCPassword && <div className="form_input__group  cpwd">
        <label htmlFor="cpwd">
          <span>Confirm password*</span>
          {data.cpwdErr && <small className="cpwd_err error">Passwords do not match</small>}
        </label>
        <input
          type="password"
          value={data.cpwd}
          onChange={({ target}) => setData({...data, cpwd: target.value})}
          id="cpwd"
          className={`${data.cpwdErr ? 'form_err' : ''}`}
        />
      </div>}

      <div className="form_input__group">
        <button
          role="submit"
          disabled={loading}
          className="form_submit__button">
            {showName ? 'Sign up' : 'Login' }
        </button>
      </div>

    </form>
  )
}

export function Alert({ text, hide, type }) {
  return (
    <div className={`alert ${type}`}>
      <strong>{text}</strong>
      <button onClick={() => hide(true)}>x</button>
    </div>
  );
}

export function LoginForm({ loading, formHandler }) {
  return (
    <div className="login_form__group">
      <Form
        showUsername={true}
        showName={false}
        showPassword={true}
        showCPassword={false}
        loading={loading}
        onSubmit={formHandler}
      />
    </div>
  )
}

export function SignupForm({ loading, formHandler }) {
  return (
    <div className="signup_form__group">
    <Form
      showUsername={true}
      showName={true}
      showPassword={true}
      showCPassword={true}
      loading={loading}
      onSubmit={formHandler}
    />
    </div>
  )
}

export const Spinner = () => (
  <div className="spinner_overlay">
    <svg className="spinner" width="65px" height="65px" viewBox="0 0 66 66"
      xmlns="http://www.w3.org/2000/svg">
      <circle className="path" fill="none" strokeWidth="6"
        strokeLinecap="round" cx="33" cy="33" r="30" />
    </svg>
  </div>
)
