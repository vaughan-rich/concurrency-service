import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
import {generateResponse} from './response-generator';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        return await processRequest(event)
    } catch (err) {
        console.error('getStatus unexpected error',
            {
                requestId: event.requestContext.requestId,
                requestPath: event.path,
                queryStringParameters: event.queryStringParameters,
                event,
                err
            });
        throw err;
    }
};

const processRequest = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {

    return generateResponse(event,
        200,
        JSON.stringify("Hello World"),
        {
            'content-type': 'application/json'
        });
}