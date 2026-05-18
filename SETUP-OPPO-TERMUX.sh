#!/bin/bash

# ClaudeBot OPPO Termux Setup Script
# Automated installation for Android
# Author: Bluemos86
# Date: 2026-05-18

set -e  # Exit on error

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   ClaudeBot OPPO Termux Setup (v1.0.0)    ║"
echo "║   Automated Installation Script            ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
  echo -e "${RED}[✗]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[⚠]${NC} $1"
}

# Step 1: Storage setup
log_info "Step 1/8: Setting up storage access..."
if command -v termux-setup-storage &> /dev/null; then
  termux-setup-storage 2>/dev/null || true
  log_success "Storage access configured"
else
  log_warn "Termux setup-storage not available (may already be done)"
fi

# Step 2: Update packages
log_info "Step 2/8: Updating packages (this may take 2-3 minutes)..."
pkg update -y > /dev/null 2>&1 || true
pkg upgrade -y > /dev/null 2>&1 || true
log_success "Packages updated"

# Step 3: Install Node.js
log_info "Step 3/8: Installing Node.js (this may take 3-5 minutes)..."
if ! command -v node &> /dev/null; then
  pkg install -y nodejs > /dev/null 2>&1
  log_success "Node.js installed (version: $(node --version))"
else
  log_success "Node.js already installed (version: $(node --version))"
fi

# Step 4: Install Git
log_info "Step 4/8: Installing Git..."
if ! command -v git &> /dev/null; then
  pkg install -y git > /dev/null 2>&1
  log_success "Git installed"
else
  log_success "Git already installed"
fi

# Step 5: Clone or setup project
log_info "Step 5/8: Setting up Claude-metamask-bot project..."
if [ ! -d "$HOME/claude-bot" ]; then
  log_info "Cloning repository..."
  git clone https://github.com/Bluemos86/Claude-metamask-bot.git ~/claude-bot
  log_success "Repository cloned to ~/claude-bot"
else
  log_success "Project already exists at ~/claude-bot"
fi

cd ~/claude-bot

# Step 6: Install dependencies
log_info "Step 6/8: Installing npm dependencies (this may take 3-5 minutes)..."
npm install > /dev/null 2>&1
log_success "Dependencies installed"

# Step 7: Setup environment
log_info "Step 7/8: Setting up environment configuration..."
if [ ! -f .env ]; then
  cp .env.example .env
  log_success ".env file created"
  log_warn "IMPORTANT: Edit .env with your API keys:"
  echo ""
  echo "   nano ~/.env.example"
  echo ""
  echo "   Then copy API keys from:"
  echo "   - Claude: https://console.anthropic.com"
  echo "   - WalletConnect: https://cloud.walletconnect.com"
else
  log_success ".env file already exists"
fi

# Step 8: Create alias and startup script
log_info "Step 8/8: Creating startup commands..."

# Create startup script
cat > ~/start-claudebot.sh << 'EOF'
#!/bin/bash
cd ~/claude-bot
npm start
EOF
chmod +x ~/start-claudebot.sh

# Add alias to .bashrc
if ! grep -q "alias claudebot" ~/.bashrc 2>/dev/null; then
  echo "" >> ~/.bashrc
  echo "# ClaudeBot alias" >> ~/.bashrc
  echo "alias claudebot='bash ~/start-claudebot.sh'" >> ~/.bashrc
fi

log_success "Startup script created"

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║          Installation Complete! ✓          ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo ""
echo "1. Exit Termux and go to Settings:"
echo "   Settings → About Phone → Build Number (tap 7x)"
echo "   Then: Settings → System → Developer Options"
echo "   Enable: 'Disable Child Process Restrictions'"
echo ""
echo "2. Go back to Termux and edit your API keys:"
echo "   nano ~/.env"
echo ""
echo "3. Start the bot:"
echo "   claudebot"
echo ""
echo "4. Open MetaMask Mobile → Browser tab → http://localhost:5173"
echo ""
echo -e "${YELLOW}Tips for OPPO Users:${NC}"
echo "  • Disable battery optimization for Termux"
echo "  • Use split-screen mode (Termux + MetaMask)"
echo "  • Don't close Termux while bot is running"
echo ""
echo "For more help, see: https://github.com/Bluemos86/Claude-metamask-bot"
echo ""
