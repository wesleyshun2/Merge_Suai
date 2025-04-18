import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import './App.css';

function App() {
    return (
        <div className="App">
            <div className="connect-button-container">
                <ConnectButton />
            </div>
            <header className="App-header"></header>
            <ConnectedAccount />
        </div>
    );
}

//檢查是否有連接的帳戶
function ConnectedAccount() { 
    const account = useCurrentAccount();
    if (!account) {
        return <div>Connect your wallet to check history and upload</div>;
    }

    // 將錢包地址存入全局變數
    window.connectedWallet = account.address;
    
    // 當更新全局變數時，觸發事件
    const event = new CustomEvent('walletUpdated', { detail: account.address });
    window.dispatchEvent(event);
}

export default App;