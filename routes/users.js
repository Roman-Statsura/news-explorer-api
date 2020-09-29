const usersRouter = require('express').Router();
const {
  getUser,
} = require('../controllers/users');

usersRouter.get('/me', getUser);

module.exports = usersRouter;
