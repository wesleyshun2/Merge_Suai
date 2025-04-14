// 歷史紀錄加載函數
export async function loadHistory(showAll = false) {
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
      historyList.innerHTML = '<li class="no-data">Empty upload history</li>';
      showAllButton.classList.add('hidden'); // 如果沒有記錄，隱藏按鈕
    }
  } catch (error) {
    console.error(error);
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '<li class="error-msg">Reading failed, please try later</li>';
  }
}

// 網頁載入時執行
window.addEventListener('load', () => {
  loadHistory();
});