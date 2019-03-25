const _ = require('lodash');
const { Chat } = require('../models/chat');
const express = require('express');
const router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');
const { TWILIO_FE_URL } = require('../config/config');

let corsOptions = {
  credentials: true,
  origin: `${TWILIO_FE_URL}/chat`
};

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(cors(corsOptions));

router.post('/', async (req, res) => {
  const { resource, timestamp, message } = req.body;
  console.log('Chat - findOneAndUpdate : ', resource, timestamp, message);

  let dbChat = await Chat.findOneAndUpdate(
    { resource },
    { $set: { messages: [{ resource, message }] } },
    { new: true },
    (err, doc) => {
      if (err) console.log(err);
      console.log('Chat - findOneAndUpdate : ', doc);
    }
  );
  if (!dbChat) {
    dbChat = new Chat({ timestamp, messages: [{ resource, message }] });
    console.log('Chat - findOneAndUpdate - New DB CHAT: ', dbChat);
    await dbChat.save();
  }
  console.log('----received request', req.body);
  res.send(dbChat);
});

module.exports = router;
