import Link from 'next/link';
import { useRouter } from 'next/router';

export default function NavBar() {
  const router = useRouter();
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
            ${router.asPath === '/profile' ? 'active' : ''}`}>Profile</a>
        </Link>
        {/*<button className="menu__item sign-in__button">Sign in</button>
        <button className="menu__item sign-up__button">Sign up</button>*/}
        <Link href="/">
          <a className={`menu__item chats__button
            ${router.asPath === '/' ? 'active' : ''}`}>Chats</a>
        </Link>
      </div>
    </nav>
  )
}
