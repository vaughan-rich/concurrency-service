"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResponse = void 0;
const generateResponse = (event, statusCode, body, headers) => {
    console.log('getSessionStatus log', {
        requestId: event.requestContext.requestId,
        requestPath: event.path,
        statusCode,
        event,
        body
    });
    const log = {
        requestId: event.requestContext.requestId,
        requestPath: event.path,
        statusCode
    };
    const response = {
        statusCode,
        body,
        headers
    };
    if (statusCode === 200) {
        console.log('getSessionStatus success response', log);
    }
    else {
        console.log('getSessionStatus error response', log);
    }
    return response;
};
exports.generateResponse = generateResponse;
