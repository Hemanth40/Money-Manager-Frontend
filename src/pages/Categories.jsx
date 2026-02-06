import { useState, useEffect } from 'react';
import { Tags, Plus, Trash2 } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { categoryAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Categories() {
    const { categories, refreshData, summary } = useTransactions();
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        type: 'expense',
        color: '#6366f1',
    });

    // Get category spending
    const getCategoryStats = (categoryName) => {
        const cat = summary.find(s => s._id === categoryName);
        return {
            income: cat?.income || 0,
            expense: cat?.expense || 0,
            count: cat?.count || 0,
        };
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!categoryForm.name) return;

        setLoading(true);
        try {
            await categoryAPI.create(categoryForm);
            toast.success('Category added');
            refreshData();
            setShowAddModal(false);
            setCategoryForm({ name: '', type: 'expense', color: '#6366f1' });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to add category');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id, name, isDefault) => {
        if (isDefault) {
            toast.error('Cannot delete default categories');
            return;
        }

        if (!window.confirm(`Delete "${name}" category?`)) return;

        try {
            await categoryAPI.delete(id);
            toast.success('Category deleted');
            refreshData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete');
        }
    };

    // Group categories by type
    const incomeCategories = categories.filter(c => c.type === 'income' || c.type === 'both');
    const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');

    // Predefined colors
    const colorOptions = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308',
        '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
        '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
        '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Tags className="w-8 h-8 text-primary-500" />
                        Categories
                    </h1>
                    <p className="text-gray-500 mt-1">Organize your transactions by category</p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="glass-button-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            {/* Category Summary */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Spending Summary</h2>

                {summary.length > 0 ? (
                    <div className="space-y-3">
                        {summary.slice(0, 10).map((cat) => {
                            const total = cat.income + cat.expense;
                            const maxTotal = Math.max(...summary.map(s => s.income + s.expense));
                            const percentage = maxTotal > 0 ? ((total / maxTotal) * 100) : 0;
                            const categoryInfo = categories.find(c => c.name === cat._id);

                            return (
                                <div key={cat._id} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: categoryInfo?.color || '#6b7280' }}
                                            />
                                            <span className="font-medium text-gray-700">{cat._id}</span>
                                            <span className="text-gray-400">({cat.count} transactions)</span>
                                        </div>
                                        <div className="flex gap-3">
                                            {cat.income > 0 && (
                                                <span className="text-emerald-600">+₹{cat.income.toLocaleString('en-IN')}</span>
                                            )}
                                            {cat.expense > 0 && (
                                                <span className="text-rose-600">-₹{cat.expense.toLocaleString('en-IN')}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: categoryInfo?.color || '#6b7280'
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-4">No transactions yet to show summary</p>
                )}
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income Categories */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        Income Categories
                    </h2>

                    <div className="space-y-2">
                        {incomeCategories.map((cat) => {
                            const stats = getCategoryStats(cat.name);
                            return (
                                <div key={cat._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        <span className="font-medium text-gray-700">{cat.name}</span>
                                        {cat.isDefault && (
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">Default</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {stats.income > 0 && (
                                            <span className="text-sm text-emerald-600">₹{stats.income.toLocaleString('en-IN')}</span>
                                        )}
                                        {!cat.isDefault && (
                                            <button
                                                onClick={() => handleDeleteCategory(cat._id, cat.name, cat.isDefault)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-rose-500 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Expense Categories */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        Expense Categories
                    </h2>

                    <div className="space-y-2">
                        {expenseCategories.map((cat) => {
                            const stats = getCategoryStats(cat.name);
                            return (
                                <div key={cat._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-rose-50/50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        <span className="font-medium text-gray-700">{cat.name}</span>
                                        {cat.isDefault && (
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">Default</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {stats.expense > 0 && (
                                            <span className="text-sm text-rose-600">₹{stats.expense.toLocaleString('en-IN')}</span>
                                        )}
                                        {!cat.isDefault && (
                                            <button
                                                onClick={() => handleDeleteCategory(cat._id, cat.name, cat.isDefault)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-rose-500 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Add Category Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Add Category</h2>

                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                <input
                                    type="text"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    placeholder="e.g., Groceries, Subscriptions"
                                    className="glass-input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={categoryForm.type}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value })}
                                    className="glass-input"
                                >
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                    <option value="both">Both</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setCategoryForm({ ...categoryForm, color })}
                                            className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${categoryForm.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
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
                                    {loading ? 'Adding...' : 'Add Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
