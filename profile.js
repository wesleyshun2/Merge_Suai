import { loadHistory } from './src/historyHandler.js';
import { updateCodeStats, submitForm, toggleUploadForm, toggleTerms } from './src/uploadHandler.js';
import { useCurrentAccount } from '@mysten/dapp-kit';

// 綁定事件
document.getElementById('show-all').addEventListener('click', () => loadHistory(true));
document.getElementById('submit-btn').addEventListener('click', submitForm);
document.getElementById('code-snippet').addEventListener('input', (e) => updateCodeStats(e.target.value));
document.querySelector('.upload-trigger').addEventListener('click', toggleUploadForm);
document.getElementById('terms-summary').addEventListener('click', toggleTerms);

// 頁面載入時加載歷史紀錄
window.addEventListener('load', () => loadHistory());

// 初始化頁面時檢查錢包連接狀態
window.addEventListener('load', () => {
  const walletInput = document.getElementById('wallet');
  const walletError = document.getElementById('wallet-error');

  // 使用 `useCurrentAccount` 獲取當前連接的帳戶
  const account = useCurrentAccount();

  if (account) {
    // 如果有連接錢包，填入地址並隱藏錯誤訊息
    walletInput.value = account;
    walletInput.classList.remove('error');
    walletError.classList.add('hidden');
  } else {
    // 如果未連接錢包，顯示錯誤訊息
    walletInput.value = '';
    walletInput.classList.add('error');
    walletError.classList.remove('hidden');
  }
});