# ClaudeBot — AI Trading Bot with MetaMask

**AI-powered crypto trading signals using Claude + MetaMask Mobile + Termux on OPPO Android**

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg)

---

## 🎯 What is ClaudeBot?

ClaudeBot is a **decentralized AI trading bot** that runs on your OPPO Android phone via Termux. It:

- 🤖 Uses **Claude AI** for market analysis and trading signals
- 🦊 Connects to **MetaMask Mobile** for wallet management
- 📱 Runs locally on your phone (no cloud dependencies)
- 💰 Generates BUY/SELL/HOLD signals with confidence scores
- ⚡ Works on **Ethereum, Polygon, Arbitrum, Optimism, Base**
- 🔒 Keeps your private keys secure (never exposed)

---

## ✨ Features

### AI-Powered Analysis
- Claude Sonnet 4 model integration
- Real-time market analysis
- Trading signal generation (BUY/SELL/HOLD)
- Confidence scoring (0-100%)
- Stop-loss & take-profit recommendations

### Wallet Integration
- MetaMask Mobile native support
- WalletConnect v2 fallback
- Multi-chain support
- QR code scanning
- Deep linking

### Mobile Optimized
- Built for OPPO ColorOS 16
- Termux automation (1-click setup)
- Battery optimization tips
- Split-screen support
- Offline-first design

### Developer Friendly
- React + Vite frontend
- Express.js proxy server
- Comprehensive API endpoints
- Full error handling
- Production-ready code

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- OPPO phone with ColorOS 15+
- 2GB free storage
- Stable WiFi
- Anthropic API key (free tier available)
- WalletConnect Project ID (free)

### One-Command Setup

```bash
# Download and run setup script
curl -sL https://raw.githubusercontent.com/Bluemos86/Claude-metamask-bot/main/SETUP-OPPO-TERMUX.sh | bash
```

Or manually:

```bash
# 1. Install Termux from F-Droid (not Play Store!)
# 2. Open Termux and run:
pkg update && pkg upgrade -y
pkg install -y nodejs
git clone https://github.com/Bluemos86/Claude-metamask-bot.git
cd Claude-metamask-bot
npm install
```

### Configure

```bash
# Copy environment template
cp .env.example .env

# Edit with your keys
nano .env
```

Fill in:
- `CLAUDE_API_KEY`: Get from https://console.anthropic.com
- `WC_PROJECT_ID`: Get from https://cloud.walletconnect.com

### Run

```bash
# Start bot + server
npm start

# Or manually:
npm run server &
npm run dev
```

Then open **MetaMask Mobile** → **Browser** → `http://localhost:5173`

---

## 🔧 Configuration

### Environment Variables (`.env`)

```env
# REQUIRED
CLAUDE_API_KEY=sk-ant-xxxxx
WC_PROJECT_ID=your_project_id

# OPTIONAL
NODE_ENV=development
PORT=3001
VITE_PORT=5173
```

### Bot Settings (In UI)

- **Trading Pair**: ETH/USDT, BTC/USDT, SOL/USDT, etc.
- **Strategy**: Trend Following, Mean Reversion, Momentum Scalping, etc.
- **Network**: Ethereum, Polygon, Arbitrum, Optimism, Base
- **Trade Size**: 0.01 - 1 ETH (configurable)
- **Slippage Tolerance**: 0.1% - 5%

---

## 📚 API Reference

### `/api/signal` (POST)

Generate trading signal via Claude AI.

```bash
curl -X POST http://localhost:3001/api/signal \
  -H "Content-Type: application/json" \
  -d '{
    "pair": "ETH/USDT",
    "strategy": "Trend Following",
    "price": 3142.50
  }'
```

**Response**:
```json
{
  "success": true,
  "action": "BUY",
  "confidence": 82,
  "reason": "Bullish crossover on 4H timeframe",
  "sl": 3050,
  "tp": 3300
}
```

### `/api/analyze` (POST)

Get market analysis from Claude.

```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"question": "Is ETH bullish right now?"}'
```

### `/health` (GET)

Check server status.

```bash
curl http://localhost:3001/health
```

---

## 🔴 Troubleshooting

### "Cannot find localhost:5173"

**Cause**: Vite dev server not running  
**Fix**:
```bash
cd Claude-metamask-bot
npm run dev
```

### "MetaMask says 'Cannot reach this site'"

**Cause**: Server died or Termux in background  
**Fix**:
```bash
# Check if server running:
ps aux | grep node

# Restart:
npm run server
```

