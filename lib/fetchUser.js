import { useEffect } from 'react';

export const fetchUser = async (username, mini, cb) => {
  const resp = await fetch('api/users/' + username, {
    body: JSON.stringify({ minimal: mini }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const user = await resp.json();
  if(resp.ok && user) {
    cb(user);
  }
}

export const fetchContacts = async (contacts, cb) => {
  let _contacts = [];
  if(contacts.length > 0) {

    _contacts = await contacts.map(async (contact) => {
      let user;
      await fetchUser(contact.contactUsername, true, _user => {
        cb(_user);
      });

      return user;
    });
  }
}

// export const fetchuserMessages = (username, cb) => {
//   const resp = await fetch('api/users/' + username, {
//     body: JSON.stringify({ minimal: mini }),
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   });
//   const user = await resp.json();
//   if(resp.ok && user) {
//     cb(user);
//   }
// }
