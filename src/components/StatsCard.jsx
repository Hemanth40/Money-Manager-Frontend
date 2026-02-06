import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';

export default function StatsCard({ type, value, label, trend, icon: CustomIcon }) {
    const getStyles = () => {
        switch (type) {
            case 'income':
                return {
                    gradient: 'from-emerald-400 to-green-500',
                    bgGradient: 'from-emerald-50 to-green-50',
                    textColor: 'text-emerald-600',
                    icon: TrendingUp,
                };
            case 'expense':
                return {
                    gradient: 'from-rose-400 to-red-500',
                    bgGradient: 'from-rose-50 to-red-50',
                    textColor: 'text-rose-600',
                    icon: TrendingDown,
                };
            case 'balance':
                return {
                    gradient: 'from-primary-400 to-primary-600',
                    bgGradient: 'from-blue-50 to-cyan-50',
                    textColor: 'text-primary-600',
                    icon: Wallet,
                };
            default:
                return {
                    gradient: 'from-gray-400 to-gray-500',
                    bgGradient: 'from-gray-50 to-gray-100',
                    textColor: 'text-gray-600',
                    icon: DollarSign,
                };
        }
    };

    const styles = getStyles();
    const Icon = CustomIcon || styles.icon;

    return (
        <div className="glass-card-hover p-6 relative overflow-hidden group">
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.bgGradient} opacity-50`} />

            {/* Decorative circle */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${styles.gradient} rounded-full opacity-20 group-hover:opacity-30 transition-opacity`} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${styles.gradient} shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    {trend !== undefined && (
                        <span className={`text-sm font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {trend >= 0 ? '+' : ''}{trend}%
                        </span>
                    )}
                </div>

                <div>
                    <p className="text-sm text-gray-500 mb-1">{label}</p>
                    <p className={`text-2xl font-bold ${styles.textColor}`}>
                        ₹{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                </div>
            </div>
        </div>
    );
}
