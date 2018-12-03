'use strict';

const {
  TWILIO_AUTH_TOKEN,
  TWILIO_ACCOUNT_SID,
  TWILIO_INC_NUM_LIST
} = require('./config');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
const MessagingResponse = require('twilio').twiml.MessagingResponse;

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send(`received message : ${res.body}`);
});

app.post('/', (req, res) => {
  const twiml = new MessagingResponse();
  const user = TWILIO_INC_NUM_LIST.filter(el => el.resource === req.body.From);
  
  if (user) {
    twiml.message(
      `Hi ${user[0].userName}! Thanks for your message, you sent: ${
        req.body.Body
      }`
    );
  } else {
    twiml.message(
      `Hi ${req.body.From}! Thanks for your message, you sent: ${req.body.Body}`
    );
  }
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

app.listen(port, function() {
  console.log(`Server listening on port ${port}`);
});

// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
const accountSid = TWILIO_ACCOUNT_SID;
const authToken = TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// client.messages
//   .create({
//     body: 'Hello there!',
//     from: 'whatsapp:+14155238886',
//     to: 'whatsapp:+972523689045'
//   })
//   .then(message => console.log(message.sid))
//   .done();
