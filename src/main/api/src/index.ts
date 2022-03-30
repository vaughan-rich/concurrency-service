import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
import {generateResponse} from './response-generator';
import {putUserStreamItem, getConcurrentStreams} from './userStreamRepository';

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
    if (!user) {
        return generateResponse(event, 400, 'Please specify a userId');
    }

    let concurrentStreams: number;
    try {
        concurrentStreams = await getConcurrentStreams(user);
    } catch (error) {
        const errorMessage = `DB query error: ${error.toString()}`;
        throw new Error(errorMessage);
    }

    if (concurrentStreams <=2 ) {
        try {
            await putUserStreamItem(user);
            concurrentStreams++
        } catch (error) {
            const errorMessage = `DB put error: ${error.toString()}`;
            throw new Error(errorMessage);
        }
        
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
        return generateResponse(event, 400, 'User ' + user + ' is trying to watch ' + (concurrentStreams+1) + ' concurrent streams, which is too many.');
    }
}