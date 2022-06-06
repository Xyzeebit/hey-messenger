export async function writeMessage(username, message, callback) {
  const resp = await fetch('api/users/write', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(message)
  });

  const data = await resp.json();
  callback(data);
}
