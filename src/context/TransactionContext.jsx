import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { transactionAPI, accountAPI, categoryAPI } from '../services/api';
import toast from 'react-hot-toast';

const TransactionContext = createContext();

export const useTransactions = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransactions must be used within a TransactionProvider');
    }
    return context;
};

export const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [report, setReport] = useState(null);
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: '',
        category: '',
        division: '',
        startDate: '',
        endDate: '',
        period: 'month',
    });

    // Fetch transactions
    const fetchTransactions = useCallback(async () => {
        try {
            const params = {};
            if (filters.type) params.type = filters.type;
            if (filters.category) params.category = filters.category;
            if (filters.division) params.division = filters.division;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const { data } = await transactionAPI.getAll(params);
            setTransactions(data.data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to load transactions');
        }
    }, [filters]);

    // Fetch report
    const fetchReport = useCallback(async () => {
        try {
            const { data } = await transactionAPI.getReport(filters.period);
            setReport(data.data || null);
        } catch (error) {
            console.error('Error fetching report:', error);
        }
    }, [filters.period]);

    // Fetch summary
    const fetchSummary = useCallback(async () => {
        try {
            const params = {};
            if (filters.division) params.division = filters.division;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const { data } = await transactionAPI.getSummary(params);
            setSummary(data.data || []);
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    }, [filters]);

    // Fetch accounts
    const fetchAccounts = useCallback(async () => {
        try {
            const { data } = await accountAPI.getAll();
            setAccounts(data.data || []);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    }, []);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const { data } = await categoryAPI.getAll();
            if (data.data && data.data.length === 0) {
                // Seed default categories
                await categoryAPI.seed();
                const { data: seededData } = await categoryAPI.getAll();
                setCategories(seededData.data || []);
            } else {
                setCategories(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, []);

    // Initial data load
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchTransactions(),
                fetchAccounts(),
                fetchCategories(),
                fetchReport(),
                fetchSummary(),
            ]);
            setLoading(false);
        };
        loadData();
    }, []);

    // Reload when filters change
    useEffect(() => {
        fetchTransactions();
        fetchReport();
        fetchSummary();
    }, [filters, fetchTransactions, fetchReport, fetchSummary]);

    // Add transaction
    const addTransaction = async (transactionData) => {
        try {
            const { data } = await transactionAPI.create(transactionData);
            toast.success(`${transactionData.type === 'income' ? 'Income' : 'Expense'} added successfully`);
            await Promise.all([fetchTransactions(), fetchAccounts(), fetchReport(), fetchSummary()]);
            return data.data;
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to add transaction');
            throw error;
        }
    };

    // Update transaction
    const updateTransaction = async (id, transactionData) => {
        try {
            const { data } = await transactionAPI.update(id, transactionData);
            toast.success('Transaction updated successfully');
            await Promise.all([fetchTransactions(), fetchAccounts(), fetchReport(), fetchSummary()]);
            return data.data;
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update transaction');
            throw error;
        }
    };

    // Delete transaction
    const deleteTransaction = async (id) => {
        try {
            await transactionAPI.delete(id);
            toast.success('Transaction deleted successfully');
            await Promise.all([fetchTransactions(), fetchAccounts(), fetchReport(), fetchSummary()]);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete transaction');
            throw error;
        }
    };

    // Add account
    const addAccount = async (accountData) => {
        try {
            const { data } = await accountAPI.create(accountData);
            toast.success('Account created successfully');
            await fetchAccounts();
            return data.data;
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create account');
            throw error;
        }
    };

    // Transfer money
    const transferMoney = async (transferData) => {
        try {
            const { data } = await accountAPI.transfer(transferData);
            toast.success('Transfer completed successfully');
            await fetchAccounts();
            return data.data;
        } catch (error) {
            toast.error(error.response?.data?.error || 'Transfer failed');
            throw error;
        }
    };

    const value = {
        transactions,
        accounts,
        categories,
        report,
        summary,
        loading,
        filters,
        setFilters,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        transferMoney,
        refreshData: () => Promise.all([
            fetchTransactions(),
            fetchAccounts(),
            fetchCategories(),
            fetchReport(),
            fetchSummary(),
        ]),
    };

    return (
        <TransactionContext.Provider value={value}>
            {children}
        </TransactionContext.Provider>
    );
};
