import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';

export const generateResponse = (event: APIGatewayEvent, statusCode: number, body: string, headers?: {[header: string]: boolean | number | string}): APIGatewayProxyResult => {
    console.log('getStatus log',
        {
            requestId: event.requestContext.requestId,
            requestPath: event.path,
            queryStringParameters: event.queryStringParameters,
            statusCode,
            headers,
            event,
            body
        })
    const log = {
        requestId: event.requestContext.requestId,
        requestPath: event.path,
        queryStringParameters: event.queryStringParameters,
        statusCode,
        headers
    }
    const response = {
        statusCode,
        body,
        headers
    }

    if(statusCode === 200) {
        console.log('getStatus response', log);
    } else {
        console.log('getStatus error response', log)
    }

    return response
}