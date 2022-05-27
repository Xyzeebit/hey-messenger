import { withIronSessionApiRoute } from 'iron-session/next';
import { getUsers } from '../../../lib/hey-messenger';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/userSchema';
import { sessionOptions } from "../../../lib/session";

export default withIronSessionApiRoute(async (req, res) => {

  await dbConnect();


  console.log('session', req.session.user)

  res.json(getUsers());
  res.end();
}, sessionOptions);
