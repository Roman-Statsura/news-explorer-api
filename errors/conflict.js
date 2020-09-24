const { Error } = require('mongoose');

class Conflict extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 409;
  }
}

module.exports = Conflict;
