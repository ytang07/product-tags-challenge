const AWS = require('aws-sdk');
const ddbClient = new AWS.DynamoDB({region: 'us-east-1'});
const assert = require('assert');
exports.handler = async (event) => {
    // console.log(event);
    const tags = event['queryStringParameters']['tags'].split(',');
    // console.log(tags);
    let allResponses = []
    tags.forEach(async function(tag) {
        assert(tag.length > 0, "cannot have null or blank tags");
        var params = {
            TableName: "test2",
            // IndexName: "Tag-Index",
            Select: "ALL_ATTRIBUTES",
            KeyConditionExpression: "Tag = :Tag",
            ExpressionAttributeValues: {
                ":Tag" : {S : tag}
            }
        };
        const getResponse = ddbClient.query(params).promise();
        allResponses.push(getResponse);
    });
    // await all query responses
    const awaitedResponses = await Promise.all(allResponses);
    // grab list of items with tag 1
    let responseItems = awaitedResponses[0]['Items']
    // grab list of product Ids to sort with later
    let productIds = []
    let productIdCounter = {}
    // check for number of times it appears
    responseItems.forEach(item => {
        const productId = item['ProductId']['S'];
        productIds.push(productId);
        productIdCounter[productId] = 0;
    });
    awaitedResponses.forEach(response => {
        response['Items'].forEach(item => {
            let productIndex = productIds.indexOf(item['ProductId']['S']);
            if (productIndex > -1) {
                productIdCounter[item['ProductId']['S']] += 1;
            }
        });
    });
    // check number of counters of product counter
    let records  = {};
    let _records = [];
    responseItems.forEach(item => {
        if (productIdCounter[item['ProductId']['S']] === tags.length) {
            delete item['Tag'];
            _records.push(AWS.DynamoDB.Converter.unmarshall(item));
        }
    });
    records['_records'] = _records;
    console.log(JSON.stringify(records));
    const response = {
        statusCode: 200,
        body: JSON.stringify(records),
    };
    return response;
};
