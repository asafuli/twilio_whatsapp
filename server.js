'use strict';
const cors = require('cors');
const _ = require('lodash');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const { User } = require('./models/user');
const { Message } = require('./models/message');
const {
  TWILIO_AUTH_TOKEN,
  TWILIO_ACCOUNT_SID,
  TWILIO_INC_NUM_LIST,
  TWILIO_DB_STR,
  TWILIO_FE_URL
} = require('./config.js');

const app = express();
const port = process.env.PORT || 5000;

const scrapingURL = 'http://www.theblackdog.net/insecure.htm';
app.locals.parsedQuotes = [];
app.locals.whatsAppMsg = {};

const parseQuotes = async url => {
  let html;
  try {
    const response = await axios.get(scrapingURL);
    html = response.data;
  } catch (error) {
    console.error(error);
  }

  let quotes = html.slice(
    html.indexOf('quoteArray[0]'),
    html.indexOf('quoteArray[42]')
  );

  let regex = /quoteArray\[[0-9]\]=|quoteArray\[[1-4][0-9]\]=/g;
  quotes = quotes
    .replace(regex, '')
    .split('\n')
    .filter(el => el.length > 0);
  return quotes;
};

function getRandomAdvice(parsedQuotes) {
  return parsedQuotes[Math.ceil(Math.random() * parsedQuotes.length) - 1];
}

//------------Server start----------------------//

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

mongoose
  .connect(TWILIO_DB_STR)
  .then(() => console.log(`Connected to Twilio DB`));

// app.get('/', (req, res) => {
//   res.writeHead(200, { 'Content-Type': 'application/json' });

//   const response =
//     app.locals.whatsAppMsg === {}
//       ? {}
//       : {
//           advice: app.locals.parsedQuotes,
//           user: app.locals.whatsAppMsg.user,
//           resource: app.locals.whatsAppMsg.resource,
//           message: app.locals.whatsAppMsg.message
//         };
//   res.send(JSON.stringify(response));
//   res.end();
// });

app.get('/user/:id', async (req, res) => {
  const message = await Message.findOne({ uid: req.params.id });
  const user = await User.findOne({ _id: req.params.id });
  const knownUser = TWILIO_INC_NUM_LIST.filter(
    el => el.resource === user.resource
  );
  const response =
    user && message
      ? {
          advice: getRandomAdvice(app.locals.parsedQuotes),
          user: knownUser ? knownUser[0].userName : user.name,
          resource: user.resource,
          message: message.messages
        }
      : {};

  res.send(JSON.stringify(response));
  res.end();
});

app.post('/', async (req, res) => {
  //---------DB-----------------//
  let dbUser;
  let dbMessage;

  try {
    dbUser = await User.findOne({ resource: req.body.From });
  } catch (error) {
    console.log(error);
  }
  if (!dbUser) {
    dbUser = new User({ name: req.body.From, resource: req.body.From });
    console.log(dbUser);
    await dbUser.save();
  }

  try {
    console.log(dbUser._id);
    dbMessage = await Message.findOne({ uid: dbUser._id });
  } catch (error) {
    console.log(error);
  }
  if (!dbMessage) {
    dbMessage = new Message({
      uid: dbUser._id,
      messages: [...[], req.body.Body]
    });

    console.log(dbMessage);
    await dbMessage.save();
  } else {
    dbMessage = await Message.findOneAndUpdate(
      { uid: dbUser._id },
      {
        messages: [...dbMessage.messages, req.body.Body]
      },
      { new: true }
    );
    console.log(dbMessage);
  }

  //--------TWIML---------------//

  const twiml = new MessagingResponse();
  let response = '';
  const message = req.body.Body;
  const knownUser = TWILIO_INC_NUM_LIST.filter(
    el => el.resource === req.body.From
  );
  const userName = knownUser ? knownUser[0].userName : req.body.From;

  if (message) {
    response = `Hi ${userName}!
    Thanks for your message, you can find your messages history under:
    ${TWILIO_FE_URL}/user/${dbUser._id}
    In addition here's a random advice for free:
    ${getRandomAdvice(app.locals.parsedQuotes)}`;
    app.locals.whatsAppMsg.resource = knownUser[0].resource;
  }

  app.locals.whatsAppMsg = {
    ...app.locals.whatsAppMsg,
    ...{ user: userName, message: message }
  };
  console.log(response);
  twiml.message(response);
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

app.listen(port, async function() {
  console.log(`Server listening on port ${port}`);
  app.locals.parsedQuotes = await parseQuotes(scrapingURL);
});
