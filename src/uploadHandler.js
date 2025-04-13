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

      if (inCommentBlock) {
        if (this.patterns.multiLineComment.end.test(trimmed)) {
          inCommentBlock = false;
        }
        return;
      }

      if (
        this.patterns.emptyLine.test(trimmed) ||
        this.patterns.singleLineComment.test(trimmed) ||
        this.patterns.symbolsOnly.test(trimmed) ||
        this.patterns.multiLineComment.start.test(trimmed)
      ) {
        inCommentBlock = true;
        return;
      }

      effectiveLines++;
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
  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;
  messageBox.style.display = 'block';
}

// 表單提交函數
export async function submitForm() {
  if (!validateForm()) return;

  const formData = {
    timestamp: new Date().toISOString(),
    contractAddress: document.getElementById('contract-address').value,
    wallet: document.getElementById('wallet').value,
    projectName: document.getElementById('project-name').value,
    contractDescription: document.getElementById('contract-description').value,
    codeSnippet: document.getElementById('code-snippet').value,
  };

  const codeLines = codeAnalyzer.analyze(formData.codeSnippet);
  if (codeLines < 1) {
    showMessage('程式碼內容不可為空', 'error');
    return;
  }

  try {
    const response = await fetch('/.netlify/functions/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error('Upload failed');

    showMessage('上傳成功！', 'success');
    document.getElementById('upload-form').reset();
  } catch (error) {
    showMessage('上傳失敗，請稍後再試', 'error');
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
    termsSummary.textContent = '上傳即表示同意條款 ▲';
  } else {
    termsContent.classList.add('hidden');
    termsSummary.textContent = '上傳即表示同意條款 ▼';
  }
}