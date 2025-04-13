import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

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

  analyze(code: string): number {
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

// 表單提交邏輯
const submitForm = async (formData: {
  contractAddress: string;
  wallet: string;
  projectName: string;
  contractDescription: string;
  codeSnippet: string;
}) => {
  const codeLines = codeAnalyzer.analyze(formData.codeSnippet);
  if (codeLines < 1) {
    alert('程式碼內容不可為空');
    return;
  }

  try {
    const response = await fetch('/.netlify/functions/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, timestamp: new Date().toISOString() }),
    });

    if (!response.ok) throw new Error('Upload failed');
    alert('上傳成功！');
  } catch (error) {
    console.error(error);
    alert('上傳失敗，請稍後再試');
  }
};

// 歷史紀錄邏輯
const loadHistory = async (setHistory: React.Dispatch<React.SetStateAction<any[]>>) => {
  try {
    const response = await fetch('/.netlify/functions/get-history');
    const data = await response.json();
    setHistory(data);
  } catch (error) {
    console.error(error);
    alert('查詢失敗，請稍後再試');
    setHistory([]); // 返回空數組以避免後續邏輯出錯
  }
};

// 主組件
const Main = () => {
  interface HistoryItem {
    timestamp: string;
    projectName: string;
    codeLines: number;
  }

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    loadHistory(setHistory);
  }, [loadHistory]);

  const displayedHistory = showAllHistory ? history : history.slice(0, 5);

  return (
    <div>
      <section className="upload-history">
        <h2>Upload History</h2>
        <ul>
          {displayedHistory.length > 0 ? (
            displayedHistory.map((item, index) => (
              <li key={index}>
                {new Date(item.timestamp).toLocaleString()} - {item.projectName} ({item.codeLines} lines)
              </li>
            ))
          ) : (
            <li>No history available</li>
          )}
        </ul>
        {!showAllHistory && history.length > 5 && (
          <button onClick={() => setShowAllHistory(true)}>Show Full History</button>
        )}
      </section>

      <div className="upload-section">
        <form
          onSubmit={(event) => {
            event.preventDefault(); // 防止默認的表單提交行為
            const formData = new FormData(event.currentTarget);
            submitForm({
              wallet: formData.get('wallet') as string,
              contractAddress: formData.get('contract-address') as string,
              projectName: formData.get('project-name') as string,
              contractDescription: formData.get('contract-description') as string,
              codeSnippet: formData.get('code-snippet') as string,
            });
          }}
        >
          <div>
            <label>Wallet Address</label>
            <input type="text" name="wallet" required />
          </div>
          <div>
            <label>Contract Address</label>
            <input type="text" name="contract-address" required />
          </div>
          <div>
            <label>Project Name</label>
            <input type="text" name="project-name" required />
          </div>
          <div>
            <label>Contract Description</label>
            <textarea name="contract-description" required />
          </div>
          <div>
            <label>Code Snippet</label>
            <textarea name="code-snippet" required />
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

// 渲染應用
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}
const root = ReactDOM.createRoot(rootElement);
root.render(<Main />);