export {};

declare global {
  interface Window {
    formattedWallet: string; // 定義 formattedWallet 為字串屬性
    connectedWallet?: string; // 定義 connectedWallet 為可選的字串屬性
  }
}