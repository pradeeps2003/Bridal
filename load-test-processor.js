module.exports = {
  setup: (context, ee, next) => {
    console.log('Starting load test...');
    next();
  },

  cleanup: (context, ee, next) => {
    console.log('Load test completed!');
    next();
  },

  beforeRequest: (requestParams, context, ee, next) => {
    // Add custom headers if needed
    requestParams.headers = requestParams.headers || {};
    requestParams.headers['User-Agent'] = 'Artillery-Load-Test/1.0';
    next();
  },

  afterResponse: (requestParams, response, context, ee, next) => {
    // Track response times
    if (response.statusCode !== 200) {
      ee.emit('customStat', {
        stat: 'non_200_responses',
        value: 1,
      });
    }
    next();
  },
};
