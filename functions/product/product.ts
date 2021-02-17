'use strict';

import * as uuid from 'uuid';

import { database } from '../../database/database';

module.exports = {
  //create product
  create: async function (event, context, callback) {
    const data = JSON.parse(event.body);
    let response;

    if (typeof data.name !== 'string' || typeof data.description !== 'string') {
      console.error('Validation Failed');

      response = {
        statusCode: 400,
        headers: { 'Content-Type': 'text/plain' },
        body: "Couldn't create the product item.",
      };

      return response;
    }

    const params = {
      TableName: process.env.NAMESPACE + '-product',
      Item: {
        id: uuid.v1(),
        name: data.name,
        description: data.description,
      },
    };

    let responseDB = (await database.put(params)).$response;

    if (responseDB.error) {
      console.error(responseDB.error);

      // create a response error
      response = {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Database Error',
        }),
      };
    } else {
      // create a response
      response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Product "' + data.name + '" created correctly',
        }),
      };
    }

    return response;
  },

  //get product from name
  query: async function (event, context, callback) {
    const params = {
      TableName: process.env.NAMESPACE + '-product',
      IndexName: 'name_index',
      ExpressionAttributeNames: {
        '#product_name': 'name',
      },
      KeyConditionExpression: '#product_name = :nameVal',
      ExpressionAttributeValues: {
        ':nameVal': event.pathParameters.name,
      },
    };

    // fetch items from database
    return await database.query(params);
  },

  //update product from id
  update: async function (event, context, callback) {
    const data = JSON.parse(event.body);
    let response;

    // validation
    if (typeof data.name !== 'string' || typeof data.description !== 'string') {
      console.error('Validation Failed');

      response = {
        statusCode: 400,
        headers: { 'Content-Type': 'text/plain' },
        body: "Couldn't update the product item.",
      };

      return response;
    }

    const params = {
      TableName: process.env.NAMESPACE + '-product',
      Key: {
        id: event.pathParameters.id,
      },
      ExpressionAttributeNames: {
        '#product_name': 'name',
      },
      ExpressionAttributeValues: {
        ':name': data.name,
        ':description': data.description,
      },
      UpdateExpression: 'SET #product_name = :name, description = :description',
    };

    // write to the database
    let responseDB = (await database.update(params)).$response;

    if (responseDB.error) {
      // create a response error
      console.error(responseDB.error);

      response = {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Database error',
        }),
      };
    } else {
      // create a response
      response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Product "' + data.name + '" updated correctly',
        }),
      };
    }

    return response;
  },

  //update product from id
  delete: async function (event, context, callback) {
    let response;

    const params = {
      TableName: process.env.NAMESPACE + '-product',
      Key: {
        id: event.pathParameters.id,
      },
    };

    // write to the database
    let responseDB = (await database.delete(params)).$response;

    if (responseDB.error) {
      // create a response error
      console.error(responseDB.error);

      response = {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Database error',
        }),
      };
    } else {
      // create a response
      response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Product deleted correctly',
        }),
      };
    }

    return response;
  },

  //get all product
  list: async function (event, context, callback) {
    const params = {
      TableName: process.env.NAMESPACE + '-product',
    };

    // fetch all items from database
    return await database.scan(params);
  },

  //get product from id
  get: async function (event, context, callback) {
    const params = {
      TableName: process.env.NAMESPACE + '-product',
      Key: {
        id: event.pathParameters.id,
      },
    };

    // fetch item from database
    return await database.get(params);
  },
};
