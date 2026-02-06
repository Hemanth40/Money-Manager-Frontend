import { useState } from 'react';
import { ArrowLeftRight, Search } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import TransactionCard from '../components/TransactionCard';
import FilterBar from '../components/FilterBar';
import AddTransactionModal from '../components/AddTransactionModal';

export default function Transactions() {
    const { transactions, loading, deleteTransaction } = useTransactions();
    const [editTransaction, setEditTransaction] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleEdit = (transaction) => {
        setEditTransaction(transaction);
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            await deleteTransaction(id);
        }
    };

    // Filter transactions by search query
    const filteredTransactions = transactions.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group transactions by date
    const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
        const date = new Date(transaction.date).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
    }, {});

    // Calculate daily totals
    const getDayTotals = (transactions) => {
        return transactions.reduce(
            (acc, t) => ({
                income: acc.income + (t.type === 'income' ? t.amount : 0),
                expense: acc.expense + (t.type === 'expense' ? t.amount : 0),
            }),
            { income: 0, expense: 0 }
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <ArrowLeftRight className="w-8 h-8 text-primary-500" />
                    Transaction History
                </h1>
                <p className="text-gray-500 mt-1">View and manage all your transactions</p>
            </div>

            {/* Search & Filters */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search transactions..."
                        className="glass-input pl-12"
                    />
                </div>
                <FilterBar />
            </div>

            {/* Transactions List */}
            {Object.keys(groupedTransactions).length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(groupedTransactions).map(([date, dayTransactions]) => {
                        const totals = getDayTotals(dayTransactions);
                        return (
                            <div key={date} className="animate-slide-up">
                                {/* Date Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-700">{date}</h3>
                                    <div className="flex gap-4 text-sm">
                                        {totals.income > 0 && (
                                            <span className="text-emerald-600">+₹{totals.income.toLocaleString('en-IN')}</span>
                                        )}
                                        {totals.expense > 0 && (
                                            <span className="text-rose-600">-₹{totals.expense.toLocaleString('en-IN')}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Day's Transactions */}
                                <div className="space-y-3">
                                    {dayTransactions.map((transaction) => (
                                        <TransactionCard
                                            key={transaction._id}
                                            transaction={transaction}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="glass-card p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <ArrowLeftRight className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">No transactions found</h3>
                    <p className="text-gray-500 mt-1">
                        {searchQuery ? 'Try a different search term' : 'Start by adding your first transaction'}
                    </p>
                </div>
            )}

            {/* Summary */}
            {filteredTransactions.length > 0 && (
                <div className="glass-card p-4 flex flex-wrap items-center justify-center gap-6 text-sm">
                    <div>
                        <span className="text-gray-500">Showing: </span>
                        <span className="font-semibold text-gray-800">{filteredTransactions.length} transactions</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Total Income: </span>
                        <span className="font-semibold text-emerald-600">
                            ₹{filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN')}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500">Total Expenses: </span>
                        <span className="font-semibold text-rose-600">
                            ₹{filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <AddTransactionModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditTransaction(null);
                }}
                editTransaction={editTransaction}
            />
        </div>
    );
}
