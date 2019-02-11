const _ = require('lodash');
const cors = require('cors');
const { User } = require('../models/user');
const express = require('express');
const router = express.Router();

router.options(
  '/auth',
  cors({
    credentials: true,
    origin: true
  }),
  (req, res) => {
    console.log('----received OPTIONS', req);
    res.sendStatus(200);
  }
);
router.post('/auth', async (req, res) => {
  // let dbUser = await User.findOne({ resource: req.body.From });
  // if (!dbUser) {
  //   dbUser = new User(_.pick(req.body, ['From', 'req.body.From']));
  //   await dbUser.save();
  // }
  console.log('----received request', req);
  res.sendStatus(200);
});

module.exports = router;
