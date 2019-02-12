const _ = require('lodash');
const cors = require('cors');
const { User } = require('../models/user');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { email, password, resource } = req.body;
  let dbUser = await User.findOneAndUpdate(
    { resource },
    { $set: { email, password } },
    { new: true }
  );
  if (!dbUser) {
    // dbUser = new User(_.pick(req.body, ['From', 'req.body.From']));
    // await dbUser.save();
    res.status(400).send('Resource not found in DB', resource);
  }
  console.log('----received request', req.body);
  res.send(db.User);
});

module.exports = router;
