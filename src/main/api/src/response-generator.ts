import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';

export const generateResponse = (event: APIGatewayEvent, statusCode: number, body: string, headers?: {[header: string]: boolean | number | string}): APIGatewayProxyResult => {
    console.log('getSessionStatus log',
        {
            requestId: event.requestContext.requestId,
            requestPath: event.path,
            statusCode,
            event,
            body
        })
    const log = {
        requestId: event.requestContext.requestId,
        requestPath: event.path,
        statusCode
    }
    const response = {
        statusCode,
        body,
        headers
    }

    if(statusCode === 200) {
        console.log('getSessionStatus good response', log);
    } else {
        console.log('getSessionStatus error response', log)
    }

    return response
}