import { useState, useEffect } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, Calendar, FileText, Folder, Tag } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';

export default function AddTransactionModal({ isOpen, onClose, editTransaction = null }) {
    const { addTransaction, updateTransaction, categories, accounts } = useTransactions();
    const [activeTab, setActiveTab] = useState('expense');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category: '',
        division: 'personal',
        date: new Date().toISOString().split('T')[0],
        accountId: '',
    });

    useEffect(() => {
        if (editTransaction) {
            setActiveTab(editTransaction.type);
            setFormData({
                amount: editTransaction.amount.toString(),
                description: editTransaction.description,
                category: editTransaction.category,
                division: editTransaction.division,
                date: new Date(editTransaction.date).toISOString().split('T')[0],
                accountId: editTransaction.accountId?._id || editTransaction.accountId || '',
            });
        } else {
            resetForm();
        }
    }, [editTransaction, isOpen]);

    const resetForm = () => {
        setFormData({
            amount: '',
            description: '',
            category: '',
            division: 'personal',
            date: new Date().toISOString().split('T')[0],
            accountId: '',
        });
        setActiveTab('expense');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.description || !formData.category) {
            return;
        }

        setLoading(true);
        try {
            const data = {
                type: activeTab,
                amount: parseFloat(formData.amount),
                description: formData.description,
                category: formData.category,
                division: formData.division,
                date: formData.date,
                accountId: formData.accountId || undefined,
            };

            if (editTransaction) {
                await updateTransaction(editTransaction._id, data);
            } else {
                await addTransaction(data);
            }

            onClose();
            resetForm();
        } catch (error) {
            console.error('Error saving transaction:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(
        cat => cat.type === activeTab || cat.type === 'both'
    );

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-gray-100/80 rounded-xl mb-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab('income')}
                        className={`tab-button flex items-center justify-center gap-2 ${activeTab === 'income' ? 'active' : ''}`}
                    >
                        <ArrowUpCircle className={`w-4 h-4 ${activeTab === 'income' ? 'text-emerald-500' : ''}`} />
                        Income
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('expense')}
                        className={`tab-button flex items-center justify-center gap-2 ${activeTab === 'expense' ? 'active' : ''}`}
                    >
                        <ArrowDownCircle className={`w-4 h-4 ${activeTab === 'expense' ? 'text-rose-500' : ''}`} />
                        Expense
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                                className="glass-input pl-8 text-lg font-semibold"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <FileText className="w-4 h-4 inline mr-1" />
                            Description
                        </label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="What was this for?"
                            className="glass-input"
                            maxLength={200}
                            required
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Tag className="w-4 h-4 inline mr-1" />
                            Category
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="glass-input"
                            required
                        >
                            <option value="">Select category</option>
                            {filteredCategories.map((cat) => (
                                <option key={cat._id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Division */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Folder className="w-4 h-4 inline mr-1" />
                            Division
                        </label>
                        <div className="flex gap-3">
                            <label className="flex-1">
                                <input
                                    type="radio"
                                    name="division"
                                    value="personal"
                                    checked={formData.division === 'personal'}
                                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                                    className="sr-only peer"
                                />
                                <div className="glass-input cursor-pointer text-center peer-checked:ring-2 peer-checked:ring-purple-400 peer-checked:bg-purple-50">
                                    Personal
                                </div>
                            </label>
                            <label className="flex-1">
                                <input
                                    type="radio"
                                    name="division"
                                    value="office"
                                    checked={formData.division === 'office'}
                                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                                    className="sr-only peer"
                                />
                                <div className="glass-input cursor-pointer text-center peer-checked:ring-2 peer-checked:ring-blue-400 peer-checked:bg-blue-50">
                                    Office
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Date
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="glass-input"
                            required
                        />
                    </div>

                    {/* Account (optional) */}
                    {accounts.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Account (optional)
                            </label>
                            <select
                                value={formData.accountId}
                                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                                className="glass-input"
                            >
                                <option value="">No account</option>
                                {accounts.map((acc) => (
                                    <option key={acc._id} value={acc._id}>
                                        {acc.name} (₹{acc.balance.toLocaleString()})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 ${activeTab === 'income'
                                ? 'income-gradient hover:shadow-lg'
                                : 'expense-gradient hover:shadow-lg'
                            } ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                    >
                        {loading ? 'Saving...' : (editTransaction ? 'Update' : `Add ${activeTab === 'income' ? 'Income' : 'Expense'}`)}
                    </button>
                </form>

                {/* Edit Warning */}
                {editTransaction && editTransaction.isEditable === false && (
                    <p className="mt-4 text-sm text-amber-600 text-center">
                        ⚠️ This transaction was created more than 12 hours ago and can no longer be edited.
                    </p>
                )}
            </div>
        </div>
    );
}
