const _ = require('lodash');
const { Chat } = require('../models/chat');
const express = require('express');
const router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');

let corsOptions = {
  credentials: true,
  origin: true
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
    dbChat = new Chat(
      _.pick(
        req.body,
        ['timestamp', 'req.body.timestamp'],
        [{ resource, message }]
      )
    );
    console.log('Chat - findOneAndUpdate - New DB CHAT: ', dbChat);
    await dbChat.save();
    res.status(200).send('Saved new Chat doc to DB :', dbChat);
  }
  console.log('----received request', req.body);
  res.send(dbChat);
});

module.exports = router;
