require('dotenv').config();

module.exports.MONGO_DB = process.env.MONGODB_URL || 'mongodb://localhost:27017/news-explorer';
module.exports.PORT = process.env.PORT || 3000;
