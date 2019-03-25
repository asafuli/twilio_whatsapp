const _ = require('lodash');
const { Chat } = require('../models/chat');
const express = require('express');
const router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');
const dateFormat = require('dateformat');
const { TWILIO_FE_URL } = require('../config/config');

let corsOptions = {
  credentials: true,
  origin: `${TWILIO_FE_URL}`
};

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(cors(corsOptions));

router.get('/user/:id', async (req, res) => {
  const curDate = dateFormat(date.now(), 'isoDate');
  const dbChat = await Chat.findOne({ curDate }, (err, doc) => {
    if (err) console.log(err);
    console.log('Chat - Get History - findOne : ', doc);
  });
  return dbChat.messages;
});

router.post('/', async (req, res) => {
  const { resource, message } = req.body;
  let { timestamp } = req.body;
  timestamp = dateFormat(timestamp, 'isoDate');
  let dbChat = await Chat.findOne({ timestamp }, (err, doc) => {
    if (err) console.log(err);
    console.log('Chat - findOneAndUpdate : ', doc);
  });
  if (dbChat) {
    const currMessages = dbChat.messages;
    dbChat = await Chat.findOneAndUpdate(
      { timestamp },
      { $set: { messages: [...currMessages, { resource, message }] } },
      { new: true },
      (err, doc) => {
        if (err) console.log(err);
        console.log('Chat - findOneAndUpdate : ', doc);
      }
    );
  } else {
    dbChat = new Chat({ timestamp, messages: [{ resource, message }] });
    console.log('Chat - findOneAndUpdate - New DB CHAT: ', dbChat);
    await dbChat.save();
  }
  console.log('----received request', req.body);
  res.send(dbChat);
});

module.exports = router;
