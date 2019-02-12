const _ = require('lodash');
const cors = require('cors');
const { User } = require('../models/user');
const express = require('express');
const router = express.Router();

router.options('/', (req, res) => {
  console.log('----received OPTIONS', req);
});

router.post('/', (req, res) => {
  // let dbUser = await User.findOne({ resource: req.body.From });
  // if (!dbUser) {
  //   dbUser = new User(_.pick(req.body, ['From', 'req.body.From']));
  //   await dbUser.save();
  // }
  console.log('----received request', req.body);
  res.sendStatus(200).send(req.email);
});

module.exports = router;
