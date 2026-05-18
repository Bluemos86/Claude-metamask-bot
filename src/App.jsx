import { useState, useEffect, useRef } from 'react';

const BACKEND_URL = 'http://localhost:3001';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #050a0f; }

  .app {
    min-height: 100vh;
    background: #050a0f;
    color: #e0f0ff;
    font-family: 'Rajdhani', sans-serif;
    position: relative;
    overflow-x: hidden;
  }

  .grid-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(0,200,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,200,255,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .scanline {
    position: fixed; inset: 0; pointer-events: none; z-index: 1;
    background: repeating-linear-gradient(
      0deg, transparent, transparent 2px,
      rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px
    );
  }

  .content { position: relative; z-index: 2; padding: 20px; max-width: 900px; margin: 0 auto; }

  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; margin-bottom: 24px;
    border: 1px solid rgba(0,200,255,0.2);
    background: rgba(0,20,40,0.8);
    backdrop-filter: blur(10px);
  }

  .logo {
    font-family: 'Share Tech Mono', monospace;
    font-size: 22px; font-weight: 700;
    color: #00c8ff;
    text-shadow: 0 0 20px rgba(0,200,255,0.6);
    letter-spacing: 2px;
  }

  .logo em { color: #ff6b35; font-style: normal; }

  .status-bar { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #00ff88; box-shadow: 0 0 8px #00ff88; animation: pulse 2s infinite; }
  .status-dot.red { background: #ff4444; box-shadow: 0 0 8px #ff4444; }
  .status-text { font-size: 12px; color: #7090a0; font-family: 'Share Tech Mono', monospace; }

  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .card {
    border: 1px solid rgba(0,200,255,0.15);
    background: rgba(0,15,30,0.9);
    padding: 20px; margin-bottom: 16px;
    position: relative;
  }

  .card-label {
    font-size: 11px; color: #4a7a90; letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 8px; font-family: 'Share Tech Mono', monospace;
  }

  .card-value {
    font-size: 26px; font-weight: 700; color: #e0f8ff;
    font-family: 'Share Tech Mono', monospace;
  }

  .card-value.green { color: #00ff88; text-shadow: 0 0 10px rgba(0,255,136,0.3); }
  .card-value.red { color: #ff4444; text-shadow: 0 0 10px rgba(255,68,68,0.3); }

  .btn {
    padding: 12px 24px; border: none; cursor: pointer;
    font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase;
    transition: all 0.2s;
    display: inline-flex; align-items: center; gap: 8px;
  }

  .btn-cyan {
    background: linear-gradient(135deg, #0080cc, #00c8ff);
    color: #fff; box-shadow: 0 0 20px rgba(0,200,255,0.3);
  }

  .btn-cyan:hover { box-shadow: 0 0 30px rgba(0,200,255,0.6); transform: translateY(-1px); }

  .btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .config-panel { border: 1px solid rgba(0,200,255,0.15); background: rgba(0,15,30,0.9); padding: 20px; margin-bottom: 16px; }
  .config-row { margin-bottom: 14px; }
  .config-label { font-size: 11px; color: #4a7a90; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }

  .select, .input {
    width: 100%; padding: 10px 14px;
    background: rgba(0,30,60,0.8); border: 1px solid rgba(0,200,255,0.2);
    color: #e0f0ff; font-family: 'Share Tech Mono', monospace; font-size: 13px;
    outline: none; transition: border-color 0.2s;
  }

  .select:focus, .input:focus { border-color: #00c8ff; }

  .signal-card {
    border: 1px solid rgba(0,255,136,0.3); background: rgba(0,40,20,0.6);
    padding: 16px; margin-bottom: 12px; position: relative;
  }

  .signal-card.sell { border-color: rgba(255,68,68,0.3); background: rgba(40,0,0,0.6); }
  .signal-card.hold { border-color: rgba(255,153,0,0.3); background: rgba(40,30,0,0.6); }

  .signal-pair { font-weight: 700; font-size: 16px; }
  .signal-action {
    font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
    font-family: 'Share Tech Mono', monospace; margin-top: 4px;
    color: #00ff88;
  }

  .signal-card.sell .signal-action { color: #ff4444; }
  .signal-card.hold .signal-action { color: #ff9900; }

  .signal-conf {
    position: absolute; top: 12px; right: 12px;
    font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #4a7a90;
  }

  .error-box {
    background: rgba(255,68,68,0.1); border: 1px solid rgba(255,68,68,0.3);
    padding: 12px; margin-bottom: 12px; color: #ff8888;
    border-radius: 4px; font-size: 13px;
  }

  .success-box {
    background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.3);
    padding: 12px; margin-bottom: 12px; color: #00ff88;
    border-radius: 4px; font-size: 13px;
  }
`;

function now() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

function shortAddr(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddr, setWalletAddr] = useState('');
  const [pair, setPair] = useState('ETH/USDT');
  const [strategy, setStrategy] = useState('Trend Following');
  const [signal, setSignal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [price, setPrice] = useState('');
  const [messages, setMessages] = useState([]);

  const TOKENS = ['ETH/USDT', 'BTC/USDT', 'SOL/USDT', 'BNB/USDT', 'ARB/USDT'];
  const STRATEGIES = ['Trend Following', 'Mean Reversion', 'Momentum Scalping', 'Breakout Detection'];
  const MOCK_PRICES = {
    'ETH/USDT': 3142.50, 'BTC/USDT': 67820.00, 'SOL/USDT': 172.40,
    'BNB/USDT': 612.80, 'ARB/USDT': 1.18
  };

  const addMessage = (msg, type = 'info') => {
    setMessages(prev => [...prev.slice(-20), { msg, type, ts: now() }]);
  };

  const connectWallet = async () => {
    setError('');
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddr(accounts[0]);
        setWalletConnected(true);
        addMessage(`Connected: ${shortAddr(accounts[0])}`, 'success');
      } else {
        throw new Error('MetaMask not detected. Use MetaMask Mobile Browser.');
      }
    } catch (err) {
      setError(err.message);
      addMessage(`Connection failed: ${err.message}`, 'error');
    }
  };

  const generateSignal = async () => {
    if (!price) {
      setError('Please enter a price');
      return;
    }

    setLoading(true);
    setError('');
    addMessage(`Generating signal for ${pair}...`, 'info');

    try {
      const response = await fetch(`${BACKEND_URL}/api/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pair,
          strategy,
          price: parseFloat(price)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setSignal(data);
      addMessage(`${data.action} signal generated (${data.confidence}%)`, 'success');
    } catch (err) {
      setError(err.message);
      addMessage(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddr('');
    setSignal(null);
    addMessage('Wallet disconnected', 'info');
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="grid-bg" />
        <div className="scanline" />
        <div className="content">
          <div className="header">
            <div className="logo">CLAUDE<em>BOT</em></div>
            <div className="status-bar">
              <div className={`status-dot ${walletConnected ? '' : 'red'}`} />
              <span className="status-text">
                {walletConnected ? `CONNECTED: ${shortAddr(walletAddr)}` : 'NOT CONNECTED'}
              </span>
            </div>
          </div>

          {error && <div className="error-box">⚠️ {error}</div>}

          <div className="card">
            <div className="config-row">
              <div className="config-label">Wallet Connection</div>
              {!walletConnected ? (
                <button className="btn btn-cyan" onClick={connectWallet}>
                  🦊 Connect MetaMask
                </button>
              ) : (
                <button className="btn btn-cyan" onClick={disconnectWallet}>
                  🔌 Disconnect
                </button>
              )}
            </div>
          </div>

          {walletConnected && (
            <>
              <div className="config-panel">
                <div className="config-row">
                  <div className="config-label">Trading Pair</div>
                  <select className="select" value={pair} onChange={(e) => setPair(e.target.value)}>
                    {TOKENS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div className="config-row">
                  <div className="config-label">Strategy</div>
                  <select className="select" value={strategy} onChange={(e) => setStrategy(e.target.value)}>
                    {STRATEGIES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div className="config-row">
                  <div className="config-label">Current Price (USD)</div>
                  <input
                    type="number"
                    className="input"
                    placeholder={`e.g., ${MOCK_PRICES[pair]}`}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    step="0.01"
                  />
                </div>

                <button
                  className="btn btn-cyan"
                  onClick={generateSignal}
                  disabled={loading || !price}
                  style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}
                >
                  {loading ? '⏳ Analyzing...' : '🤖 Get AI Signal'}
                </button>
              </div>

              {signal && (
                <div className={`signal-card ${signal.action.toLowerCase()}`}>
                  <div className="signal-conf">{signal.confidence}%</div>
                  <div className="signal-pair">{signal.pair}</div>
                  <div className="signal-action">Action: {signal.action}</div>
                  <div style={{ fontSize: '13px', color: '#6090a0', marginTop: '8px' }}>
                    <strong>Reason:</strong> {signal.reason}
                  </div>
                  {signal.sl && (
                    <div style={{ fontSize: '13px', color: '#6090a0', marginTop: '6px' }}>
                      <strong>SL:</strong> ${signal.sl} | <strong>TP:</strong> ${signal.tp}
                    </div>
                  )}
                </div>
              )}

              <div className="config-panel" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <div className="config-label">Activity Log</div>
                {messages.map((m, i) => (
                  <div key={i} style={{
                    fontSize: '12px',
                    color: m.type === 'success' ? '#00ff88' : m.type === 'error' ? '#ff8888' : '#7090a0',
                    padding: '4px 0',
                    fontFamily: 'Share Tech Mono, monospace'
                  }}>
                    <span style={{ color: '#4a7a90' }}>[{m.ts}]</span> {m.msg}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
