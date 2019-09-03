'use strict';

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context, callback) => {
    const data = JSON.parse(event.body);

    if (!data || !data.league || typeof data.league !== 'string') {
        console.error('Validation Failed.');
        callback(null, {
            statusCode: 400,
            body: JSON.stringify({ error: 'Validation Failed.' }),
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
                statusCode: 500,
                body: error,
            });
            return;
        }

        console.log('result', result);

        if (!result || !result.Item) {
            console.error(`Not found : ${data.league}`);
            callback(null, {
                statusCode: 404,
                body: 'Not found.',
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
        };

        console.log('get', params);

        // get league
        ddb.get(params, (error, result) => {
            // handle potential errors
            if (error) {
                console.error(error);
                callback(null, {
                    statusCode: 500,
                    body: error,
                });
                return;
            }

            console.log('result', result);

            let datetime = new Date().getTime();

            if (!result || !result.Item) {
                params = {
                    TableName: process.env.TIME_TABLE,
                    Item: {
                        league: data.league,
                        email: data.email,
                        racerName: data.racerName,
                        lapTime: data.lapTime,
                        registered: datetime,
                    },
                };

                console.log('put', params);

                // create time
                ddb.put(params, (error, result) => {
                    // handle potential errors
                    if (error) {
                        console.error(error);
                        callback(null, {
                            statusCode: 500,
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
                let a1 = result.Item.lapTime.split(':');
                let oldLapTime = ((+a1[0]) * 60) + (+a1[1]);

                let a2 = data.lapTime.split(':');
                let newLapTime = ((+a2[0]) * 60) + (+a2[1]);

                if (oldLapTime < newLapTime) {
                    data.lapTime = result.Item.lapTime;
                }

                params = {
                    TableName: process.env.TIME_TABLE,
                    Key: {
                        'league': data.league,
                        'email': data.email,
                    },
                    UpdateExpression: 'SET racerName = :racerName, lapTime = :lapTime, modified = :modified',
                    ExpressionAttributeValues: {
                        ':racerName': data.racerName,
                        ':lapTime': data.lapTime,
                        ':modified': datetime,
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
                            statusCode: 500,
                            body: error,
                        });
                        return;
                    }

                    // response
                    console.log('time saved. ', result);
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
