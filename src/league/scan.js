'use strict';

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

module.exports.scan = (event, context, callback) => {
    const data = event.queryStringParameters;

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

        let body = {
            league: result.Item.league,
            title: result.Item.title,
            logo: result.Item.logo,
            anim: result.Item.anim,
            items: [],
        }

        // time param
        params = {
            TableName: process.env.TIME_TABLE,
            ProjectionExpression: 'racerName, lapTime',
            FilterExpression: '#league = :league',
            ExpressionAttributeNames: {
                '#league': 'league',
            },
            ExpressionAttributeValues: {
                ':league': data.league,
            },
        };

        console.log('get', params);

        // fetch all league-time from the database
        ddb.scan(params, (error, result) => {
            // handle potential errors
            if (error) {
                console.error(error);
                callback(null, {
                    statusCode: 500,
                    body: error,
                });
                return;
            }

            body.items = result.Items;

            // create a response
            const response = {
                statusCode: 200,
                body: JSON.stringify(body),
            };
            callback(null, response);
        });
    });
};
