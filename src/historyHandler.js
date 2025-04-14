// 歷史紀錄加載函數
export async function loadHistory(showAll = false) {
  try {
    // 獲取全局變數 window.connectedWallet
    const walletAddress = window.connectedWallet || 'Not connected';

    // 如果未連結錢包，顯示錯誤訊息並停止執行
    if (walletAddress === 'Not connected') {
      const historyList = document.getElementById('history-list');
      if (historyList) {
        historyList.innerHTML = '<li class="error-msg">Please connect your wallet to view history</li>';
      }
      return;
    }

    // 向後端發送請求，附加錢包地址作為查詢參數
    const response = await fetch(`/.netlify/functions/get-history?wallet=${encodeURIComponent(walletAddress)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.statusText}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid API response format.');
    }

    const historyList = document.getElementById('history-list');
    const showAllButton = document.getElementById('show-all');

    if (!historyList || !showAllButton) {
      console.error('Required DOM elements are missing.');
      return;
    }

    historyList.innerHTML = ''; // 清空現有內容

    if (data.length > 0) {
      // 按時間由新到舊排序
      const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // 如果只顯示部分記錄，限制為前 5 筆
      const recordsToShow = showAll ? sortedData : sortedData.slice(0, 5);

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
      historyList.innerHTML = '<li class="no-data">Empty upload history</li>';
      showAllButton.classList.add('hidden'); // 如果沒有記錄，隱藏按鈕
    }
  } catch (error) {
    console.error('Error loading history:', error);
    const historyList = document.getElementById('history-list');
    if (historyList) {
      historyList.innerHTML = '<li class="error-msg">Reading failed, please try later</li>';
    }
  }
}

// 網頁載入時執行
window.addEventListener('load', () => {
  // 初次檢查是否已連結錢包
  if (window.connectedWallet) {
    loadHistory();
  }

  // 監聽錢包地址更新事件
  window.addEventListener('walletUpdated', () => {
    loadHistory();
  });
});