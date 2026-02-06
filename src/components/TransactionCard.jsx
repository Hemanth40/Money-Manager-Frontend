import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ArrowUpCircle, ArrowDownCircle, Pencil, Trash2, Clock } from 'lucide-react';

export default function TransactionCard({ transaction, onEdit, onDelete }) {
    const { type, amount, description, category, division, date, isEditable, createdAt } = transaction;

    const formatDate = (dateStr) => {
        const d = parseISO(dateStr);
        if (isToday(d)) return 'Today';
        if (isYesterday(d)) return 'Yesterday';
        return format(d, 'MMM d, yyyy');
    };

    const formatTime = (dateStr) => {
        return format(parseISO(dateStr), 'h:mm a');
    };

    const getTimeRemaining = () => {
        if (!isEditable) return null;
        const created = new Date(createdAt);
        const deadline = new Date(created.getTime() + 12 * 60 * 60 * 1000);
        const now = new Date();
        const remaining = deadline - now;

        if (remaining <= 0) return null;

        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

        return `${hours}h ${minutes}m left to edit`;
    };

    const timeRemaining = getTimeRemaining();

    return (
        <div className="glass-card-hover p-4 animate-fade-in">
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-xl ${type === 'income'
                        ? 'bg-gradient-to-br from-emerald-100 to-green-100'
                        : 'bg-gradient-to-br from-rose-100 to-red-100'
                    }`}>
                    {type === 'income' ? (
                        <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                        <ArrowDownCircle className="w-5 h-5 text-rose-600" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="font-semibold text-gray-800 truncate">{description}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className={type === 'income' ? 'badge-income' : 'badge-expense'}>
                                    {category}
                                </span>
                                <span className={division === 'office' ? 'badge-office' : 'badge-personal'}>
                                    {division}
                                </span>
                            </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                            <p className={`text-lg font-bold ${type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                                }`}>
                                {type === 'income' ? '+' : '-'}₹{amount.toLocaleString('en-IN')}
                            </p>
                            <p className="text-xs text-gray-500">
                                {formatDate(date)} • {formatTime(date)}
                            </p>
                        </div>
                    </div>

                    {/* Edit time remaining */}
                    {timeRemaining && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                            <Clock className="w-3 h-3" />
                            {timeRemaining}
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            {isEditable && (
                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                        onClick={() => onEdit?.(transaction)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete?.(transaction._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
