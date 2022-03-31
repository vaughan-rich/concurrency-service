import {handler} from '../src';
import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
import DynamoDB from 'aws-sdk/clients/dynamodb'
import * as noSessionsEvent from './fixtures/noSessionEvent.json';
import * as twoSessionEvent from './fixtures/twoSessionEvent.json';
import * as fourSessionEvent from './fixtures/fourSessionEvent.json';
import * as missingSessionIdEvent from './fixtures/missingSessionIdEvent.json';
import * as missingUserIdEvent from './fixtures/missingUserIdEvent.json';
import * as noItemsInDB from './fixtures/noItemsInDB.json';
import * as oneItemInDB from './fixtures/oneItemInDB.json';
import * as threeItemsInDB from './fixtures/threeItemsInDB.json';

const firstSession = noSessionsEvent as unknown as APIGatewayEvent;
const twoSessions = twoSessionEvent as unknown as APIGatewayEvent;
const fourSessions = fourSessionEvent as unknown as APIGatewayEvent;
const noSession = missingSessionIdEvent as unknown as APIGatewayEvent;
const noUser = missingUserIdEvent as unknown as APIGatewayEvent;
const noItems = noItemsInDB as unknown as DynamoDB.QueryOutput;
const oneItem = oneItemInDB as unknown as DynamoDB.QueryOutput;
const threeItems = threeItemsInDB as unknown as DynamoDB.QueryOutput;

jest.mock('../src/sessionsRepository', () => ({
    getConcurrentSessions: (userId: string): any => {
        if (userId === 'oneSessionUser'){
            return noItems;
        }
        else if (userId === 'twoSessionUser'){
            return oneItem;
        }
        else if (userId === 'fourSessionUser'){
            return threeItems;
        }
    },
    putUserSessionItem: async (userId: String, sessionId: String): Promise<void> => {
        // Bypass DB insertion during unit tests
    }
}))

describe('acceptance criteria', () => {

    it('should present a success response, if this is a user\'s first stream', async () => {
        await shouldReturnSuccessCodeFirstStream(firstSession); 
    });

    it('should present a success response, if this is a user\'s second stream', async () => {
        await shouldReturnSuccessCodeSecondStream(twoSessions); 
    });

    it('should present an error response, if this is a user\'s attempted fourth concurrent stream', async () => {
        await shouldReturnErrorCodeFourthStream(fourSessions);
    });

});

describe('unhappy paths', () => {

    it('should present an error response, if the client doesn\'t provide a userId', async () => {
        await shouldReturnErrorCodeWhenMissingUserOrSessionId(noUser); 
    });

    it('should present an error response, if the client doesn\'t provide a sessionId', async () => {
       await shouldReturnErrorCodeWhenMissingUserOrSessionId(noSession); 
    });

});

const shouldReturnSuccessCodeFirstStream = async (event: APIGatewayEvent): Promise<void> => {
    const response: APIGatewayProxyResult = await handler(event);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual('{"user":"oneSessionUser","concurrentSessions":1}');
}

const shouldReturnSuccessCodeSecondStream = async (event: APIGatewayEvent): Promise<void> => {
    const response: APIGatewayProxyResult = await handler(event);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual('{"user":"twoSessionUser","concurrentSessions":2}');
}

const shouldReturnErrorCodeFourthStream = async (event: APIGatewayEvent): Promise<void> => {
    const response: APIGatewayProxyResult = await handler(event);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual('User fourSessionUser is trying to watch 4 streams at once, which is too many.');
}

const shouldReturnErrorCodeWhenMissingUserOrSessionId = async (event: APIGatewayEvent): Promise<void> => {
    const response: APIGatewayProxyResult = await handler(event);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual('Please specify a userId and sessionId');
}

// TODO: OTHER TEST CASES

/*describe('other scenarios', () => {

    it('should not increase concurrent session count, if the sessionId provided already exists in the db for that user', async () => {
        // TODO
    });

    it('should increase concurrent session count, if the sessionId provided doesn\'t already exist in the db for that user', async () => {
        // TODO
    });

});*/