### "API Error: 401 Unauthorized"

**Cause**: Invalid Claude API key  
**Fix**:
```bash
# Verify .env:
cat .env

# Update if needed:
nano .env
```

### "Termux process killed by OPPO"

**Cause**: Child process restrictions (ColorOS 15+)  
**Fix** (CRITICAL for OPPO):
```
Settings → About Phone → Build Number (tap 7x)
  ↓
Settings → System → Developer Options
  ↓
Enable: "Disable Child Process Restrictions"
  ↓
Restart Termux
```

### "Bot stops when screen off"

**Cause**: Battery optimization kills Termux  
**Fix**:
```
Settings → Battery → App Management → Termux
  → Don't Optimize
```

### "npm install fails silently"

**Cause**: Storage permission denied  
**Fix**:
```bash
termux-setup-storage
# Allow when prompted
```

---

## 🏗️ Architecture

```
┌──────────────────────────────┐
│    MetaMask Mobile           │
│    (OPPO Android Phone)      │
│    - Wallet management       │
└──────────────┬───────────────┘
               │ window.ethereum
               │ (injected)
               ↓
┌──────────────────────────────┐
│    React Frontend (Vite)     │
│    localhost:5173            │
│    - UI Components           │
│    - Signal Display          │
│    - Trading Terminal        │
└──────────────┬───────────────┘
               │ HTTP POST
               │ /api/signal
               ↓
┌──────────────────────────────┐
│    Express Server            │
│    localhost:3001            │
│    - Claude API Proxy        │
│    - Request Validation      │
│    - Error Handling          │
└──────────────┬───────────────┘
               │ HTTPS
               │ API Call
               ↓
┌──────────────────────────────┐
│    Anthropic Claude API      │
│    - Market Analysis         │
│    - Signal Generation       │
│    - ML Models               │
└──────────────────────────────┘
```

---

## 📂 Project Structure

```
Claude-metamask-bot/
├── src/
│   └── App.jsx              # React main component
├── public/
│   └── index.html           # HTML entry point
├── server.js                # Express proxy server
├── vite.config.js           # Vite configuration
├── package.json             # Dependencies
├── .env.example             # Configuration template
├── .gitignore               # Git ignore rules
├── LICENSE                  # MIT license
├── README.md                # This file
└── SETUP-OPPO-TERMUX.sh     # Setup automation
```

---

## 🔒 Security

### Private Keys
- ✅ Never exposed to frontend
- ✅ MetaMask handles all signing
- ✅ Bot only reads balances/prices

### API Keys
- ✅ Stored in `.env` (not committed)
- ✅ Environment variables only
- ✅ Server-side validation

### Data
- ✅ No data collection
- ✅ No tracking
- ✅ All processing local

### Network
- ✅ HTTPS to Claude API
- ✅ No intermediate proxies
- ✅ Direct to Ethereum RPC

---

## ⚠️ Disclaimer

**Trading cryptocurrency carries high risk.** Always:

1. ✅ **Test on testnet first** (Sepolia)
2. ✅ **Start with small amounts**
3. ✅ **Understand the risks**
4. ✅ **Never trade with money you can't afford to lose**
5. ✅ **Do your own research (DYOR)**

ClaudeBot is **for educational purposes only**. It provides signals, not financial advice.

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License — See [LICENSE](LICENSE) file for details

---

## 📞 Support

- 📖 **Documentation**: See README.md
- 🐛 **Issues**: https://github.com/Bluemos86/Claude-metamask-bot/issues
- 💬 **Discussions**: https://github.com/Bluemos86/Claude-metamask-bot/discussions
- 🌐 **Setup Guide**: Open `OPPO-SETUP-GUIDE.html` in browser

---

## 🎯 Roadmap

- [x] Core bot framework
- [x] MetaMask integration
- [x] Claude AI signals
- [x] OPPO Termux setup
- [ ] Uniswap v3 integration
- [ ] Real-time charts
- [ ] Advanced strategies
- [ ] Cloud deployment
- [ ] Mobile app version
- [ ] Multi-wallet support

---

## 👨‍💻 Author

**@Bluemos86** — Creator & Maintainer

---

## 🙏 Acknowledgments

- Claude AI by Anthropic
- MetaMask by ConsenSys
- WalletConnect by WalletConnect
- Ethers.js by Richard Moore
- React by Facebook
- Vite by Evan You

---

**ClaudeBot v1.0.0** — 2026  
**Status**: 🟢 Production Ready
