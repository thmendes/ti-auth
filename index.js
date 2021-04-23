const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');

const authController = require('./src/authController');
const app = express();

var corsOptions = {
  origin: function(origin, callback) {
    console.log('allowing origin', origin);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: [
    'Content-Type',
    'X-Amz-Date',
    'Authorization',
    'X-Api-Key',
    'X-Amz-Security-Token',
    'X-Amz-User-Agent'],
  exposedHeaders: [
    'access-control-allow-origin',
    'access-control-allow-credentials']
};

app.use(cors(corsOptions));
app.use(bodyParser.json({limit: '6mb'}));
app.use(compression({filter: shouldCompress}));

function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    return false;
  }
  return compression.filter(req, res);
};

const routePathSignup = '/signup';
console.log('Adding get route...' + routePathSignup);
app.post(routePathSignup, authController.signup);

const routePathSignin = '/signin';
console.log('Adding get route...' + routePathSignin);
app.post(routePathSignin, authController.signin);

const routePathconfirmSignup = '/confirm-signup';
console.log('Adding get route...' + routePathconfirmSignup);
app.post(routePathconfirmSignup, authController.confirmSignup);

const routePathGetUser = '/get-user';
console.log('Adding get route...' + routePathGetUser);
app.post(routePathGetUser, authController.getUser);

module.exports.handler = serverless(app);