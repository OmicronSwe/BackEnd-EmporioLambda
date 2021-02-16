import * as uuid from 'uuid';

import { database } from '../../database/database';

module.exports = {
  //create product
  create: function (event, context, callback) {
    const data = JSON.parse(event.body);

    //validation error
    if (typeof data.name !== 'string' || typeof data.description !== 'string') {
      console.error('Validation Failed');
      callback(new Error("Couldn't create the product item"));
      return;
    }

    const params = {
      TableName: process.env.NAMESPACE + '-product',
      Item: {
        id: uuid.v1(),
        name: data.name,
        description: data.description,
      },
    };

    // call put
    try {
      database.put(params);

      // create a response
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Product "' + params.Item.name + '" insert correctly',
        }),
      };

      callback(null, response);
    } catch (error) {
      console.error(error);

      callback(new Error('Database error'));
    }
  },

  //get product from name
  query: function (event, context, callback) {
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

    // write to the database
    try {
      database.query(params, callback);
    } catch (error) {
      console.error(error);

      callback(new Error('Database error'));
    }
  },

  //update product from id
  update: function (event, context, callback) {
    const data = JSON.parse(event.body);

    // validation
    if (typeof data.name !== 'string' || typeof data.description !== 'string') {
      console.error('Validation Failed');
      callback(null, {
        statusCode: 400,
        headers: { 'Content-Type': 'text/plain' },
        body: "Couldn't update the product item.",
      });
      return;
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
    try {
      database.update(params);

      // create a response
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Product "' + data.name + '" updated correctly',
        }),
      };

      callback(null, response);
    } catch (error) {
      console.error(error);

      callback(new Error('Database error'));
    }
  },

  //update product from id
  delete: function (event, context, callback) {
    const params = {
      TableName: process.env.NAMESPACE + '-product',
      Key: {
        id: event.pathParameters.id,
      },
    };

    // write to the database
    try {
      database.delete(params);

      // create a response
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Product deleted correctly',
        }),
      };

      callback(null, response);
    } catch (error) {
      console.error(error);

      callback(new Error('Database error'));
    }
  },

  //get all product
  list: function (event, context, callback) {
    const params = {
      TableName: process.env.NAMESPACE + '-product',
    };

    // For production workloads you should design your tables and indexes so that your applications can use Query instead of Scan.
    // fetch all items from database
    try {
      database.scan(params, callback);
    } catch (error) {
      console.error(error);

      callback(new Error('Database error'));
    }
  },

  //get product from id
  get: function (event, context, callback) {
    const params = {
      TableName: process.env.NAMESPACE + '-product',
      Key: {
        id: event.pathParameters.id,
      },
    };

    //call get
    try {
      database.get(params, callback);
    } catch (error) {
      console.error(error);

      callback(new Error('Database error'));
    }
  },
};
