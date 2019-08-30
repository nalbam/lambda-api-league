'use strict';

const create = require('./league/create').create;
const scan = require('./league/scan').scan;

exports.handler = (event, context, callback) => {
    console.log('## handler event : ', JSON.stringify(event, null, 2));

    const path = event.path; // /league
    const method = event.httpMethod; // POST, PUT, GET

    const arr = path.split('/');
    if (arr.length !== 2 || arr[1] !== 'league') {
        callback(new Error(`Unrecognized path "${path}"`));
    }

    if (method === 'POST') {
        create(event, context, callback);
    } else if (method === 'GET') {
        scan(event, context, callback);
    } else {
        callback(new Error(`Unrecognized method "${method}"`));
    }
};
