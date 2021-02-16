'use strict';

import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

export const database = {
  put: function (params) {
    // write to the database
    dynamoDb.put(params, (error) => {
      // handle potential errors
      if (error) throw error;
    });
  },

  query: function (params, callback) {
    // fetch from the database
    dynamoDb.query(params, (error, result) => {
      // handle potential errors
      if (error) throw error;

      // create a response
      const response = {
        statusCode: 200,
        body: JSON.stringify(
          result.Items!.length > 0
            ? result.Items
            : {
                message: 'Product not found',
              }
        ),
      };

      callback(null, response);
    });
  },

  get: function (params, callback) {
    // fetch from the database
    dynamoDb.get(params, (error, result) => {
      // handle potential errors

      if (error) throw error;

      // create a response
      const response = {
        statusCode: 200,
        body: JSON.stringify(
          result.Item
            ? result.Item
            : {
                message: 'Product not found',
              }
        ),
      };

      callback(null, response);
    });
  },

  scan: function (params, callback) {
    // fetch all from the database
    // For production workloads you should design your tables and indexes so that your applications can use Query instead of Scan.
    dynamoDb.scan(params, (error, result) => {
      // handle potential errors
      if (error) throw error;

      // create a response
      const response = {
        statusCode: 200,
        body: JSON.stringify(
          result.Items!.length > 0
            ? result.Items
            : {
                message: 'Empty list',
              }
        ),
      };
      callback(null, response);
    });
  },

  update: function (params) {
    // update product in the database
    dynamoDb.update(params, (error) => {
      // handle potential errors
      if (error) throw error;
    });
  },

  delete: function (params) {
    // update product in the database
    dynamoDb.delete(params, (error) => {
      // handle potential errors
      if (error) throw error;
    });
  },
};
