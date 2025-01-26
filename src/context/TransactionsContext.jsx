import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { capitalOneApi } from '../services/capitalOneApi';

const TransactionsContext = createContext();

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState({
    grocery: { limit: 0, spent: 0, percentage: 0 },
    merchandise: { limit: 0, spent: 0, percentage: 0 },
    dining: { limit: 0, spent: 0, percentage: 0 },
    entertainment: { limit: 0, spent: 0, percentage: 0 },
    travel: { limit: 0, spent: 0, percentage: 0 }
  });
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentTransactions, setCurrentTransactions] = useState([]);
  const [dateRange, setDateRange] = useState({startDate: "", endDate: ""});

  const CUSTOMER_ID = import.meta.env.VITE_CUSTOMER_ID;

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const response = await capitalOneApi.getMerchants();
      setMerchants(response);
    } catch (err) {
      console.error('Error fetching merchants:', err);
      setError('Failed to fetch merchants');
    } finally {
      setLoading(false);
    }
  };

  const createPurchase = async (accountId, purchaseData) => {
    try {
      setLoading(true);
      const response = await capitalOneApi.createPurchase(accountId, {
        ...purchaseData,
        status: 'pending',
        medium: 'balance'
      });
      await fetchTransactions(); // Refresh transactions
      return response;
    } catch (err) {
      console.error('Error creating purchase:', err);
      setError('Failed to create purchase');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // Test API connection first
      await capitalOneApi.testConnection();
      
      console.log('Fetching accounts for customer ID:', CUSTOMER_ID);
      const accountsData = await capitalOneApi.getAccounts(CUSTOMER_ID);
      
      if (!accountsData || accountsData.length === 0) {
        throw new Error('No accounts found for this customer');
      }
      
      setAccounts(accountsData);
      return accountsData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch accounts';
      setError(errorMessage);
      console.error('Error in fetchAccounts:', err);
      return []; // Return empty array to prevent errors in fetchTransactions
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const accountsData = await fetchAccounts();
      if (!accountsData.length) {
        throw new Error('No accounts available');
      }

      const allTransactions = await Promise.all(
        accountsData.map(async account => {
          try {
            const purchases = await capitalOneApi.getPurchases(account._id);
            return purchases.map(purchase => ({
              ...purchase,
              accountId: account._id,
              accountName: account.nickname
            }));
          } catch (err) {
            console.error(`Error fetching transactions for account ${account._id}:`, err);
            return [];
          }
        })
      );

      // Flatten and process transactions
      const processedTransactions = allTransactions
        .flat()
        .map(transaction => ({
          id: transaction._id,
          date: new Date(transaction.purchase_date),
          amount: transaction.amount,
          description: transaction.description,
          category: categorizeTransaction(transaction.description),
          merchant: transaction.merchant_id,
          accountId: transaction.accountId,
          accountName: transaction.accountName,
          status: transaction.status
        }));

      setTransactions(processedTransactions);
      calculateSpending(processedTransactions);
    } catch (err) {
        setError(err.message);
        setError(err.message);
      console.error('Error in fetchTransactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const categorizeTransaction = (description) => {
    // Add your categorization logic here
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('grocery') || lowerDesc.includes('food')) {
      return 'grocery';
    } else if (lowerDesc.includes('restaurant') || lowerDesc.includes('cafe')) {
      return 'dining';
    } else if (lowerDesc.includes('movie') || lowerDesc.includes('entertainment')) {
      return 'entertainment';
    } else if (lowerDesc.includes('shop') || lowerDesc.includes('store')) {
      return 'merchandise';
    }
    return 'other';
  };

  const calculateSpending = (transactions, dateR) => {
    // Clone the categories object and preserve limits
    const spending = Object.keys(categories).reduce((acc, category) => {
      acc[category] = { 
        ...categories[category], 
        spent: 0,
        percentage: 0 
      };
      return acc;
    }, {});
  
    // Calculate spending per category
    transactions.forEach((transaction) => {
      const parse_category = transaction.Category.toLowerCase();
      const dueRange = (dateR.startDate <= transaction.Date) && (transaction.Date <= dateR.endDate);
  
      if (spending[parse_category] && dueRange) {
        spending[parse_category].spent += Number(transaction.Amount);
      }
    });
  
    // Calculate percentages
    Object.keys(spending).forEach(category => {
      if (spending[category].limit > 0) {
        spending[category].percentage = (spending[category].spent / spending[category].limit) * 100;
      }
    });
  
    setCategories(spending);
  };

  const updateLimits = (newLimits, dateR) => {
    const updatedCategories = Object.keys(categories).reduce((acc, category) => {
      acc[category] = {
        ...categories[category],
        limit: newLimits[category]?.limit || categories[category].limit,
        percentage: categories[category].spent / (newLimits[category]?.limit || categories[category].limit) * 100
      };
      return acc;
    }, {});

    setCategories(updatedCategories);
    setDateRange(dateR);
  };

  const fetchPurchasesByMerchant = async (merchantId) => {
    try {
      setLoading(true);
      const purchases = await capitalOneApi.getPurchasesByMerchant(merchantId);
      return purchases;
    } catch (err) {
      setError('Failed to fetch merchant purchases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMerchantAccountPurchases = async (merchantId, accountId) => {
    try {
      setLoading(true);
      const purchases = await capitalOneApi.getMerchantAccountPurchases(merchantId, accountId);
      return purchases;
    } catch (err) {
      setError('Failed to fetch merchant account purchases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactionsByCategory = (selectedCategory, txs) => {
    // TO-DO: fix the logic with parse datetime later
    const parse_selected_category = selectedCategory.charAt(0).toUpperCase() + selectedCategory.substring(1);
    const filteredTxs = txs?.filter((tx, index) => tx.Category == parse_selected_category && dateRange.startDate <= tx.Date && tx.Date <= dateRange.endDate);
    // console.log(filteredTxs);

    return filteredTxs;
  }

  useEffect(() => {
    fetchTransactions();
    fetchMerchants();
  }, []);

  TransactionsProvider.propTypes = {
    children: PropTypes.node.isRequired
  };

  return (
    <TransactionsContext.Provider 
      value={{
        transactions,
        categories,
        monthlyIncome,
        setMonthlyIncome,
        updateLimits,
        fetchTransactions,
        createPurchase,
        loading,
        error,
        accounts,
        merchants,
        fetchPurchasesByMerchant,
        fetchMerchantAccountPurchases,
        currentCategory,
        setCurrentCategory,
        filterTransactionsByCategory,
        dateRange,
        setDateRange,
        calculateSpending
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export const useTransactions = () => useContext(TransactionsContext); 