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

// 即時更新統計數據
let updateTimeout;
export function updateCodeStats(code) {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    const lines = codeAnalyzer.analyze(code);
    document.getElementById('effective-lines').textContent = lines;
  }, 300); // 300ms 防抖延遲
}

// 獲取全局變數 window.connectedWallet
function getWalletAddress() {
  return window.connectedWallet || 'Not connected';
}

// 表單驗證與提交
function validateForm() {
  let isValid = true;

  document.querySelectorAll('.required input, .required textarea').forEach((input) => {
    if (!input.value.trim()) {
      input.classList.add('error');
      isValid = false;
    } else {
      input.classList.remove('error');
    }
  });

  return isValid;
}

// 顯示提示訊息的函數
function showMessage(message, type = 'success') {
  const messageBox = document.getElementById('message-box');
  const submitButton = document.getElementById('submit-btn');

  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;
  messageBox.style.display = 'block';

  // 將提示訊息移動到 Submit 按鈕的上方
  submitButton.parentNode.insertBefore(messageBox, submitButton);
}

// 表單提交函數
export async function submitForm() {
    // 檢查是否連結錢包
    const walletAddress = getWalletAddress();
    if (walletAddress === 'Not connected') {
        showMessage('Please connect your wallet before uploading.', 'error'); // 提示要求連結錢包
        return;
    }

    if (!validateForm()) return;

    const formData = {
        timestamp: new Date().toISOString(),
        contractAddress: document.getElementById('contract-address').value,
        wallet: walletAddress, // 使用檢查後的錢包地址
        projectName: document.getElementById('project-name').value,
        contractDescription: document.getElementById('contract-description').value,
        codeSnippet: document.getElementById('code-snippet').value,
    };

    const codeLines = codeAnalyzer.analyze(formData.codeSnippet);
    if (codeLines < 1) {
        showMessage('Code content cannot be empty', 'error'); // 程式碼內容不可為空
        return;
    }

    try {
        const response = await fetch('/.netlify/functions/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Upload failed');

        showMessage('Upload successful!', 'success'); // 上傳成功！
        document.getElementById('upload-form').reset();
    } catch (error) {
        showMessage('Upload failed, please try again later', 'error'); // 上傳失敗，請稍後再試
        console.error(error);
    }
}

// 表單切換函數
export function toggleUploadForm() {
  const form = document.getElementById('upload-form');
  const trigger = document.querySelector('.upload-trigger');

  const isFormExpanded = !form.classList.contains('hidden');
  form.classList.toggle('hidden', isFormExpanded);
  trigger.style.borderStyle = isFormExpanded ? 'dashed' : 'solid';

  form.style.maxHeight = isFormExpanded ? '0' : '1000px';
}

// 條款切換函數
export function toggleTerms() {
  const termsContent = document.getElementById('terms-content');
  const termsSummary = document.getElementById('terms-summary');

  if (termsContent.classList.contains('hidden')) {
    termsContent.classList.remove('hidden');
    termsSummary.textContent = 'By uploading, you agree to the terms ▲'; // 上傳即表示同意條款 ▲
  } else {
    termsContent.classList.add('hidden');
    termsSummary.textContent = 'By uploading, you agree to the terms ▼'; // 上傳即表示同意條款 ▼
  }
}