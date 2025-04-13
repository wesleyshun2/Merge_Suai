import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import App from './App';

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
const loadHistory = async (showAll: boolean, setHistory: React.Dispatch<React.SetStateAction<any[]>>) => {
  try {
    const response = await fetch('/.netlify/functions/get-history');
    const data = await response.json();
    setHistory(showAll ? data : data.slice(0, 5));
  } catch (error) {
    console.error(error);
    alert('查詢失敗，請稍後再試');
  }
};

// 主組件
const Main = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [formExpanded, setFormExpanded] = useState(false);

  useEffect(() => {
    loadHistory(false, setHistory);
  }, []);

  const toggleUploadForm = () => {
    setFormExpanded(!formExpanded);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    submitForm({
      contractAddress: formData.get('contract-address') as string,
      wallet: formData.get('wallet') as string,
      projectName: formData.get('project-name') as string,
      contractDescription: formData.get('contract-description') as string,
      codeSnippet: formData.get('code-snippet') as string,
    });
  };

  return (
    <div>
      <section className="upload-history">
        <h2>Upload History</h2>
        <ul>
          {history.length > 0 ? (
            history.map((item, index) => (
              <li key={index}>
                {new Date(item.timestamp).toLocaleString()} - {item.projectName} ({item.codeLines} lines)
              </li>
            ))
          ) : (
            <li>No history available</li>
          )}
        </ul>
        {!showAllHistory && history.length > 5 && (
          <button onClick={() => loadHistory(true, setHistory)}>Show Full History</button>
        )}
      </section>

      <div className="upload-section">
        <button onClick={toggleUploadForm}>
          {formExpanded ? 'Hide Upload Form' : 'Show Upload Form'}
        </button>
        {formExpanded && (
          <form onSubmit={handleSubmit}>
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
        )}
      </div>
    </div>
  );
};

// 渲染應用
ReactDOM.render(<Main />, document.getElementById('root'));