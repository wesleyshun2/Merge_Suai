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
    containsTextOrNumber: /[a-zA-Z0-9]/, // 檢查是否包含英文字母或數字
  },

  isIgnorableLine(line, inCommentBlock) {
    const trimmed = line.trim();

    // 如果在多行註解塊中，檢查是否結束
    if (inCommentBlock) {
      if (this.patterns.multiLineComment.end.test(trimmed)) {
        return { ignore: true, inCommentBlock: false };
      }
      return { ignore: true, inCommentBlock: true };
    }

    // 檢查是否為空行或單行註解
    if (
      this.patterns.emptyLine.test(trimmed) ||
      this.patterns.singleLineComment.test(trimmed)
    ) {
      return { ignore: true, inCommentBlock: false };
    }

    // 檢查是否為多行註解的開始
    if (this.patterns.multiLineComment.start.test(trimmed)) {
      return { ignore: true, inCommentBlock: true };
    }

    // 如果不是可忽略的行
    return { ignore: false, inCommentBlock: false };
  },

  analyze(code) {
    let effectiveLines = 0;
    let inCommentBlock = false;

    code.split('\n').forEach((line) => {
      const { ignore, inCommentBlock: updatedCommentBlock } = this.isIgnorableLine(
        line,
        inCommentBlock
      );
      inCommentBlock = updatedCommentBlock;

      if (!ignore && this.patterns.containsTextOrNumber.test(line.trim())) {
        effectiveLines++;
      }
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