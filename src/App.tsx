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
    return null;
}

export default App;