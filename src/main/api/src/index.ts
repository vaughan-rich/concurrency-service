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

    const user = event.pathParameters?.userId;
    const concurrentStreams = 1;

    if (user) {
        if (concurrentStreams <=3 ) {
            return generateResponse(event,
                200,
                JSON.stringify({
                    user: user,
                    concurrentStreams: concurrentStreams
                }),
                {
                    'content-type': 'application/json'
                });
        }
        else {
            return generateResponse(event, 400, 'User ' + user + ' is trying to watch ' + concurrentStreams + ' concurrent streams, which is too many.');
        }
    }
    else {
        return generateResponse(event, 404, 'No user found');
    }

}