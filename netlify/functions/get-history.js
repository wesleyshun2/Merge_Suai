const AWS = require('aws-sdk');

// 使用自定義環境變數名稱
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
});

// 初始化 DynamoDB
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    // 從查詢參數中獲取錢包地址
    const wallet = event.queryStringParameters && event.queryStringParameters.wallet;

    if (!wallet) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Wallet address is required' }),
      };
    }

    // 查詢 DynamoDB，根據錢包地址過濾資料
    const params = {
      TableName: 'suai_history',
      KeyConditionExpression: 'wallet = :wallet',
      ExpressionAttributeValues: {
        ':wallet': wallet,
      },
    };

    const result = await dynamoDb.query(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error('Error querying DynamoDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: '伺服器錯誤' }),
    };
  }
};