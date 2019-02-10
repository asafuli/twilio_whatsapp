const auth = require('../routes/auth');

module.exports = function(app) {
  app.use('/auth', auth);
};
