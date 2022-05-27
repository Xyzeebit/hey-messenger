// filename session.js
// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
export const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD,
  cookieName: "iron-session/examples/next.js",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};



// filename API/login.js
import { Octokit } from "octokit";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
const octokit = new Octokit();

export default withIronSessionApiRoute(async (req, res) => {
  const { username } = await req.body;

  try {
    const {
      data: { login, avatar_url },
    } = await octokit.rest.users.getByUsername({ username });

    const user = { isLoggedIn: true, login, avatarUrl: avatar_url };
    req.session.user = user;
    await req.session.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}, sessionOptions);




// filename API/logout.js
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";

export default withIronSessionApiRoute(logoutRoute, sessionOptions);

async function logoutRoute(req, res) {
  req.session.destroy();
  res.json({ isLoggedIn: false, login: "", avatarUrl: "" });
}



// filename API/user.js

import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";

export default withIronSessionApiRoute(userRoute, sessionOptions);

async function userRoute(req, res) {
  if (req.session.user) {
    // in a real world application you might read the user id from the session and then do a database request
    // to get more information on the user if needed
    res.json({
      ...req.session.user,
      isLoggedIn: true,
    });
  } else {
    res.json({
      isLoggedIn: false,
      login: "",
      avatarUrl: "",
    });
  }
}



//filename API/events.js
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { Octokit } from "octokit";

const octokit = new Octokit();

export default withIronSessionApiRoute(eventsRoute, sessionOptions);

async function eventsRoute(req, res) {
  const user = req.session.user;

  if (!user || user.isLoggedIn === false) {
    res.status(401).end();
    return;
  }

  try {
    const { data: events } =
      await octokit.rest.activity.listPublicEventsForUser({
        username: user.login,
      });

    res.json(events);
  } catch (error) {
    res.status(200).json([]);
  }
}




