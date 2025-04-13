const AWS = require('aws-sdk');

// 使用自定義環境變數名稱
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
});

// 初始化 DynamoDB
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// 程式碼分析工具函數
const codeAnalyzer = {
  patterns: {
    emptyLine: /^\s*$/,
    singleLineComment: /^\s*\/\/.*/,
    multiLineComment: {
      start: /^\s*\/\*/,
      end: /\*\/\s*$/,
    },
    symbolsOnly: /^[{};[\](),]*$/,
  },

  analyze(code) {
    let effectiveLines = 0;
    let inCommentBlock = false;

    code.split('\n').forEach((line) => {
      const trimmed = line.trim();

      // 處理多行註解區塊
      if (inCommentBlock) {
        if (this.patterns.multiLineComment.end.test(trimmed)) {
          inCommentBlock = false;
        }
        return;
      }

      // 檢查各種排除條件
      if (this.patterns.emptyLine.test(trimmed)) return;
      if (this.patterns.singleLineComment.test(trimmed)) return;
      if (this.patterns.symbolsOnly.test(trimmed)) return;
      if (this.patterns.multiLineComment.start.test(trimmed)) {
        inCommentBlock = true;
        return;
      }

      effectiveLines++;
    });

    return effectiveLines;
  },
};

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    // 分析程式碼行數
    const codeLines = codeAnalyzer.analyze(data.codeSnippet);

    // 儲存到 suai_back
    const backParams = {
      TableName: 'suai_back',
      Item: {
        contractAddress: data.contractAddress, // 完整記錄wallet值
        id: Date.now().toString(),
        timestamp: data.timestamp,
        wallet: data.wallet, // 紀錄 wallet
        projectName: data.projectName,
        contractDescription: data.contractDescription,
        codeSnippet: data.codeSnippet,
        codeLines: codeLines, // 新增有效行數
      },
    };

    await dynamoDb.put(backParams).promise();

    // 儲存到 suai_history
    const historyParams = {
      TableName: 'suai_history',
      Item: {
        contractAddress: data.contractAddress.slice(-3), // 只記錄末 3 碼
        timestamp: data.timestamp,
        wallet: data.wallet, // 紀錄 wallet
        projectName: data.projectName,
        codeLines: codeLines, // 新增有效行數
      },
    };

    await dynamoDb.put(historyParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: '上傳成功', codeLines: codeLines }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: '伺服器錯誤' }),
    };
  }
};