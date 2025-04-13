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
        return <div>Connected to check history or upload</div>;
    }

    // 將錢包地址存入全局變數
    window.connectedWallet = account.address;
    return <div>Connected Wallet: {account.address}</div>;
}

export default App;