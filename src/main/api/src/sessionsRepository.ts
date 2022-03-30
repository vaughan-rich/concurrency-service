import DynamoDB from 'aws-sdk/clients/dynamodb'

export const dynamoDB = new DynamoDB({apiVersion: '2012-08-10'});
export const getConcurrentSessions = async (userId: String): Promise<DynamoDB.QueryOutput> => {
    const params: DynamoDB.QueryInput = {
        TableName : "streaming-table",
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
        const userSessionItems = await dynamoDB.query(params).promise();
        console.log('User session items', JSON.stringify(userSessionItems));
        return userSessionItems;
    } catch (error) {
        console.log('Error fetching user session items', error)
        throw new Error(error);
    }
}

export const putUserSessionItem = async (userId: String, sessionId: String): Promise<void> => {
    const userSessionItem = {
        'pk': {'S': 'userId#' + userId},
        'sk': {'S': sessionId.toString()}
    };
    try {
        await dynamoDB
            .putItem({
                TableName: 'streaming-table',
                Item: userSessionItem
            })
            .promise();
    } catch (error) {
        console.log('Error putting user session item', error)
        throw new Error(error);
    }
    console.log('User session item inserted: ', userSessionItem);
}