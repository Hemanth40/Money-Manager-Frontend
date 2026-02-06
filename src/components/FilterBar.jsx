import { Calendar, Filter, X } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';

export default function FilterBar() {
    const { filters, setFilters, categories } = useTransactions();

    const handleReset = () => {
        setFilters({
            type: '',
            category: '',
            division: '',
            startDate: '',
            endDate: '',
            period: 'month',
        });
    };

    const hasActiveFilters = filters.type || filters.category || filters.division || filters.startDate || filters.endDate;

    return (
        <div className="glass-card p-4 animate-fade-in">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-gray-600">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filters</span>
                </div>

                {/* Type Filter */}
                <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="glass-input py-2 px-3 w-auto min-w-[120px]"
                >
                    <option value="">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>

                {/* Category Filter */}
                <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="glass-input py-2 px-3 w-auto min-w-[140px]"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                {/* Division Filter */}
                <select
                    value={filters.division}
                    onChange={(e) => setFilters({ ...filters, division: e.target.value })}
                    className="glass-input py-2 px-3 w-auto min-w-[130px]"
                >
                    <option value="">All Divisions</option>
                    <option value="personal">Personal</option>
                    <option value="office">Office</option>
                </select>

                {/* Date Range */}
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        className="glass-input py-2 px-3 w-auto"
                        placeholder="From"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        className="glass-input py-2 px-3 w-auto"
                        placeholder="To"
                    />
                </div>

                {/* Reset Button */}
                {hasActiveFilters && (
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}
