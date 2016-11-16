/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var xhub = require('express-x-hub');
var util = require('util');

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));

app.use(xhub({ algorithm: 'sha1', secret: "5db1b7c8d9f9188561eb883d68d30766" }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  console.log(req);
  res.send('It works!');
});

app.get(['/facebook', '/instagram'], function(req, res) {
  if (
    req.param('hub.mode') == 'subscribe' &&
    req.param('hub.verify_token') == 'token'
  ) {
    res.send(req.param('hub.challenge'));
  } else {
    res.sendStatus(400);
  }
});

app.post('/facebook', function(req, res) {
  //console.log('Facebook request body:');

  var response = ''
  var status = 200
  if (req.isXHub) {
    //console.log('request header X-Hub-Signature found, validating');
    if (req.isXHubValid()) {
      //console.log('request header X-Hub-Signature validated');
      response = 'Verified!\n';
    }
  }
  else {
    //console.log('Warning - request header X-Hub-Signature not present or invalid');
    status = 401
    response = 'Failed to verify!\n';
    // recommend sending 401 status in production for non-validated signatures
    // res.sendStatus(401);
  }
  var entry = req.body.entry[0]
  var changes = entry.changes[0]
  if (changes.field === 'feed') {
    if (changes.value.item === 'comment' && changes.value.verb === 'add') {
      console.log(changes.value.sender_name + ' : "'+ changes.value.message +'"');
    }
  }
  //console.log(util.inspect(req.body, {showHidden: false, depth: null}))

  // Process the Facebook updates here
  res.status(status).send(response);
});

app.post('/instagram', function(req, res) {
  console.log('Instagram request body:');
  console.log(req.body);
  // Process the Instagram updates here
  res.sendStatus(200);
});

app.listen();
