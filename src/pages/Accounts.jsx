import { useState } from 'react';
import { Wallet, Plus, ArrowRightLeft, Pencil, Trash2 } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import toast from 'react-hot-toast';
import { accountAPI } from '../services/api';

export default function Accounts() {
    const { accounts, addAccount, transferMoney, refreshData } = useTransactions();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const [accountForm, setAccountForm] = useState({
        name: '',
        balance: '',
        type: 'bank',
    });

    const [transferForm, setTransferForm] = useState({
        fromAccountId: '',
        toAccountId: '',
        amount: '',
        description: '',
    });

    // Total balance
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const handleAddAccount = async (e) => {
        e.preventDefault();
        if (!accountForm.name) return;

        setLoading(true);
        try {
            await addAccount({
                name: accountForm.name,
                balance: parseFloat(accountForm.balance) || 0,
                type: accountForm.type,
            });
            setShowAddModal(false);
            setAccountForm({ name: '', balance: '', type: 'bank' });
        } catch (error) {
            console.error('Error adding account:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        if (!transferForm.fromAccountId || !transferForm.toAccountId || !transferForm.amount) return;

        setLoading(true);
        try {
            await transferMoney({
                fromAccountId: transferForm.fromAccountId,
                toAccountId: transferForm.toAccountId,
                amount: parseFloat(transferForm.amount),
                description: transferForm.description || 'Transfer',
            });
            setShowTransferModal(false);
            setTransferForm({ fromAccountId: '', toAccountId: '', amount: '', description: '' });
        } catch (error) {
            console.error('Error transferring:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            await accountAPI.delete(id);
            toast.success('Account deleted');
            refreshData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete account');
        }
    };

    const getAccountIcon = (type) => {
        switch (type) {
            case 'cash': return '💵';
            case 'bank': return '🏦';
            case 'credit': return '💳';
            case 'savings': return '🏧';
            case 'wallet': return '👛';
            default: return '💰';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-primary-500" />
                        Accounts
                    </h1>
                    <p className="text-gray-500 mt-1">Manage your accounts and transfers</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowTransferModal(true)}
                        className="glass-button-secondary flex items-center gap-2"
                        disabled={accounts.length < 2}
                    >
                        <ArrowRightLeft className="w-4 h-4" />
                        Transfer
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="glass-button-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Account
                    </button>
                </div>
            </div>

            {/* Total Balance Card */}
            <div className="glass-card p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-cyan-50 opacity-60" />
                <div className="relative z-10 text-center">
                    <p className="text-gray-500 text-sm font-medium mb-2">Total Balance</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-cyan-600 bg-clip-text text-transparent">
                        ₹{totalBalance.toLocaleString('en-IN')}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">{accounts.length} accounts</p>
                </div>
            </div>

            {/* Accounts Grid */}
            {accounts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accounts.map((account) => (
                        <div key={account._id} className="glass-card-hover p-6 group">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">{getAccountIcon(account.type)}</div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{account.name}</h3>
                                        <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDeleteAccount(account._id, account.name)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-2xl font-bold text-gray-800">
                                    ₹{account.balance.toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
                        🏦
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">No accounts yet</h3>
                    <p className="text-gray-500 mt-1">Add your first account to start tracking</p>
                </div>
            )}

            {/* Add Account Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Add Account</h2>

                        <form onSubmit={handleAddAccount} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                                <input
                                    type="text"
                                    value={accountForm.name}
                                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                                    placeholder="e.g., HDFC Bank, Cash"
                                    className="glass-input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance</label>
                                <input
                                    type="number"
                                    value={accountForm.balance}
                                    onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
                                    placeholder="0"
                                    className="glass-input"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                                <select
                                    value={accountForm.type}
                                    onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })}
                                    className="glass-input"
                                >
                                    <option value="bank">Bank Account</option>
                                    <option value="cash">Cash</option>
                                    <option value="credit">Credit Card</option>
                                    <option value="savings">Savings</option>
                                    <option value="wallet">Digital Wallet</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 glass-button-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 glass-button-primary"
                                >
                                    {loading ? 'Adding...' : 'Add Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {showTransferModal && (
                <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <ArrowRightLeft className="w-5 h-5 text-primary-500" />
                            Transfer Money
                        </h2>

                        <form onSubmit={handleTransfer} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
                                <select
                                    value={transferForm.fromAccountId}
                                    onChange={(e) => setTransferForm({ ...transferForm, fromAccountId: e.target.value })}
                                    className="glass-input"
                                    required
                                >
                                    <option value="">Select account</option>
                                    {accounts.map((acc) => (
                                        <option key={acc._id} value={acc._id}>
                                            {acc.name} (₹{acc.balance.toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">To Account</label>
                                <select
                                    value={transferForm.toAccountId}
                                    onChange={(e) => setTransferForm({ ...transferForm, toAccountId: e.target.value })}
                                    className="glass-input"
                                    required
                                >
                                    <option value="">Select account</option>
                                    {accounts
                                        .filter(acc => acc._id !== transferForm.fromAccountId)
                                        .map((acc) => (
                                            <option key={acc._id} value={acc._id}>
                                                {acc.name} (₹{acc.balance.toLocaleString()})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={transferForm.amount}
                                    onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                                    placeholder="0"
                                    className="glass-input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                                <input
                                    type="text"
                                    value={transferForm.description}
                                    onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                                    placeholder="e.g., Transfer to savings"
                                    className="glass-input"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowTransferModal(false)}
                                    className="flex-1 glass-button-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 glass-button-primary"
                                >
                                    {loading ? 'Transferring...' : 'Transfer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
