export default async function handler(req, res) {
  const { photo } = req.body;
  console.log(req.body);
  // const obj = {
  //   name,
  //   desc,
  //   img: {
  //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename))
  //     contentType: 'image/png'
  //   }
  // }
  // user.update(obj, () => {})
  res.json({})
}
