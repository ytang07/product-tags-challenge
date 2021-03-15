const AWS = require('aws-sdk');
const ddbClient = new AWS.DynamoDB({region: 'us-east-1'});
const uuidByString = require('uuid-by-string');
const assert = require('assert');
exports.handler = async (event) => {
    // console.log(event);
    const name = event['name'];
    const price = event['price'];
    const tags = event['tags'];
    const id = uuidByString(name, 5);
    assert(name.length < 41, "name too long");
    assert(price >= 0.00, "price cannot be negative");
    tags.forEach(tag => {
        assert(tag.length > 0, "cannot have null or blank tags");
    })
    let entries = [];
    tags.forEach(tag =>{
        let entry = {
            PutRequest: {
                Item: {
                    "ProductId" : {S: id},
                    "Name" : {S: name},
                    "Price" : {N: price.toString()},
                    "Tag" : {S : tag},
                    "Tags": {SS: tags}
                }
            }
        };
        entries.push(entry);
    })
    // console.log(JSON.stringify(entries));
    var params = {
        RequestItems: {
            "test2": entries
        }
    };
    await ddbClient.batchWriteItem(params).promise();
    const putItem = {
        "ProductId" : {S: id},
        "Name" : {S: name},
        "Price" : {N: price},
        "Tags": {SS: tags}
    };
    const response = {
        statusCode: 201,
        body: JSON.stringify(AWS.DynamoDB.Converter.unmarshall(putItem)),
    };
    return response;
};
