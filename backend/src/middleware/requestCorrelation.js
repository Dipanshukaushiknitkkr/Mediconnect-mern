const crypto = require('crypto');

const requestCorrelation = (req, res, next) => {
  const correlationId = req.headers['x-request-id'] || crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader('X-Request-Id', correlationId);
  next();
};

module.exports = requestCorrelation;
