'use strict';

// tests for hello
// Generated by serverless-mocha-plugin

describe('product list', () => {
  //config for dynamoDB local
  var AWS = require('aws-sdk');
  AWS.config.update({
    region: 'eu-central-1',
    endpoint: 'http://localhost:8000',
  });

  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;
  const wrapped = mochaPlugin.getWrapper('list', '/functions/product/product.ts', 'list');

  before((done) => {
    done();
  });

  it('Should be Empty table', async () => {
    const response = await wrapped.run({});
    expect(JSON.parse(response.body).message).to.be.equal('Empty table');
  });
});
