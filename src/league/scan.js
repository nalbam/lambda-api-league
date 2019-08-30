'use strict';

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

module.exports.scan = (event, context, callback) => {
    const data = event.queryStringParameters;

    let params;

    if (data && data.league && typeof data.league === 'string') {
        params = {
            TableName: process.env.TIME_TABLE,
            FilterExpression: '#league = :league',
            ExpressionAttributeNames: {
                '#league': 'league',
            },
            ExpressionAttributeValues: {
                ':league': data.league,
            },
        };
    } else {
        params = {
            TableName: process.env.MAIN_TABLE,
        };
    }

    console.log('scan', params);

    // fetch all league-time from the database
    ddb.scan(params, (error, result) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                body: error,
            });
            return;
        }

        // create a response
        const response = {
            statusCode: 200,
            body: JSON.stringify(result.Items),
        };
        callback(null, response);
    });
};
