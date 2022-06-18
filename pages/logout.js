import { useRouter } from "next/router";
import { useEffect, useContext } from "react";
import StateContext from "../components/StateContext";

export default function Logout() {
  const router = useRouter();
  const [appState, setAppState] = useContext(StateContext);

  const logout = async () => {
    const resp = await fetch("api/logout");
    const { isLoggedIn } = await resp.json();
    if (isLoggedIn) {
      // shuld throw err
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
    logout();
  }, []);
  return null;
}
