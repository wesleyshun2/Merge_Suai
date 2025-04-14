import { loadHistory } from './src/historyHandler.js';
import { updateCodeStats, submitForm, toggleUploadForm, toggleTerms } from './src/uploadHandler.js';

window.addEventListener('DOMContentLoaded', () => {
    // 綁定事件
    const showAllButton = document.getElementById('show-all');
    if (showAllButton) {
        showAllButton.addEventListener('click', () => loadHistory(true));
    }

    const submitButton = document.getElementById('submit-btn');
    if (submitButton) {
        submitButton.addEventListener('click', submitForm);
    }

    const codeSnippet = document.getElementById('code-snippet');
    if (codeSnippet) {
        codeSnippet.addEventListener('input', (e) => updateCodeStats(e.target.value));
    }

    const uploadTrigger = document.querySelector('.upload-trigger');
    if (uploadTrigger) {
        uploadTrigger.addEventListener('click', toggleUploadForm);
    }

    const termsSummary = document.getElementById('terms-summary');
    if (termsSummary) {
        termsSummary.addEventListener('click', toggleTerms);
    }

    // 顯示錢包地址
    displayWalletAddress();
});

// 監聽錢包地址更新事件
window.addEventListener('walletUpdated', (event) => {
    const walletElement = document.getElementById('wallet-display');
    if (walletElement) {
        walletElement.textContent = event.detail || 'Not connected';
    }
});

// 顯示錢包地址
function displayWalletAddress() {
    const walletElement = document.getElementById('wallet-address');
    if (!walletElement) {
        return;
    }

    const checkWallet = () => {
        const walletAddress = window.connectedWallet || 'Not connected';
        walletElement.textContent = walletAddress;
        if (!window.connectedWallet) {
            setTimeout(checkWallet, 500); // 每 500 毫秒檢查一次
        }
    };

    checkWallet();
}

// 頁面載入時加載歷史紀錄
window.addEventListener('load', () => loadHistory());