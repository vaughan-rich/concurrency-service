import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
import {generateResponse} from './response-generator';
import {putUserSessionItem, getConcurrentSessions} from './sessionsRepository';

export const maxStreams = parseInt(process.env.MAX_CONCURRENT_STREAMS!);

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        return await processRequest(event)
    } catch (err) {
        console.error('getSessionStatus unexpected error',
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
    const session = event.pathParameters?.sessionId;
    if (!user || !session) {
        return generateResponse(event, 400, 'Please specify a userId and sessionId');
    }

    let concurrentSessions: number;
    let sessionsList: any;
    try {
        const sessions = await getConcurrentSessions(user);
        sessionsList = sessions.Items?.map(x => x.sk.S);
        concurrentSessions = sessions.Count ?? 0;
    } catch (error) {
        const errorMessage = `DB query error: ${error.toString()}`;
        throw new Error(errorMessage);
    }

    if (sessionsList.includes(session)) { //this session is already active, so skip adding to the DB
        if (concurrentSessions <= maxStreams) {
            return generateResponse(event,
                200,
                JSON.stringify({
                    user: user,
                    concurrentSessions: concurrentSessions
                }),
                {
                    'content-type': 'application/json'
                });    
        }
        else {
            return generateResponse(event, 400, 'User ' + user + ' is trying to watch ' + concurrentSessions + ' streams at once, which is too many.');    
        }
    }
    else {
        if (concurrentSessions <= (maxStreams-1)) {
            try {
                await putUserSessionItem(user, session);
                concurrentSessions++
            } catch (error) {
                const errorMessage = `DB put error: ${error.toString()}`;
                throw new Error(errorMessage);
            }  
            
            return generateResponse(event,
                200,
                JSON.stringify({
                    user: user,
                    concurrentSessions: concurrentSessions
                }),
                {
                    'content-type': 'application/json'
                });  
        }
        else {
            return generateResponse(event, 400, 'User ' + user + ' is trying to watch ' + (concurrentSessions+1) + ' streams at once, which is too many.');
        }
    }
}