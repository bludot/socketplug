#! /usr/bin/env node

var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-2"
});
var ddb = new AWS.DynamoDB();

var ddbTable = 'socketplug_auth';
ddb.putItem({
  'TableName': ddbTable,
  'Item': {
    user: 'admin',
    password: '$2a$10$xUcjE3omlI2dIZZVk7GAKOX9Gd4s8PHGNgtg491OuEBrj9cGYDRi2',
    clients: {
      clientId: 'client',
      clientSecret: 'secret',
      grantTypes: ['password', 'refresh_token']
    }
  }
}, function(err, data) {
  if (err) {
    console.log('ERROR!');
    console.log(err);
  }
  console.log('completed!');
  process.exit();
});

/*
var db = require('redis').createClient();

db.multi()
  .hmset('users:username', {
    id: 'username',
    username: 'username',
    password: 'password'
  })
  .hmset('clients:client', {
    clientId: 'client',
    clientSecret: 'secret'
  })
  .sadd('clients:client:grant_types', [
    'password',
    'refresh_token'
  ])
  .exec(function (errs) {
    if (errs) {
      console.error(errs[0].message);
      return process.exit(1);
    }

    console.log('Client and user added successfully');
    process.exit();
  });*/
