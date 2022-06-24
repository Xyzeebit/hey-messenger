import { useRouter } from "next/router";
import { useEffect, useContext } from "react";
import StateContext from "../components/StateContext";
import { socket } from '../lib/socket';;

export default function Logout() {
  const router = useRouter();
  const [appState, setAppState] = useContext(StateContext);

  const logout = async () => {
    const resp = await fetch("api/logout");
    const { isLoggedIn } = await resp.json();
    if (isLoggedIn) {
      // should throw err
    } else {
      setAppState({
        ...appState,
        user: { isLoggedIn },
        redirectToFollow: { follow: "" },
        active: "home",
      });
      // localStorage.removeItem('hey_messenger')
      const localSession = JSON.parse(localStorage.getItem("hey_messenger"));
      localSession.isLoggedIn = false;
      localStorage.setItem("hey_messenger", JSON.stringify(localSession));
      router.push("/login");
    }
  };

  useEffect(() => {
    if (socket.connected) {
      console.log('socket is disconnecting, logging out');
      socket.disconnect();
      socket.removeAllListeners("is online");
      socket.removeAllListeners("my chat");
      socket.removeAllListeners("rooms");
      //socket = null;
    } else {
      console.log('socket is not connected')
    }
    logout();
  }, []);
  return null;
}
