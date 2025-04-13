const AWS = require('aws-sdk');

// 使用自定義環境變數名稱
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
});

// 初始化 DynamoDB
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async () => {
  try {
    const params = {
      TableName: 'suai_history',
    };

    const result = await dynamoDb.scan(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: '伺服器錯誤' }),
    };
  }
};