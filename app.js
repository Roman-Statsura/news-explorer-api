const express = require('express');
require('dotenv').config();
const helmet = require('helmet');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const { errors } = require('celebrate');

const NotFoundError = require('./errors/not-found');

const router = require('./routes/index');
const limiter = require('./middlewares/rateLimiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { Messages } = require('./utils/messages');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(cors({ credentials: true, origin: true }));
app.use(helmet());
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(limiter);
app.use(requestLogger);
app.use(router);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error(Messages.serverIsAboutToFail);
  }, 0);
});

app.use(errorLogger);
app.use(errors());

app.use((req, res, next) => {
  next(new NotFoundError(Messages.sourceNotFound));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500 ? Messages.serverError : message,
  });
});

app.listen(PORT, () => {
  /* eslint no-console: ["error", { allow: ["log"] }] */
  console.log(`App listening on port ${PORT}`);
});