"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.putUserSessionItem = exports.getConcurrentSessions = exports.dynamoDB = void 0;
const dynamodb_1 = __importDefault(require("aws-sdk/clients/dynamodb"));
exports.dynamoDB = new dynamodb_1.default({ apiVersion: '2012-08-10' });
const getConcurrentSessions = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        TableName: "streaming-table",
        KeyConditionExpression: "#pk = :pk",
        ExpressionAttributeNames: {
            '#pk': 'pk'
        },
        ExpressionAttributeValues: {
            ':pk': {
                S: 'userId#' + userId
            }
        }
    };
    try {
        const userSessionItems = yield exports.dynamoDB.query(params).promise();
        console.log('User session items', JSON.stringify(userSessionItems));
        return userSessionItems;
    }
    catch (error) {
        console.log('Error fetching user session items', error);
        throw new Error(error);
    }
});
exports.getConcurrentSessions = getConcurrentSessions;
const putUserSessionItem = (userId, sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    const userSessionItem = {
        'pk': { 'S': 'userId#' + userId },
        'sk': { 'S': sessionId.toString() }
    };
    try {
        yield exports.dynamoDB
            .putItem({
            TableName: 'streaming-table',
            Item: userSessionItem
        })
            .promise();
    }
    catch (error) {
        console.log('Error putting user session item', error);
        throw new Error(error);
    }
    console.log('User session item inserted: ', userSessionItem);
});
exports.putUserSessionItem = putUserSessionItem;
