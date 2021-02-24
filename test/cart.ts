'use strict';

import { APIGatewayProxyEvent } from 'aws-lambda';

// tests for product

//config for dynamoDB local
let AWS = require('aws-sdk');
AWS.config.update({
  region: 'local',
  accessKeyId: 'xxxx',
  secretAccessKey: 'xxxx',
  endpoint: 'http://localhost:8000',
});

//test for empty table
describe('Cart empty table', () => {
  const data: APIGatewayProxyEvent = {
    pathParameters: {
      email: 'test@test.com',
    },
  };

  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of cart
  const get = mochaPlugin.getWrapper('get', '/functions/cart/cart.ts', 'get');

  before((done) => {
    done();
  });

  it('cart get function - should be "Element not found"', async () => {
    const response = await get.run(data);
    expect(JSON.parse(response.body).message).to.be.equal('Element not found');
  });
});

//test for populated table
describe('Cart populated table', () => {
  const data: APIGatewayProxyEvent = {
    body: `{
          "email": "test@test.com", 
          "product_id": "12u3uu"
        }`,
    pathParameters: {
      email: 'test@test.com',
    },
  };

  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of cart
  const get = mochaPlugin.getWrapper('get', '/functions/cart/cart.ts', 'get');
  const insert = mochaPlugin.getWrapper('insert', '/functions/cart/cart.ts', 'insert');

  before(async () => {
    await insert.run(data);
  });

  it('cart get function - should return item "test@test.com"', async () => {
    const response = await get.run(data);

    expect(JSON.parse(response.body).email).to.be.equal('test@test.com');
    expect(JSON.parse(response.body).products_id[0].product_id).to.be.equal('12u3uu');
  });
});

//test for populate table
describe('Cart populate table', () => {
  const data: APIGatewayProxyEvent = {
    body: `{
            "email": "test@test.com", 
            "product_id": "y78yy"
        }`,
    pathParameters: {
      email: 'test@test.com',
    },
  };

  const errorData: APIGatewayProxyEvent = {
    body: `{
            "email": "test_error@test.com", 
            "product_id": 78
          }`,
  };

  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of cart
  const get = mochaPlugin.getWrapper('get', '/functions/cart/cart.ts', 'get');
  const insert = mochaPlugin.getWrapper('insert', '/functions/cart/cart.ts', 'insert');
  const deleteFun = mochaPlugin.getWrapper('delete', '/functions/cart/cart.ts', 'delete');

  before((done) => {
    done();
  });

  it('cart insert function - should be "Product insert in the cart"', async () => {
    const response = await insert.run(data);

    expect(JSON.parse(response.body).message).to.be.equal('Product insert in the cart');

    //check if element is in the db
    const responseGet = await get.run(data);

    expect(JSON.parse(responseGet.body).email).to.be.equal('test@test.com');
    expect(JSON.parse(responseGet.body).products_id[0].product_id).to.be.equal('12u3uu');
    expect(JSON.parse(responseGet.body).products_id[1].product_id).to.be.equal('y78yy');
  });

  it('cart insert function - should be "Couldn\'t insert the product in the cart."', async () => {
    const response = await insert.run(errorData);
    expect(JSON.parse(response.body).error).to.be.equal("Couldn't insert the product in the cart.");
  });

  it('cart delete function - should be "Products in the cart deleted correctly"', async () => {
    const response = await deleteFun.run(data);

    expect(JSON.parse(response.body).message).to.be.equal('Products in the cart deleted correctly');

    //check if element is in the db
    const responseGet = await get.run(data);

    expect(JSON.parse(responseGet.body).message).to.be.equal('Element not found');
  });
});
