const _ = require('lodash');
const { User } = require('../models/user');
const express = require('express');
const router = express.Router();

router.post('/auth', async (req, res) => {
  // let dbUser = await User.findOne({ resource: req.body.From });
  // if (!dbUser) {
  //   dbUser = new User(_.pick(req.body, ['From', 'req.body.From']));
  //   await dbUser.save();
  // }
  console.log('received request', req);
  res.sendStatus(200);
});

module.exports = router;
