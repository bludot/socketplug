#! /usr/bin/env node

var AWS = require("aws-sdk");

/*AWS.config.update({
  region: "us-east-2"
});*/
var opts = {
  //region: "lcoalhost,
  region: "us-east-2",
  //access_key_id: "access-key-id-of-your-choice",
  //secret_access_key: "secret-key-of-your-choice",
  //endpoint: "http://localhost:8000"
};
AWS.config.update(opts);
var ddb_raw = new AWS.DynamoDB();
var ddb = new AWS.DynamoDB.DocumentClient();
var ddbTable = 'socketplug_oauth';

var params = {
  TableName: ddbTable,
  KeySchema: [
    { AttributeName: "accessToken", KeyType: "HASH"}
  ],
  AttributeDefinitions: [
    /*    { AttributeName: "username", AttributeType: "S" },
    { AttributeName: "password", AttributeType: "S" }, */
    { AttributeName: "accessToken", AttributeType: "S" },
    /*    { AttributeName: "access_token_expires_on", AttributeType: "S" },
    { AttributeName: "client_id", AttributeType: "S" },
    { AttributeName: "client_secret", AttributeType: "S" },
    { AttributeName: "redirect_uri", AttributeType: "S" },
    { AttributeName: "refresh_token", AttributeType: "S" },
    { AttributeName: "refresh_token_expires_on" , AttributeType: "S" }*/
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  },
  StreamSpecification: {
    StreamEnabled: false
  }
};

ddb_raw.createTable(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data);
  }
  insert();
});
// add to table
function insert() {
  console.log(Object.keys(ddb));
  ddb.put({
    'TableName': ddbTable,
    'Item': {
      username:"admin",
      id:"admin",
      password:"$2a$10$8NezsZYAVvo7SGkWG2igH.sbIym1/YDaNpEhF5pY4ttnp7qtiQXTe",
      accessToken:"empty",
      accessTokenExpiresAt: null,
      refreshToken:"empty",
      refreshTokenExpiresAt:null,
      clientId:"client",
      clientSecret:"secret",
      grants:["password","refresh_token"]
    }
  }, function(err, data) {
    if (err) {
      console.log('ERROR!');
      console.log(err);
    }
    console.log('completed!');
    process.exit();
  });
}

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
