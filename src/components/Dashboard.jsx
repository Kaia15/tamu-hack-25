import { useState, useEffect } from 'react';
import { useTransactions } from '../context/TransactionsContext';
import { useNotifications } from '../context/NotificationsContext';
import AddTransaction from './AddTransaction';
import BudgetPlanModal from './BudgetPlanModal';
import RecentTransactions from './RecentTransactions';
import Papa from 'papaparse';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  Alert,
  LinearProgress,
  Grid,
  Paper,
  Chip
} from '@mui/material';

import CategoryCardBudget from "./CategoryCardBudget";
import CustomPaginationActionsTable from "./TransactionTable";
import { checkAndNotifyOverspending } from '../utils/notifications';
import PropTypes from 'prop-types';

function MainDashboard({csvTransactions,accounts,categories}) {
  const { notifications } = useNotifications();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showBudgetPlan, setShowBudgetPlan] = useState(false);
  const { categories: budgetCategories, dateRange, calculateSpending } = useTransactions();

  // Calculate total budget and spending
  const totals = Object.values(budgetCategories).reduce((acc, data) => ({
    spent: acc.spent + data.spent,
    limit: acc.limit + data.limit
  }), { spent: 0, limit: 0 });
  
  const totalPercentage = totals.limit > 0 ? (totals.spent / totals.limit) * 100 : 0;

  // Calculate overspending alerts
  const spendingAlerts = Object.entries(budgetCategories).reduce((alerts, [category, data]) => {
    if (data.limit > 0) {
      if (data.spent > data.limit) {
        alerts.push({
          type: 'error',
          message: `Warning: You've exceeded your ${category} budget by $${(data.spent - data.limit).toFixed(2)}`
        });
      } else if (data.percentage > 80) {
        alerts.push({
          type: 'warning',
          message: `Heads up: You've used ${data.percentage.toFixed(0)}% of your ${category} budget`
        });
      }
    }
    return alerts;
  }, []);
  
  useEffect(() => {
    if (csvTransactions?.length > 0) {
      const processedTransactions = csvTransactions.map(t => ({
        ...t,
        Amount: parseFloat(t.Amount),
        Date: new Date(t.Date).toISOString().split('T')[0],
        Category: t.Category.toLowerCase()
      }));

      // Set initial date range if not set
      if (!dateRange.startDate || !dateRange.endDate) {
        const dates = processedTransactions.map(t => new Date(t.Date));
        const minDate = new Date(Math.min(...dates)).toISOString().split('T')[0];
        const maxDate = new Date(Math.max(...dates)).toISOString().split('T')[0];
        calculateSpending(processedTransactions, { startDate: minDate, endDate: maxDate });
      } else {
        calculateSpending(processedTransactions, dateRange);
      }
    }
  }, [csvTransactions, dateRange, calculateSpending]);

  return (
    <div className="basis-3/4 flex items-center flex-col justify-center p-4">
      {/* System Notifications */}
      {notifications.map((notification, index) => (
        <Alert 
          key={`notification-${index}`}
          severity={notification.type} 
          className="mb-4 w-full"
        >
          {notification.message}
        </Alert>
      ))}

      {/* Spending Alerts */}
      {spendingAlerts.map((alert, index) => (
        <Alert
          key={`spending-${index}`}
          severity={alert.type}
          className="mb-4 w-full"
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => setShowBudgetPlan(true)}
            >
              Adjust Budget
            </Button>
          }
        >
          {alert.message}
        </Alert>
      ))}

      <Box className="flex justify-between items-center mb-6 w-full">
        <Typography variant="h5" className="text-gray-800">
          Your Accounts
        </Typography>
        <Box className="space-x-4 mx-3">
          <Button 
            variant="contained" 
            onClick={() => setShowBudgetPlan(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Set Budget Limits
          </Button>
        </Box>
      </Box>

      {/* Enhanced Total Budget Overview Card */}
      <Card className="w-full mb-6 shadow hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-4">
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h5" className="text-gray-800 font-semibold">
              Total Budget Overview
            </Typography>
            <Chip 
              label={`${totalPercentage.toFixed(1)}% Used`}
              color={totalPercentage > 100 ? 'error' : totalPercentage > 80 ? 'warning' : 'success'}
              size="small"
              className="font-medium"
            />
          </Box>
          
          <Grid container spacing={3} className="mb-3">
            <Grid item xs={12} md={4}>
              <Box className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <Typography variant="subtitle2" color="text.secondary">
                  Total Budget
                </Typography>
                <Typography variant="h5" className="mt-1 font-bold text-blue-600">
                  ${totals.limit.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box className="p-3 rounded-lg bg-green-50 border border-green-100">
                <Typography variant="subtitle2" color="text.secondary">
                  Total Spent
                </Typography>
                <Typography variant="h5" className="mt-1 font-bold text-green-600">
                  ${totals.spent.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box className={`p-3 rounded-lg border ${
                totals.limit - totals.spent > 0 
                  ? 'bg-purple-50 border-purple-100' 
                  : 'bg-red-50 border-red-100'
              }`}>
                <Typography variant="subtitle2" color="text.secondary">
                  Remaining Budget
                </Typography>
                <Typography 
                  variant="h5" 
                  className={`mt-1 font-bold ${
                    totals.limit - totals.spent > 0 ? 'text-purple-600' : 'text-red-600'
                  }`}
                >
                  ${(totals.limit - totals.spent).toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Box className="relative pt-1 px-1">
            <LinearProgress
              variant="determinate"
              value={Math.min(totalPercentage, 100)}
              className={`h-2 rounded-full ${
                totalPercentage > 100 
                  ? 'bg-red-100' 
                  : totalPercentage > 80 
                    ? 'bg-yellow-100' 
                    : 'bg-blue-100'
              }`}
              sx={{
                '& .MuiLinearProgress-bar': {
                  backgroundColor: totalPercentage > 100 
                    ? '#ef4444' 
                    : totalPercentage > 80 
                      ? '#f59e0b' 
                      : '#3b82f6',
                  borderRadius: '9999px'
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Date Range Display */}
      {(dateRange && dateRange.startDate && dateRange.endDate) && 
        <Typography variant='h5' className='my-4'>
          From {dateRange.startDate} to {dateRange.endDate}
        </Typography>
      }

      {/* Categories Grid */}
      <Grid container spacing={3} className="mb-6">
        {Object.entries(budgetCategories).map(([category, data]) => (
          <Grid item xs={12} sm={6} md={4} key={category}>
            <Card className={data.spent > data.limit ? 'border-2 border-red-500' : ''}>
              <CardContent>
                <Typography variant="h6" className="capitalize mb-2">
                  {category}
                </Typography>
                <Box className="flex justify-between mb-2">
                  <Typography>Spent: ${data.spent.toFixed(2)}</Typography>
                  <Typography>Limit: ${data.limit.toFixed(2)}</Typography>
                </Box>
                {data.limit > 0 && (
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(data.percentage, 100)}
                    className={data.spent > data.limit ? 'bg-red-200' : data.percentage > 80 ? 'bg-yellow-200' : 'bg-blue-200'}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <RecentTransactions 
        transactions={csvTransactions} 
        initialCount={5} 
      />

      {showAddTransaction && (
        <AddTransaction onClose={() => setShowAddTransaction(false)} />
      )}

      {showBudgetPlan && (
        <BudgetPlanModal onClose={() => setShowBudgetPlan(false)} />
      )}
    </div>
  );
}

MainDashboard.propTypes = {
  csvTransactions: PropTypes.arrayOf(PropTypes.shape({
    Date: PropTypes.string,
    'Activity Description': PropTypes.string,
    Category: PropTypes.string,
    Amount: PropTypes.string
  })),
  accounts: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    type: PropTypes.string,
    nickname: PropTypes.string,
    balance: PropTypes.number
  })),
  categories: PropTypes.object
};

function CategoryDashboard({category,csvTransactions}) {
  const {filterTransactionsByCategory} = useTransactions();
  const filteredTxs = filterTransactionsByCategory(category,csvTransactions);
  
  return (
    <>
    {(category) && 
    <>
      <CategoryCardBudget category_name={category} />
      <CustomPaginationActionsTable transactions={filteredTxs}/>
    </>}
    </>
  )
}

CategoryDashboard.propTypes = {
  category: PropTypes.string.isRequired,
  csvTransactions: PropTypes.arrayOf(PropTypes.shape({
    Date: PropTypes.string,
    'Activity Description': PropTypes.string,
    Category: PropTypes.string,
    Amount: PropTypes.string
  })).isRequired
};

function Dashboard() {
  const [csvTransactions, setCsvTransactions] = useState([]);
  const { transactions, categories, loading, error, accounts, currentCategory, setCurrentCategory, calculateSpending, dateRange } = useTransactions();

  useEffect(() => {
    const fetchCSVTransactions = async () => {
      try {
        const response = await fetch('/transactions.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const validTransactions = results.data.filter(t => 
              t.Date && 
              t['Activity Description'] && 
              t.Category && 
              t.Amount
            );
            setCsvTransactions(validTransactions);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
          }
        });
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    };
    
    fetchCSVTransactions();
  }, []);

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-[200px]">
        <Typography className="text-primary">Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-8">
        <Alert severity="error" className="mb-4">
          <Typography variant="h6">Error</Typography>
          <Typography>{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <div className="w-full">
      {currentCategory ? (
        <CategoryDashboard 
          category={currentCategory} 
          csvTransactions={csvTransactions}
        />
      ) : (
        <MainDashboard 
          csvTransactions={csvTransactions} 
          accounts={accounts}
          categories={categories}
        />
      )}
    </div>
  );
}

export default Dashboard;