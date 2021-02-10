'use strict';

module.exports.prova = async (event, context) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Ciao!',
      input: event,
    }),
  };

  return response;
  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
