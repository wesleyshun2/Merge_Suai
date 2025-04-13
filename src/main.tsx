import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getFullnodeUrl } from '@mysten/sui/client';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import App from './App';
import { UploadHistory, UploadForm } from './profile';
import './App.css';

// 初始化 QueryClient 和網絡配置
const queryClient = new QueryClient();
const networks = {
  devnet: { url: getFullnodeUrl('devnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
  testnet: { url: getFullnodeUrl('testnet') },
};

// 主應用組件
const Main = () => {
  return (
    <div>
      <App />
      <UploadHistory />
      <UploadForm />
    </div>
  );
};

// 渲染應用
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider>
          <Main />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </StrictMode>
);