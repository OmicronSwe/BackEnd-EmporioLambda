'use strict';

import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

export const database = {
  put: async function (params) {
    // create element in the database
    return await dynamoDb.put(params).promise();
  },

  query: async function (params) {
    // fetch from the database
    let result = await dynamoDb.query(params).promise();
    let response;

    if (result.$response.error) {
      console.error(result.$response.error);

      // create a response error
      response = {
        statusCode: 500,
        headers: {
          //TO-DO only client origin
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          message: 'Database error',
        }),
      };
    } else {
      //create a response
      response = {
        statusCode: 200,
        headers: {
          //TO-DO only client origin
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(
          result.Items!.length > 0
            ? result.Items
            : {
                message: 'Products not found',
              }
        ),
      };
    }

    return response;
  },

  get: async function (params) {
    // fetch from the database
    let result = await dynamoDb.get(params).promise();
    let response;

    if (result.$response.error) {
      console.error(result.$response.error);

      // create a response error
      response = {
        statusCode: 500,
        headers: {
          //TO-DO only client origin
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          message: 'Database error',
        }),
      };
    } else {
      //create a response
      response = {
        statusCode: 200,
        headers: {
          //TO-DO only client origin
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(
          result.Item
            ? result.Item
            : {
                message: 'Product not found',
              }
        ),
      };
    }

    return response;
  },

  scan: async function (params) {
    // fetch all from the database
    let result = await dynamoDb.scan(params).promise();
    let response;

    if (result.$response.error) {
      console.error(result.$response.error);

      // create a response error
      response = {
        statusCode: 500,
        headers: {
          //TO-DO only client origin
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          message: 'Database error',
        }),
      };
    } else {
      //create a response
      response = {
        statusCode: 200,
        headers: {
          //TO-DO only client origin
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(
          result.Items!.length > 0
            ? result.Items
            : {
                message: 'Empty table',
              }
        ),
      };
    }

    return response;
  },

  update: async function (params) {
    // update product in the database
    return await dynamoDb.update(params).promise();
  },

  delete: async function (params) {
    // delete product in the database
    return await dynamoDb.delete(params).promise();
  },
};
