import { nanoid } from 'nanoid';
import User from '../../models/userSchema';
import dbConnect from '../../lib/dbConnect';

export default async function handler(req, res) {
  console.log(req.body);

  await dbConnect();

  const { username, name, pwd } = req.body;
  const userExist = User.findOne({ username });

  if(userExist._id) {
    console.log('user already exist', userExist._id)
    res.json({ isLoggedIn: false, message: 'User already exist' });
  } else {
    const link = nanoid(13);
    const user = new User({ username, name, link, lastSeen: Date.now() });

    try {
      user.setPassword(pwd);
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
        contacts: []
      }
      res.json(_user)
      console.log('account created')
    } catch (e) {
      console.log('unable to create account')
      res.json({ isLoggedIn: false });
    }
  }

}


// const getErrorMessage = (err) => {
// let message = ''
// if (err.code) {
// switch (err.code) {
// case 11000:
// case 11001:
// message = getUniqueErrorMessage(err)
// break
// default:
// message = 'Something went wrong'
// }
// } else {
// for (let errName in err.errors) {
// if (err.errors[errName].message)
// message = err.errors[errName].message
// }
// }
// return message
// }
