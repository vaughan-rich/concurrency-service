import DynamoDB from 'aws-sdk/clients/dynamodb'

export const dynamoDB = new DynamoDB({apiVersion: '2012-08-10'});
export const putUserStreamItem = async (userId: String): Promise<void> => {
    const userStreamItem = {
        'pk': {'S': 'userId#' + userId},
        'sk': {'S': userId + '#' + Math.random().toString(36).slice(2)} // concatenated with random streamId
    };
    try {
        await dynamoDB
            .putItem({
                TableName: 'streaming-table',
                Item: userStreamItem
            })
            .promise();
    } catch (error) {
        console.log('Error putting user stream item', error)
        throw new Error(error);
    }
    console.log('User stream item inserted: ', userStreamItem);
}

export const getConcurrentStreams = async (userId: String): Promise<number> => {
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
        const userStreamItems = await dynamoDB.query(params).promise();
        console.log('User stream items', userStreamItems);
        return userStreamItems.Count ?? 0;
    } catch (error) {
        console.log('Error putting user stream item', error)
        throw new Error(error);
    }
}