import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, ChevronDown } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import StatsCard from '../components/StatsCard';
import TransactionCard from '../components/TransactionCard';
import AddTransactionModal from '../components/AddTransactionModal';

const COLORS = ['#22c55e', '#ef4444', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#3b82f6', '#10b981'];

export default function Dashboard() {
    const { transactions, report, summary, loading, filters, setFilters, deleteTransaction } = useTransactions();
    const [editTransaction, setEditTransaction] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleEdit = (transaction) => {
        setEditTransaction(transaction);
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            await deleteTransaction(id);
        }
    };

    // Period labels for chart
    const getPeriodLabel = (value, period) => {
        if (period === 'week') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return days[value - 1] || value;
        }
        if (period === 'year') {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return months[value - 1] || value;
        }
        return value;
    };

    // Format chart data
    const chartData = report?.report?.map(item => ({
        name: getPeriodLabel(item._id, filters.period),
        income: item.income,
        expense: item.expense,
    })) || [];

    // Category data for pie chart
    const categoryData = summary.map((cat, index) => ({
        name: cat._id,
        value: cat.expense + cat.income,
        color: COLORS[index % COLORS.length],
    })).slice(0, 8);

    // Recent transactions
    const recentTransactions = transactions.slice(0, 5);

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Track your financial health</p>
                </div>

                {/* Period Selector */}
                <div className="flex items-center gap-2 glass-card p-1">
                    {['week', 'month', 'year'].map((period) => (
                        <button
                            key={period}
                            onClick={() => setFilters({ ...filters, period })}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-300 ${filters.period === period
                                ? 'bg-white shadow-glass-sm text-primary-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {period}ly
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
                <StatsCard
                    type="income"
                    value={report?.totals?.income || 0}
                    label="Total Income"
                />
                <StatsCard
                    type="expense"
                    value={report?.totals?.expense || 0}
                    label="Total Expenses"
                />
                <StatsCard
                    type="balance"
                    value={report?.totals?.balance || 0}
                    label="Net Balance"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart */}
                <div className="lg:col-span-2 glass-card p-6 animate-slide-up animate-delay-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary-500" />
                            Income vs Expenses
                        </h2>
                    </div>

                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData} barGap={8}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(255, 255, 255, 0.5)',
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                    }}
                                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
                                />
                                <Bar dataKey="income" fill="url(#incomeGradient)" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="expense" fill="url(#expenseGradient)" radius={[6, 6, 0, 0]} />
                                <defs>
                                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22c55e" />
                                        <stop offset="100%" stopColor="#16a34a" />
                                    </linearGradient>
                                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ef4444" />
                                        <stop offset="100%" stopColor="#dc2626" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-gray-400">
                            No data available for this period
                        </div>
                    )}
                </div>

                {/* Pie Chart */}
                <div className="glass-card p-6 animate-slide-up animate-delay-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6">Spending by Category</h2>

                    {categoryData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(8px)',
                                            border: '1px solid rgba(255, 255, 255, 0.5)',
                                            borderRadius: '12px',
                                        }}
                                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Legend */}
                            <div className="mt-4 space-y-2">
                                {categoryData.slice(0, 5).map((cat, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                            <span className="text-gray-600">{cat.name}</span>
                                        </div>
                                        <span className="font-medium text-gray-800">₹{cat.value.toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-[200px] text-gray-400">
                            No category data
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="glass-card p-6 animate-slide-up animate-delay-300">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary-500" />
                        Recent Transactions
                    </h2>
                    <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        View All →
                    </Link>
                </div>

                {recentTransactions.length > 0 ? (
                    <div className="space-y-3">
                        {recentTransactions.map((transaction) => (
                            <TransactionCard
                                key={transaction._id}
                                transaction={transaction}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-lg">No transactions yet</p>
                        <p className="text-sm mt-1">Click the "Add" button to create your first transaction</p>
                    </div>
                )}
            </div>

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
