'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context, callback) => {
    const data = JSON.parse(event.body);

    if (data && data.league && typeof data.league !== 'string') {
        console.error('Validation Failed.');
        callback(null, {
            statusCode: 400,
            body: {
                error: 'Validation Failed.'
            },
        });
        return;
    }

    let params;

    // main param
    params = {
        TableName: process.env.MAIN_TABLE,
        Key: {
            league: data.league,
        },
    };

    // get league
    dynamoDb.get(params, (error, result) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                body: error,
            });
            return;
        }

        if (!result || !result.Item) {
            console.error(`Not exist : ${data.league}`);
            callback(null, {
                statusCode: error.statusCode || 501,
                body: error,
            });
            return;
        }

        // time param
        params = {
            TableName: process.env.TIME_TABLE,
            Key: {
                league: data.league,
                name: data.name,
            },
        };

        // get league
        dynamoDb.get(params, (error, result) => {
            // handle potential errors
            if (error) {
                console.error(error);
                callback(null, {
                    statusCode: error.statusCode || 501,
                    body: error,
                });
                return;
            }

            if (!result || !result.Item) {
                const params = {
                    TableName: process.env.TIME_TABLE,
                    Item: {
                        league: data.league,
                        name: data.name,
                        time: data.time,
                    },
                };

                // create time
                dynamoDb.put(params, (error) => {
                    // handle potential errors
                    if (error) {
                        console.error(error);
                        callback(null, {
                            statusCode: error.statusCode || 501,
                            body: error,
                        });
                        return;
                    }

                    // response
                    console.log('time saved. ', params.Item);
                    const response = {
                        statusCode: 201,
                        body: JSON.stringify(params.Item),
                    };
                    callback(null, response);
                });
            } else {
                const params = {
                    TableName: process.env.TIME_TABLE,
                    Key: {
                        league: data.league,
                        name: data.name,
                    },
                    UpdateExpression: 'SET time = :time',
                    ExpressionAttributeValues: {
                        ':time': data.time,
                    },
                    ReturnValues: 'ALL_NEW',
                };

                // update time
                dynamoDb.update(params, (error, result) => {
                    // handle potential errors
                    if (error) {
                        console.error(error);
                        callback(null, {
                            statusCode: error.statusCode || 501,
                            body: error,
                        });
                        return;
                    }

                    // response
                    console.log('time saved. ', params.Key);
                    const response = {
                        statusCode: 200,
                        body: JSON.stringify(params.Key),
                    };
                    callback(null, response);
                });
            }
        });
    });
};
