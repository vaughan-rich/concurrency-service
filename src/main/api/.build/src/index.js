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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.maxStreams = void 0;
const response_generator_1 = require("./response-generator");
const sessionsRepository_1 = require("./sessionsRepository");
exports.maxStreams = parseInt(process.env.MAX_CONCURRENT_STREAMS);
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield processRequest(event);
    }
    catch (err) {
        console.error('getSessionStatus unexpected error', {
            requestId: event.requestContext.requestId,
            requestPath: event.path,
            event,
            err
        });
        throw err;
    }
});
exports.handler = handler;
const processRequest = (event) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const user = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.userId;
    const session = (_b = event.pathParameters) === null || _b === void 0 ? void 0 : _b.sessionId;
    if (!user || !session) {
        return (0, response_generator_1.generateResponse)(event, 400, 'Please specify a userId and sessionId');
    }
    let concurrentSessions;
    let sessionsList;
    try {
        const sessions = yield (0, sessionsRepository_1.getConcurrentSessions)(user);
        sessionsList = (_c = sessions.Items) === null || _c === void 0 ? void 0 : _c.map(x => x.sk.S);
        concurrentSessions = (_d = sessions.Count) !== null && _d !== void 0 ? _d : 0;
    }
    catch (error) {
        const errorMessage = `DB query error: ${error.toString()}`;
        throw new Error(errorMessage);
    }
    if (sessionsList === null || sessionsList === void 0 ? void 0 : sessionsList.includes(session)) { // this session is already active, so skip adding to the DB
        if (concurrentSessions <= exports.maxStreams) {
            return (0, response_generator_1.generateResponse)(event, 200, JSON.stringify({
                user: user,
                concurrentSessions: concurrentSessions
            }), {
                'content-type': 'application/json'
            });
        }
        else {
            return (0, response_generator_1.generateResponse)(event, 400, 'User ' + user + ' is trying to watch ' + concurrentSessions + ' streams at once, which is too many.');
        }
    }
    else {
        if (concurrentSessions <= (exports.maxStreams - 1)) {
            try {
                yield (0, sessionsRepository_1.putUserSessionItem)(user, session);
                concurrentSessions++;
            }
            catch (error) {
                const errorMessage = `DB put error: ${error.toString()}`;
                throw new Error(errorMessage);
            }
            return (0, response_generator_1.generateResponse)(event, 200, JSON.stringify({
                user: user,
                concurrentSessions: concurrentSessions
            }), {
                'content-type': 'application/json'
            });
        }
        else {
            return (0, response_generator_1.generateResponse)(event, 400, 'User ' + user + ' is trying to watch ' + (concurrentSessions + 1) + ' streams at once, which is too many.');
        }
    }
});
