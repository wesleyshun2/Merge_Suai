// 預設語言切換
function changeLanguage() {
    const lang = document.getElementById("language-select").value;
    if (lang === "zh") {
        document.getElementById("intro-title").textContent = "歡迎來到 Suai 項目";
        document.getElementById("intro-description").textContent = "[項目介紹占位]";
        document.getElementById("connect-wallet-btn").textContent = "連結錢包";
        document.getElementById("profile-btn").textContent = "前往個人資料頁面";
    } else {
        document.getElementById("intro-title").textContent = "Welcome to Suai Project";
        document.getElementById("intro-description").textContent = "[Project introduction placeholder]";
        document.getElementById("connect-wallet-btn").textContent = "Connect Wallet";
        document.getElementById("profile-btn").textContent = "Go to Profile";
    }
}

// 模擬連結錢包功能
function connectWallet() {
    alert("Wallet connected!");
    document.getElementById("connect-wallet-btn").style.display = "none";
    document.getElementById("profile-btn").style.display = "inline-block";
}

// 模擬前往個人資料頁面
function goToProfile() {
    alert("Redirecting to profile page...");
}
