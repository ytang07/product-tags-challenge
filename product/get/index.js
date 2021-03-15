const AWS = require('aws-sdk');
const ddbClient = new AWS.DynamoDB({region: 'us-east-1'});
const assert = require('assert');
exports.handler = async (event) => {
    // console.log(event);
    const productId = event['pathParameters']['productid'];
    // console.log(productId)
    var params = {
        TableName: "test2",
        IndexName: "ProductId-index",
        Select: "ALL_ATTRIBUTES",
        KeyConditionExpression: "ProductId = :ProductId",
        ExpressionAttributeValues: {
            ":ProductId" : {S : productId}
        }
    };
    const getResponse = await ddbClient.query(params).promise();
    // console.log(JSON.stringify(getResponse));
    assert(getResponse['Items'].length > 0, "no items match this product id")
    let item = getResponse['Items'][0]
    console.log(JSON.stringify(item));
    delete item['Tag'];
    let unmarshalled = AWS.DynamoDB.Converter.unmarshall(item)
    const response = {
        statusCode: 200,
        body: JSON.stringify(unmarshalled),
    };
    return response;
};
