const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.url === '/open-debugger') {
        res.end('OK');
        return;
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
