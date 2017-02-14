'use strict';

const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
//const Promise = require('bluebird');
const debug = require('debug')('wheatlessinv2:server');

mongoose.Promise = Promise;
const menuRouter = require('./route/menu-router.js');
const authRouter = require('./route/auth-router.js');
const bizRouter = require('./route/biz-router.js');
const picRouter = require('./route/pic-router.js');
const searchRouter = require('./route/search-router.js');
const errors = require('./lib/error-middleware.js');

dotenv.load();

const PORT = process.env.PORT;
const app = express();

// debug('Connecting to:',process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI);

app.use(morgan('dev'));
app.use(cors());

app.use(authRouter);
app.use(menuRouter);
app.use(bizRouter);
app.use(picRouter);
app.use(searchRouter);
app.use(errors);

app.get('/', (req, res) => {
  res.send('Welcome to Wheatless In...');
});

const server = module.exports = app.listen(PORT, () => {
  debug(`server up: ${PORT}`);
});

server.isRunning = true;
