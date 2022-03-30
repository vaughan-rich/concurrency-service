import DynamoDB, {Put} from 'aws-sdk/clients/dynamodb'

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
    }
    console.log('User stream item inserted: ', userStreamItem);
}