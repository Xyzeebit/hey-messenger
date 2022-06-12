import User from '../../../models/userSchema';
import dbConnect from '../../../lib/dbConnect';

export default async function handler(req, res) {
  await dbConnect();

  const { link } = req.query;
  console.log('calling api link')
  if(link) {  // find user with link
    const user = await User.findOne({ link });
    if(user) {
      const _user = {
        name: user.name,
        username: user.username,
        imageUrl: user.profilePhoto,
        successful: true,
      }
      // console.log(_user)

      res.json(_user);
    } else {
      res.json({ successful: false });
    }
  }

  res.end();
}
