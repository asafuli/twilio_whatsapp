'use strict';

const { TWILIO_AUTH_TOKEN, TWILIO_ACCOUNT_SID } = require('./config');

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

  console.log(req.body.Body);
  twiml.message(req.body.Body);

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
