export {};

declare global {
  interface Window {
    connectedWallet?: string; // 定義 connectedWallet 為可選的字串屬性
  }
}