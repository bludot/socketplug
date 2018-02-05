var util = require('util');
var bcrypt = require('bcrypt');

var AWS = require("aws-sdk");
var opts = {
  region: "localhost",
  access_key_id: "access-key-id-of-your-choice",
  secret_access_key: "secret-key-of-your-choice",
  endpoint: "http://localhost:8000"
};
AWS.config.update(opts);
var ddb = new AWS.DynamoDB.DocumentClient();

var TableName = 'socketplug_oauth';

var keys = {
  token: 'tokens:%s',
  client: 'clients:%s',
  refreshToken: 'refresh_tokens:%s',
  grantTypes: 'clients:%s:grant_types',
  user: 'users:%s'
};




module.exports.getAccessToken = function(bearerToken) {
  console.log('### Running getAccessToken');
  console.log(bearerToken);
  var params = {
    TableName: TableName,
    Key: {
      'accessToken': bearerToken,
    }
  };
  return new Promise(function (resolve, reject) {
    ddb.get(params, function (err, data) {
      console.log(data);
      if (err) return reject(err);

      if (!data) return resolve({});
      data = data.Item;
      var item = {
        accessToken: data.accessToken,
        client: { id: data.clientId },
        accessTokenExpiresAt: new Date(data.accessTokenExpiresAt),
        refreshTokenExpiresOn: new Date(data.refreshTokenExpiresOn),
        refreshToken: data.refreshToken,
        user: { id: data.id }
      };
      console.log(item);
      return resolve(item);
    });
  });
};

module.exports.getClient = function *(clientId, clientSecret) {
  console.log('### running getClient');
  console.log(clientSecret, clientId);
  var params = {
    TableName: TableName,
    FilterExpression: "#client_id = :client_id_val AND #client_secret = :client_secret_val",
    ExpressionAttributeNames: {
      "#client_id": "clientId",
      "#client_secret": "clientSecret",
    },
    ExpressionAttributeValues: {
      ":client_id_val": clientId,
      ":client_secret_val": clientSecret
    }
  };
  return new Promise(function (resolve, reject) {
    ddb.scan(params, function (err, data) {
      var oAuthClient = data.Items[0];
      if (!oAuthClient) {
        return reject();
      }

      return resolve({
        clientId: oAuthClient.client_id,
        clientSecret: oAuthClient.client_secret,
        grants: ['password'], // the list of OAuth2 grant types that should be allowed
      });
    });
  });
};
module.exports.getRefreshToken = function *(bearerToken) {
  console.log('### running getRefreshToken');
  console.log(bearerToken);
  var params = {
    TableName: TableName,
    Key: {
      'refreshToken': bearerToken,
    }
  };
  return new Promise(function (resolve, reject) {
    ddb.get(params, function (err, data) {
      if (err) return reject(err);
      if (!data) return resolve(false);
      return resolve(data[0]);
    });
  });
};

module.exports.getUser = function *(username, password) {
  console.log('running getUser');
  console.log(username, password);
  var params = {
    TableName: TableName,
    FilterExpression: "#username = :username_val AND attribute_exists(#password)",
    ExpressionAttributeNames: {
      "#username": "username",
      "#password": "password"
    },
    ExpressionAttributeValues: {
      ":username_val": username
    }
  };
  console.log(this);
  return new Promise(function (resolve, reject) {
    ddb.scan(params, function (err, data) {
      console.log(data);
      var item = data.Items.reduce(function (prev, curr) { if(!prev) return bcrypt.compareSync(password, curr.password) && curr; return false; }, false);
      console.log(item);
      if (err) return reject(err);
      if (!item) return resolve(false);
      return resolve(item);
    });
  });
};
module.exports.saveAccessToken = module.exports.saveToken = function *(token, client, user) {
  console.log('### running saveAccessToken');
  console.log(token, client, user);
  delete user.password;
  var item = Object.assign(client, user, token);
  item.accessTokenExpiresAt = item.accessTokenExpiresAt.toISOString();
  item.refreshTokenExpiresAt = item.refreshTokenExpiresAt.toISOString();
  var params = {
    'TableName': TableName,
    'Item': item
  };
  console.log('The item: ');
  console.log(item);

  return new Promise(function (resolve, reject) {
    ddb.put(params, function(err, data) {
      if (err) {
        console.log('ERROR!');
        console.log(err);
        return reject(err);
      }
      console.log('completed!');
      item.client = client;
      item.user = user;
      item.accessTokenExpiresAt = new Date(item.accessTokenExpiresAt);
      item.refreshTokenExpiresAt = new Date(item.refreshTokenExpiresAt);
      return resolve(item);
    });
  });
};




