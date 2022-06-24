import User from "../../../models/userSchema";
import dbConnect from "../../../lib/dbConnect";

export default async function handler(req, res) {
  await dbConnect();

  const { link } = req.query;
  if (link) {
    // find user with link
    const user = await User.findOne({ link });
    if (user) {
      const _user = {
        name: user.name,
        username: user.username,
        imageUrl: user.profilePhoto,
        successful: true,
      };

      res.json(_user);
    } else {
      res.json({ successful: false });
    }
  } else {
	  //res.json({ successful: false });
  }
}
