import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { connectWallet } from '@/lib/blockchain';
import { ethers } from 'ethers';
import { Sparkles, Wallet, Menu, X } from 'lucide-react';

const Header = () => {
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Check if wallet is already connected on load
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const provider = await connectWallet();
      if (provider) {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
      }
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 w-full z-50 glass-card border-b border-card-border/30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-all duration-300">
              <Sparkles className="w-6 h-6 text-primary animate-cyber-glow" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">EvolvNFT</h1>
              <p className="text-xs text-muted-foreground">Cyber Foundry</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-all duration-300 hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              The Forge
            </Link>
            <Link
              to="/collection"
              className={`text-sm font-medium transition-all duration-300 hover:text-primary ${
                isActive('/collection') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              My Collection
            </Link>
          </nav>

          {/* Connect Wallet Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="connect-btn flex items-center space-x-2"
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isConnecting
                  ? 'Connecting...'
                  : account
                  ? truncateAddress(account)
                  : 'Connect Wallet'}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-card-border/30">
            <div className="flex flex-col space-y-4 pt-4">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-medium transition-all duration-300 hover:text-primary ${
                  isActive('/') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                The Forge
              </Link>
              <Link
                to="/collection"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-medium transition-all duration-300 hover:text-primary ${
                  isActive('/collection') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                My Collection
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;