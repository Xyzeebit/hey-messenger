import { nanoid } from 'nanoid';
import dbConnect from '../../lib/dbConnect';
import User from '../../models/userSchema';
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../lib/session";

export default withIronSessionApiRoute(async (req, res) => {
  const { username, pwd } = req.body;
  await dbConnect();
  const user = await User.findOne({ username });
  if(user) {
    if(user.verifyPassword(pwd)) {
      user.lastSeen = Date.now();
      await user.save();
      const _user = {
        id: user._id,
        name: user.name,
        username: user.username,
        isLoggedIn: true,
        profilePhoto: user.profilePhoto,
        email: user.email,
        link: user.link,
        chatId: user.chatId,
        lastSeen: user.lastSeen
      }

      // req.session.user = {
      //   id: user._id,
      //   username: user.username,
      //   link: user.link,
      //   isLoggedIn: true,
      // };
      // await req.session.save();

      res.json(_user)

    } else {
      res.json({ isLoggedIn: false });
    }
  } else {
    res.json({ isLoggedIn: false });
  }
}, sessionOptions);
