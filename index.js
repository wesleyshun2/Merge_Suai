// 程式碼分析工具函數
const codeAnalyzer = {
  // 排除規則 (可自行擴充)
  patterns: {
    emptyLine: /^\s*$/,
    singleLineComment: /^\s*\/\/.*/,
    multiLineComment: {
      start: /^\s*\/\*/,
      end: /\*\/\s*$/
    },
    symbolsOnly: /^[{};[\](),]*$/
  },

  // 主要分析函數
  analyze(code) {
    let effectiveLines = 0;
    let inCommentBlock = false;

    code.split('\n').forEach(line => {
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
  }
};

// 即時更新統計數據 (加入防抖機制)
let updateTimeout;
function updateCodeStats(code) {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    const lines = codeAnalyzer.analyze(code);
    document.getElementById('effective-lines').textContent = lines;
  }, 300); // 300ms 防抖延遲
}

// 表單驗證與提交
function validateForm() {
  let isValid = true;
  
  // 檢查每個必填欄位
  document.querySelectorAll('.required input, .required textarea').forEach(input => {
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
async function submitForm() {
  if (!validateForm()) return;

  const formData = {
    timestamp: new Date().toISOString(),
    contractAddress: document.getElementById('contract-address').value, // 確保智能合約地址正確傳遞
    wallet: document.getElementById('wallet').value,
    projectName: document.getElementById('project-name').value,
    contractDescription: document.getElementById('contract-description').value,
    codeSnippet: document.getElementById('code-snippet').value,
  };

  // 新增行數驗證
  const codeLines = codeAnalyzer.analyze(formData.codeSnippet);
  if (codeLines < 1) {
    showMessage('程式碼內容不可為空', 'error');
    return;
  }

  try {
    // 呼叫 Netlify Function
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

// 新增表單切換函數
let isFormExpanded = false;

function toggleUploadForm() {
  const form = document.getElementById('upload-form'); // 確保正確選取表單
  const trigger = document.querySelector('.upload-trigger');

  isFormExpanded = !isFormExpanded;
  form.classList.toggle('hidden', !isFormExpanded); // 切換 hidden 類別
  trigger.style.borderStyle = isFormExpanded ? 'solid' : 'dashed';

  // 動畫控制（可選）
  form.style.maxHeight = isFormExpanded ? '1000px' : '0';
}

// 歷史紀錄加載函數
async function loadHistory(showAll = false) {
  try {
    const response = await fetch('/.netlify/functions/get-history');
    const data = await response.json();

    const historyList = document.getElementById('history-list');
    const showAllButton = document.getElementById('show-all');
    historyList.innerHTML = ''; // 清空現有內容

    if (data.length > 0) {
      // 如果只顯示部分記錄，限制為前 5 筆
      const recordsToShow = showAll ? data : data.slice(0, 5);

      recordsToShow.forEach((item) => {
        const listItem = document.createElement('li');
        // 格式化時間
        const formattedTime = new Date(item.timestamp).toLocaleString();
        // 顯示縮略的合約地址、專案名稱、程式碼行數和上傳時間，使用 3 個空格分隔
        listItem.textContent = `${formattedTime}   ...${item.contractAddress}   ${item.projectName}   ${item.codeLines} lines`;
        historyList.appendChild(listItem);
      });

      // 如果顯示所有記錄，隱藏按鈕
      if (showAll) {
        showAllButton.classList.add('hidden');
      } else {
        showAllButton.classList.remove('hidden');
      }
    } else {
      historyList.innerHTML = '<li class="no-data">無上傳紀錄</li>';
      showAllButton.classList.add('hidden'); // 如果沒有記錄，隱藏按鈕
    }
  } catch (error) {
    console.error(error);
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '<li class="error-msg">查詢失敗，請稍後再試</li>';
  }
}

// 條款切換函數
function toggleTerms() {
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

// 網頁載入時執行
window.addEventListener('load', () => {
  loadHistory();
});
window.loadHistory = loadHistory;
window.toggleUploadForm = toggleUploadForm;
