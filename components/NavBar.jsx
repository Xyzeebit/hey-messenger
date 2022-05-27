import Link from 'next/link';
import { useContext } from 'react';
import StateContext from '../components/StateContext';

export default function NavBar() {
  const [appState] = useContext(StateContext);
  const { active } = appState;
  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <img
          src="/logo.png"
          alt="Hey Messenger"
          width="50"
          height="50"
          className="navbar__brand--logo"
        />
        <div className="navbar__brand--appname">
          <span>Hey!</span> Messenger
        </div>
      </div>
      <div className="menu">
        <Link href="/profile">
          <a className={`menu__item profile__button
            ${active === 'profile' ? 'active' : ''}`}>Profile</a>
        </Link>
        {/*<button className="menu__item sign-in__button">Sign in</button>
        <button className="menu__item sign-up__button">Sign up</button>*/}
        <Link href="/">
          <a className={`menu__item chats__button
            ${active === 'home' ? 'active' : ''}`}>Chats</a>
        </Link>
      </div>
    </nav>
  )
}
