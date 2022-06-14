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

const post = async (req, res) => {
  const form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
      console.log(fields);
      const user = await saveFile(fields, files.photo)
    });
}

const saveFile = async (fields, file, cb) => {
  if(file) {
    const data = fs.readFileSync(file.filepath);
    const filename = nanoid(16) + path.extname(file.originalFilename);
    fs.writeFileSync(`./public/uploads/${filename}`, data);
    await fs.unlinkSync(file.filepath);
    const user = await updateUserInfo(fields, filename);
    return user;
  } else {
    const user = await updateUserInfo(fields, '');
    return user;
  }

}

const updateUserInfo = async (fields, filename) => {
  const user = await User.findOne({ username: fields.username });
  let exist = false;
  console.log(fields);
  if(user) {
    if(fields.newUsername) {
      const checkUser = await User.findOne({ username: fields.username });
      if(checkUser) {
        exist = true;
        console.log('user xist');
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

    await user.save();

    return {
      username: user.username,
      email: user.email,
      profilePhoto: user.profilePhoto,
      name: user.name,
      exist: false
    }
  }
}



export default async (req, res) => {
  const  user = await post(req, res);
  console.log(user)
  if(user.exist) {
    res.status(409).json({ successful: false });
  } else {
    res.status(201).json(user);
  }
}
