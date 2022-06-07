export async function readMessages(chatIds, callback) {
  const resp = await fetch('api/users/read', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(chatIds)
  });
  const messages = await resp.json();
  callback(messages);
}
