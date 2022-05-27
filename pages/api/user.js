import { HeyMessenger } from '../../codes/hey-messenger';

const hey_users = new HeyMessenger();
const usersList = ['John Doe', 'Jessie Match', 'Jane Doe', 'Nicolas Plum',
  'Jessie Match', 'Chies Lie', 'Bill Peters'
]

for(let user of usersList) {
  hey_users.addNewUser(user);
}

export default function handler(req, res) {
  res.json(users);
  res.end();
}
