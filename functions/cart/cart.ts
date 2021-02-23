'use strict';

import { database } from '../../database/database';

import { APIGatewayProxyEvent } from 'aws-lambda';

//functions that create JS object with product's id
const addProduct = async (email: string, productId: string) => {
  const data: APIGatewayProxyEvent = {
    pathParameters: {
      email: email,
    },
  };

  const response = JSON.parse((await module.exports.get(data)).body);
  let products_id;

  if (response.message != null && response.message == 'Element not found') {
    products_id = [
      {
        product_id: productId,
      },
    ];
  } else {
    response.products_id.push({ product_id: productId });

    products_id = response.products_id;
  }

  return products_id;
};

module.exports = {
  //create product
  insert: async function (event, context, callback) {
    const data = JSON.parse(event.body);
    let response;

    if (typeof data.email !== 'string' || typeof data.product_id !== 'string') {
      response = {
        statusCode: 400,
        headers: {
          //TO-DO only client origin
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          error: "Couldn't insert the product in the cart.",
        }),
      };

      return response;
    }

    const products_id = await addProduct(data.email, data.product_id);

    const params = {
      TableName: process.env.NAMESPACE + '-cart',
      Item: {
        email: data.email,
        products_id: products_id,
      },
    };

    let responseDB = (await database.put(params)).$response;

    if (responseDB.error) {
      console.error(responseDB.error);

      // create a response error
      response = {
        statusCode: 500,
        headers: {
          //TO-DO only client origin
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          error: 'Database Error',
        }),
      };
    } else {
      // create a response
      response = {
        statusCode: 200,
        headers: {
          //TO-DO only client origin
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          message: 'Product insert in the cart',
        }),
      };
    }

    return response;
  },

  //update product from id
  delete: async function (event, context, callback) {
    let response;

    const params = {
      TableName: process.env.NAMESPACE + '-cart',
      Key: {
        email: event.pathParameters.email,
      },
    };

    // write to the database
    let responseDB = (await database.delete(params)).$response;

    if (responseDB.error) {
      // create a response error
      console.error(responseDB.error);

      response = {
        statusCode: 500,
        headers: {
          //TO-DO only client origin
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          error: 'Database error',
        }),
      };
    } else {
      // create a response
      response = {
        statusCode: 200,
        headers: {
          //TO-DO only client origin
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          message: 'Products in the cart deleted correctly',
        }),
      };
    }

    return response;
  },

  //get products_ids from email
  get: async function (event, context, callback) {
    const params = {
      TableName: process.env.NAMESPACE + '-cart',
      Key: {
        email: event.pathParameters.email,
      },
    };

    // fetch item from database
    return await database.get(params);
  },
};
