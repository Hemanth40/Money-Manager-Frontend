import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ArrowLeftRight,
    Wallet,
    Tags,
    Plus,
    Menu,
    X,
    Sparkles
} from 'lucide-react';
import AddTransactionModal from './AddTransactionModal';

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { path: '/accounts', label: 'Accounts', icon: Wallet },
    { path: '/categories', label: 'Categories', icon: Tags },
];

export default function Layout({ children }) {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <div className="min-h-screen relative">
            {/* Decorative floating orbs */}
            <div className="floating-orb w-96 h-96 bg-primary-400 top-0 left-0" />
            <div className="floating-orb w-72 h-72 bg-purple-400 top-1/3 right-0 animate-delay-200" />
            <div className="floating-orb w-80 h-80 bg-pink-300 bottom-0 left-1/4 animate-delay-400" />
            <div className="floating-orb w-64 h-64 bg-cyan-300 bottom-1/4 right-1/4 animate-delay-300" />

            {/* Navbar */}
            <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg group-hover:shadow-neon transition-all duration-300">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                                Money Manager
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Add Button & Mobile Menu */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="glass-button-primary flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Add</span>
                            </button>

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden glass-button-secondary p-2"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-white/30 bg-white/80 backdrop-blur-xl animate-slide-down">
                        <div className="px-4 py-3 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`nav-link flex items-center gap-3 w-full ${isActive ? 'active' : ''}`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Add Transaction Modal */}
            <AddTransactionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
            />
        </div>
    );
}
