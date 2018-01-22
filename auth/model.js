var model = module.exports,
  util = require('util');

var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-2"
});
var ddb = new AWS.DynamoDB.DocumentClient();

var ddbTable = 'socketplug_auth';

var keys = {
  token: 'tokens:%s',
  client: 'clients:%s',
  refreshToken: 'refresh_tokens:%s',
  grantTypes: 'clients:%s:grant_types',
  user: 'users:%s'
};

model.getAccessToken = function (bearerToken, callback) {
  ddb.scan({TableName: ddbTable,
    FilterExpression: "tokens contains "+bearerToken
  }, function(err, data) {
    if (err) return callback(err);

    if (!data) return callback();

    callback(null, {
      accessToken: data[0].accessToken,
      clientId: data[0].clientId,
      expires: data[0].expires ? new Date(data[0].expires) : null,
      userId: data[0].id
    });

  })
  /*  db.hgetall(util.format(keys.token, bearerToken), function (err, token) {
    if (err) return callback(err);

    if (!token) return callback();

    callback(null, {
      accessToken: token.accessToken,
      clientId: token.clientId,
      expires: token.expires ? new Date(token.expires) : null,
      userId: token.userId
    });
  });*/
};

model.getClient = function (clientId, clientSecret, callback) {
  ddb.scan({TableName: ddbTable,
    FilterExpression: "id = "+clientId
  }, function(err, data) {
    if (err) return callback(err);

    if (!data || data.clientSecret !== clientSecret) return callback();

    callback(null, {
      clientId: data[0].clientId,
      clientSecret: data[0].clientSecret
    });
  });
 /* db.hgetall(util.format(keys.client, clientId), function (err, client) {
    if (err) return callback(err);

    if (!client || client.clientSecret !== clientSecret) return callback();

    callback(null, {
      clientId: client.clientId,
      clientSecret: client.clientSecret
    });
  });*/
};

model.getRefreshToken = function (bearerToken, callback) {
  db.hgetall(util.format(keys.refreshToken, bearerToken), function (err, token) {
    if (err) return callback(err);

    if (!token) return callback();

    callback(null, {
      refreshToken: token.accessToken,
      clientId: token.clientId,
      expires: token.expires ? new Date(token.expires) : null,
      userId: token.userId
    });
  });
};

model.grantTypeAllowed = function (clientId, grantType, callback) {
  db.sismember(util.format(keys.grantTypes, clientId), grantType, callback);
};

model.saveAccessToken = function (accessToken, clientId, expires, user, callback) {
  ddb.updateItem({ TableName: ddbTable,
    Key: {
      username: user.username
    },
    UpdateExpression: "set tokens.accessToken = :a",
    ExpressionAttributeValues: {
      ":a": {
        accessToken: accessToken,
        clientId: clientId,
        expires: expires ? expires.toISOString() : null,
        userId: user.id
      }
    },
    ReturnValues:"UPDATED_NEW"
  }, callback);
};

model.saveRefreshToken = function (refreshToken, clientId, expires, user, callback) {
  db.hmset(util.format(keys.refreshToken, refreshToken), {
    refreshToken: refreshToken,
    clientId: clientId,
    expires: expires ? expires.toISOString() : null,
    userId: user.id
  }, callback);
};

model.getUser = function (username, password, callback) {
  db.hgetall(util.format(keys.user, username), function (err, user) {
    if (err) return callback(err);

    if (!user || password !== user.password) return callback();

    callback(null, {
      id: username
    });
  });
};
