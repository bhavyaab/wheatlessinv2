'use strict';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('wheatlessinv2:server');

mongoose.Promise = Promise;
const menuRouter = require('./route/menu-router.js');
const authRouter = require('./route/auth-router.js');
const bizRouter = require('./route/biz-router.js');
const errors = require('./lib/error-middleware.js');

dotenv.load();

const PORT = process.env.PORT;
const app = express();

mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));

app.use(authRouter);
app.use(menuRouter);
app.use(bizRouter);
app.use(errors);

const server = module.exports = app.listen(PORT, () => {
  debug(`server up: ${PORT}`);
});

server.isRunning = true;
