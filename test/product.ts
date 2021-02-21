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
describe('Product empty table', () => {
  const data: APIGatewayProxyEvent = {
    pathParameters: {
      name: 'dummy',
      id: 'dummy',
    },
  };

  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of product
  const list = mochaPlugin.getWrapper('list', '/functions/product/product.ts', 'list');
  const query = mochaPlugin.getWrapper('query', '/functions/product/product.ts', 'query');
  const get = mochaPlugin.getWrapper('get', '/functions/product/product.ts', 'get');

  before((done) => {
    done();
  });

  it('product list function - should be "Empty table"', async () => {
    const response = await list.run();
    expect(JSON.parse(response.body).message).to.be.equal('Empty table');
  });

  it('product query function - should be "Products not found"', async () => {
    const response = await query.run(data);
    expect(JSON.parse(response.body).message).to.be.equal('Products not found');
  });

  it('product get function - should be "Product not found"', async () => {
    const response = await get.run(data);
    expect(JSON.parse(response.body).message).to.be.equal('Product not found');
  });
});

//test for populated table
describe('Product populated table', () => {
  const data: APIGatewayProxyEvent = {
    body: '{"name": "test", "description": "test_description"}',
    pathParameters: {
      name: 'test',
    },
  };

  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of product
  const list = mochaPlugin.getWrapper('list', '/functions/product/product.ts', 'list');
  const query = mochaPlugin.getWrapper('query', '/functions/product/product.ts', 'query');
  const get = mochaPlugin.getWrapper('get', '/functions/product/product.ts', 'get');
  const create = mochaPlugin.getWrapper('create', '/functions/product/product.ts', 'create');

  before(async () => {
    await create.run(data);
  });

  it('product list function - should contains only item "test"', async () => {
    const response = await list.run();
    expect(JSON.parse(response.body).length).to.be.equal(1);
    expect(JSON.parse(response.body)[0].name).to.be.equal('test');
    expect(JSON.parse(response.body)[0].description).to.be.equal('test_description');
  });

  it('product query function - should contains only item "test"', async () => {
    const response = await query.run(data);
    expect(JSON.parse(response.body).length).to.be.equal(1);
    expect(JSON.parse(response.body)[0].name).to.be.equal('test');
    expect(JSON.parse(response.body)[0].description).to.be.equal('test_description');
  });

  it('product get function - should return item "test"', async () => {
    //get id
    const responseQuery = await query.run(data);
    const id = JSON.parse(responseQuery.body)[0].id;

    const dataQuery: APIGatewayProxyEvent = {
      pathParameters: {
        id: id,
      },
    };

    const response = await get.run(dataQuery);
    expect(JSON.parse(response.body).name).to.be.equal('test');
    expect(JSON.parse(response.body).description).to.be.equal('test_description');
  });
});

//test for populate table
describe('Product populate table', () => {
  const data: APIGatewayProxyEvent = {
    body: '{"name": "test_populate", "description": "test_populate_description"}',
    pathParameters: {
      name: 'test_populate',
    },
  };

  const updateData =
    '{"name": "test_populate_update", "description": "test_populate_description_update"}';

  const errorData: APIGatewayProxyEvent = {
    body: '{"name": 1, "description": 2}',
    pathParameters: {
      name: 'test_populate',
    },
  };

  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of product
  const query = mochaPlugin.getWrapper('query', '/functions/product/product.ts', 'query');
  const get = mochaPlugin.getWrapper('get', '/functions/product/product.ts', 'get');
  const create = mochaPlugin.getWrapper('create', '/functions/product/product.ts', 'create');
  const update = mochaPlugin.getWrapper('update', '/functions/product/product.ts', 'update');
  const deleteFun = mochaPlugin.getWrapper('delete', '/functions/product/product.ts', 'delete');

  before((done) => {
    done();
  });

  it('product create function - should be "Product "test_populate" created correctly"', async () => {
    const response = await create.run(data);
    expect(JSON.parse(response.body).message).to.be.equal(
      'Product "test_populate" created correctly'
    );

    //check if item is in db
    const responseAfterCreate = await query.run(data);
    expect(JSON.parse(responseAfterCreate.body)[0].name).to.be.equal('test_populate');
    expect(JSON.parse(responseAfterCreate.body)[0].description).to.be.equal(
      'test_populate_description'
    );
  });

  it('product create function - should be "Couldn\'t create the product item."', async () => {
    const response = await create.run(errorData);
    expect(JSON.parse(response.body).error).to.be.equal("Couldn't create the product item.");
  });

  it('product update function - should be modify item "test_populate"', async () => {
    //get id
    const responseQuery = await query.run(data);
    const id = JSON.parse(responseQuery.body)[0].id;

    const dataQuery: APIGatewayProxyEvent = {
      body: updateData,
      pathParameters: {
        id: id,
      },
    };

    const response = await update.run(dataQuery);
    expect(JSON.parse(response.body).message).to.be.equal(
      'Product "test_populate_update" updated correctly'
    );

    //check if item is updated in db
    const responseAfterUpdate = await get.run(dataQuery);
    expect(JSON.parse(responseAfterUpdate.body).name).to.be.equal('test_populate_update');
    expect(JSON.parse(responseAfterUpdate.body).description).to.be.equal(
      'test_populate_description_update'
    );
  });

  it('product update function - should be "Couldn\'t update the product item."', async () => {
    const response = await update.run(errorData);
    expect(JSON.parse(response.body).error).to.be.equal("Couldn't update the product item.");
  });

  it('product delete function - should be delete item "test_populate_update"', async () => {
    //get id
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        name: 'test_populate_update',
      },
    };

    const responseQuery = await query.run(data);
    const id = JSON.parse(responseQuery.body)[0].id;

    const dataQuery: APIGatewayProxyEvent = {
      pathParameters: {
        id: id,
      },
    };

    const response = await deleteFun.run(dataQuery);
    expect(JSON.parse(response.body).message).to.be.equal('Product deleted correctly');

    //check if item is deleted in db
    const responseAfterUpdate = await get.run(dataQuery);
    expect(JSON.parse(responseAfterUpdate.body).message).to.be.equal('Product not found');
  });
});
