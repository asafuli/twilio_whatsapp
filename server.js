'use strict';
const cors = require('cors');

const {
  TWILIO_AUTH_TOKEN,
  TWILIO_ACCOUNT_SID,
  TWILIO_INC_NUM_LIST
} = require('./config');

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 5000;
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const url = 'http://www.theblackdog.net/insecure.htm';
app.locals.parsedQuotes = [];
app.locals.whatsAppMsg = {};

const parseQuotes = async url => {
  let html;
  try {
    const response = await axios.get(url);
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

app.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  // res.write(JSON.stringify(app.locals.parsedQuotes));
  const response =
    app.locals.whatsAppMsg === {}
      ? {}
      : {
          advice: app.locals.parsedQuotes,
          user: app.locals.whatsAppMsg.user,
          resource: app.locals.whatsAppMsg.resource,
          message: app.locals.whatsAppMsg.message
        };
  console.log(response);
  res.write(JSON.stringify(response));
  res.end();
});

app.post('/', (req, res) => {
  const twiml = new MessagingResponse();
  const user = TWILIO_INC_NUM_LIST.filter(el => el.resource === req.body.From);
  let response = '';
  const message = req.body.Body;
  const userName = user ? user[0].userName : req.body.From;

  if (
    message &&
    (message.includes('עצה') || message.toLowerCase().includes('advice'))
  ) {
    response = `Hi ${userName}!\n Always remember:\n ${getRandomAdvice(
      app.locals.parsedQuotes
    )}`;
    app.locals.whatsAppMsg.resource = user[0].resource;
  } else {
    response = `Hi ${userName}! Thanks for your message, you sent: ${
      req.body.Body
    }`;
  }
  app.locals.whatsAppMsg = {
    ...app.locals.whatsAppMsg,
    ...{ user: userName, message: message }
  };

  twiml.message(response);
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

app.listen(port, async function() {
  console.log(`Server listening on port ${port}`);
  app.locals.parsedQuotes = await parseQuotes(url);
});

// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
const accountSid = TWILIO_ACCOUNT_SID;
const authToken = TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// client.messages
//   .create({
//     body: 'Hello there!',
//     from: 'whatsapp:XXXXXXXXX',
//     to: 'whatsapp:XXXXXXXXX'
//   })
//   .then(message => console.log(message.sid))
//   .done();
