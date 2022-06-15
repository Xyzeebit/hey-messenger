import User from '../../../models/userSchema';
import { nanoid } from 'nanoid';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false
  }
}

const options = {
  uploadDir: './public/uploads',
  keepExtensions: true,
}

const upload = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
      const user = await saveFile(fields, files.photo)
      if(user.exist) {
        res.status(409).json({ successful: false });
      } else {
        res.status(201).json(user);
      }
  });
}

const saveFile = async (fields, file) => {
  if(file) {
    const data = fs.readFileSync(file.filepath);
    const filename = nanoid(16) + path.extname(file.originalFilename);
    fs.writeFileSync(`./public/uploads/${filename}`, data);
    await fs.unlinkSync(file.filepath);
    const user = await updateUserInfo(fields, filename);
    return user;
  } else {
    // console.log('fields to update', fields);
    const user = await updateUserInfo(fields, '');
    return user;
  }

}

const updateUserInfo = async (fields, filename) => {
  let user;
  let exist = false;

  if(fields.username) {
    user = await User.findOne({ username: fields.username });
  }

  if(user) {
    if(fields.newUsername) {
      const checkUser = await User.findOne({ username: fields.newUsername });
      if(checkUser) {
        exist = true;
        console.log('user exist');
        return { exist };
      } else {
         user.username = fields.newUsername;
      }

    }
    if(fields.name) {
      user.name = fields.name;
    }
    if(fields.email) {
      user.email = fields.email;
    }
    if(filename) {
      user.profilePhoto = filename;
    }

    user = await user.save();
    return {
      username: user.username,
      email: user.email,
      profilePhoto: user.profilePhoto,
      name: user.name,
      exist: false
    }
  }
}



export default (req, res) => {

  upload(req, res);

  // console.log('user:::', user)
  // if(user.exist) {
  //   res.status(409).json({ successful: false });
  // } else {
  //   res.status(201).json(user);
  // }



}
