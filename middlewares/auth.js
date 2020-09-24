const jwt = require('jsonwebtoken');
const { Messages } = require('../utils/messages');
const Unauthorized = require('../errors/unauthorized');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const { NODE_ENV, JWT_SECRET } = process.env;
  if (!req.cookies.jwt) {
    next(new Unauthorized(Messages.auhorizationRequired));
  }
  const token = req.cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'secret');
  } catch (err) {
    next(new Unauthorized(Messages.auhorizationRequired));
  }
  req.user = payload;

  next();
};
