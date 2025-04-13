import { loadHistory } from './src/historyHandler.js';
import { updateCodeStats, submitForm, toggleUploadForm, toggleTerms } from './src/uploadHandler.js';

// 綁定事件
document.getElementById('show-all').addEventListener('click', () => loadHistory(true));
document.getElementById('submit-btn').addEventListener('click', submitForm);
document.getElementById('code-snippet').addEventListener('input', (e) => updateCodeStats(e.target.value));
document.querySelector('.upload-trigger').addEventListener('click', toggleUploadForm);
document.getElementById('terms-summary').addEventListener('click', toggleTerms);

// 頁面載入時加載歷史紀錄
window.addEventListener('load', () => loadHistory());