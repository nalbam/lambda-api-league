'use strict';

const AWS = require('aws-sdk');
const uuid = require('uuid');

const ddb = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context, callback) => {
    const data = JSON.parse(event.body);

    if (!data || !data.league || typeof data.league !== 'string') {
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
            'league': data.league,
        },
    };

    console.log('get', params);

    // get league
    ddb.get(params, (error, result) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                body: error,
            });
            return;
        }

        console.log('result', result);

        if (!result || !result.Item) {
            console.error(`No exist : ${data.league}`);
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
                'league': data.league,
                'email': data.email,
            },
            // KeyConditionExpression: '#league = :league and #email = :email',
            // ExpressionAttributeNames: {
            //     '#league': 'league',
            //     '#email': 'email',
            // },
            // ExpressionAttributeValues: {
            //     ':league': data.league,
            //     ':email': data.email,
            // },
        };

        console.log('get', params);

        // get league
        ddb.get(params, (error, result) => {
            // handle potential errors
            if (error) {
                console.error(error);
                callback(null, {
                    statusCode: error.statusCode || 501,
                    body: error,
                });
                return;
            }

            console.log('result', result);

            if (!result || !result.Item) {
                params = {
                    TableName: process.env.TIME_TABLE,
                    Item: {
                        id: uuid.v1(),
                        league: data.league,
                        email: data.email,
                        name: data.name,
                        time: data.time,
                    },
                };

                console.log('put', params);

                // create time
                ddb.put(params, (error, result) => {
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
                params = {
                    TableName: process.env.TIME_TABLE,
                    Key: {
                        'league': data.league,
                        'email': data.email,
                    },
                    UpdateExpression: 'SET name = :name, time = :time',
                    ExpressionAttributeValues: {
                        ':name': data.name,
                        ':time': data.time,
                    },
                    ReturnValues: 'ALL_NEW',
                };

                console.log('update', params);

                // update time
                ddb.update(params, (error, result) => {
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
