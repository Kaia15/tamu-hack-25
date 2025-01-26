import { useEffect, useState } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { Pie, Bar, Line } from 'react-chartjs-2';
import Papa from 'papaparse';
import { Box, Card, CardContent, Typography, Grid, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { CheckCircleOutline, TrendingUp, ArrowForward, LocalOffer } from '@mui/icons-material';
import { aiService } from '../services/aiService';
import { useTransactions } from '../context/TransactionsContext';

const AccountSummary = () => {
  const { categories } = useTransactions(); // Get categories from context
  const [summaryData, setSummaryData] = useState({
    categoryDistribution: {},
    monthlySpending: {},
    topMerchants: [],
    spendingTrends: {}
  });
  const [insights, setInsights] = useState({
    recommendations: [],
    alerts: [],
    insights: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);

  // Calculate percentages helper function
  const calculatePercentages = (data) => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    return Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = ((value / total) * 100).toFixed(1);
      return acc;
    }, {});
  };

  // Handle action button clicks
  const handleActionClick = (recommendation) => {
    setSelectedAction(recommendation);
    setActionDialogOpen(true);
  };

  useEffect(() => {
    const fetchAndAnalyzeData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/transactions.csv');
        if (!response.ok) {
          throw new Error('Failed to fetch transactions data');
        }
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            try {
              const transactions = results.data.filter(t => {
                const isValid = t.Amount && !isNaN(parseFloat(t.Amount)) && t.Category;
                return isValid;
              });

              // Calculate monthly spending trends
              const monthlySpending = transactions.reduce((acc, t) => {
                const date = new Date(t.Date);
                const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
                const amount = parseFloat(t.Amount);
                acc[monthYear] = (acc[monthYear] || 0) + amount;
                return acc;
              }, {});

              // Add this sorting logic before setting the state
              const sortedMonthlySpending = Object.entries(monthlySpending)
                .sort((a, b) => {
                  const [monthA, yearA] = a[0].split('/');
                  const [monthB, yearB] = b[0].split('/');
                  const dateA = new Date(yearA, monthA - 1);
                  const dateB = new Date(yearB, monthB - 1);
                  return dateA - dateB;
                })
                .reduce((acc, [key, value]) => {
                  acc[key] = value;
                  return acc;
                }, {});

              // Calculate category distribution
              const categoryDistribution = transactions.reduce((acc, t) => {
                const amount = parseFloat(t.Amount);
                if (!isNaN(amount)) {
                  const category = t.Category.toLowerCase();
                  acc[category] = (acc[category] || 0) + amount;
                }
                return acc;
              }, {});

              // Calculate top merchants
              const merchantSpending = transactions.reduce((acc, t) => {
                const amount = parseFloat(t.Amount);
                if (!isNaN(amount)) {
                  acc[t['Activity Description']] = (acc[t['Activity Description']] || 0) + amount;
                }
                return acc;
              }, {});

              const topMerchants = Object.entries(merchantSpending)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5);

              setSummaryData({
                categoryDistribution,
                monthlySpending,
                topMerchants,
                spendingTrends: sortedMonthlySpending
              });

              // Get AI insights using actual budget limits from context
              const aiInsights = await aiService.analyzeSpending(
                transactions,
                categories // Pass the categories object directly
              );
              setInsights(aiInsights);
            } catch (error) {
              console.error('Data Processing Error:', error);
            } finally {
              setLoading(false);
            }
          },
          error: (error) => {
            console.error('CSV Parse Error:', error);
            setError('Error parsing transaction data');
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Fetch Error:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchAndAnalyzeData();
  }, [categories]); // Add categories as dependency

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Typography variant="h4" className="mb-6">Account Summary</Typography>

      {/* Charts Section */}
      <Grid container spacing={4}>
        {/* Category Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">Spending by Category</Typography>
              <Box height={300}>
                <Pie
                  data={{
                    labels: Object.keys(summaryData.categoryDistribution),
                    datasets: [{
                      data: Object.values(summaryData.categoryDistribution),
                      backgroundColor: [
                        '#6366f1',
                        '#ef4444',
                        '#22c55e',
                        '#a855f7',
                        '#f97316'
                      ],
                      borderWidth: 0,
                      hoverOffset: 10
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                          generateLabels: (chart) => {
                            const percentages = calculatePercentages(summaryData.categoryDistribution);
                            return chart.data.labels.map((label, index) => ({
                              text: `${label} ($${categories[label.toLowerCase()]?.limit || 0}) (${percentages[label.toLowerCase()]}%)`,
                              fillStyle: chart.data.datasets[0].backgroundColor[index],
                              index
                            }));
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Spending vs Budget Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">Spending vs Budget</Typography>
              <Box height={300}>
                <Bar
                  data={{
                    labels: Object.keys(categories),
                    datasets: [
                      {
                        label: 'Current Spending',
                        data: Object.values(categories).map(cat => cat.spent),
                        backgroundColor: '#3b82f6'
                      },
                      {
                        label: 'Budget Limit',
                        data: Object.values(categories).map(cat => cat.limit),
                        backgroundColor: '#f43f5e'
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: value => `$${value}`
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Spending Trends */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">Monthly Spending Trends</Typography>
              <Box height={300}>
                <Line
                  data={{
                    labels: Object.keys(summaryData.spendingTrends),
                    datasets: [{
                      label: 'Total Spending',
                      data: Object.values(summaryData.spendingTrends),
                      borderColor: '#4BC0C0',
                      tension: 0.1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Merchants */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">Top Merchants</Typography>
              {summaryData.topMerchants.map(([merchant, amount], index) => (
                <Box key={index} className="flex justify-between items-center mb-2">
                  <Typography>{merchant}</Typography>
                  <Typography>${amount.toFixed(2)}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Budget Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">Budget Status</Typography>
              {Object.entries(categories).map(([category, cat]) => {
                const percentage = (cat.spent / cat.limit) * 100;
                return (
                  <Box key={category} className="mb-3">
                    <Box className="flex justify-between mb-1">
                      <Typography>{category}</Typography>
                      <Typography>{percentage.toFixed(1)}% of budget</Typography>
                    </Box>
                    <Box className="w-full bg-gray-200 rounded">
                      <Box
                        className={`h-2 rounded ${percentage > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI Analysis Button */}
      <Box className="mt-6 text-center">
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => setShowAIInsights(!showAIInsights)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {showAIInsights ? 'Hide AI Analysis' : 'Analyze My Spending'}
        </Button>
      </Box>

      {/* AI Insights Section */}
      {showAIInsights && (
        <Grid container spacing={4} className="mt-4">
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4 flex items-center">
                  <span className="mr-2">AI-Powered Insights</span>
                  {loading && <CircularProgress size={20} />}
                </Typography>

                {/* Alerts */}
                {insights.alerts.map((alert, index) => (
                  <Alert 
                    key={index} 
                    severity={alert.type} 
                    className="mb-3"
                  >
                    {alert.message}
                  </Alert>
                ))}

                {/* Recommendations */}
                <Grid container spacing={2} className="mt-2">
                  {insights.recommendations.map((recommendation, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card variant="outlined" className="h-full">
                        <CardContent>
                          <Typography variant="subtitle1" className="font-medium mb-2">
                            {recommendation.category} Recommendation
                          </Typography>
                          <Typography className="text-gray-600 mb-4">
                            {recommendation.message}
                          </Typography>
                          {recommendation.potentialSavings && (
                            <Typography color="success.main" className="mb-2">
                              Potential Savings: ${recommendation.potentialSavings.toFixed(2)} 
                              {recommendation.timeframe && ` (${recommendation.timeframe})`}
                            </Typography>
                          )}
                          {recommendation.reasoning && (
                            <Typography variant="body2" color="text.secondary" className="mb-2">
                              {recommendation.reasoning}
                            </Typography>
                          )}
                          <Button 
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => handleActionClick(recommendation)}
                            className="mt-2"
                          >
                            Take Action
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Spending Simulations */}
                <Typography variant="h6" className="mt-6 mb-3">
                  Potential Savings Opportunities
                </Typography>
                <Grid container spacing={2}>
                  {insights.recommendations.map((recommendation, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" color="primary" className="mb-2">
                            {recommendation.category}
                          </Typography>
                          <Typography className="mb-2">
                            {recommendation.message}
                          </Typography>
                          {recommendation.potentialSavings && (
                            <Typography color="success.main" className="mb-2">
                              Potential Savings: ${recommendation.potentialSavings.toFixed(2)} 
                              {recommendation.timeframe && ` (${recommendation.timeframe})`}
                            </Typography>
                          )}
                          {recommendation.reasoning && (
                            <Typography variant="body2" color="text.secondary" className="mb-2">
                              {recommendation.reasoning}
                            </Typography>
                          )}
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => handleActionClick(recommendation)}
                            className="mt-2"
                          >
                            Take Action
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Action Steps Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Action Plan: {selectedAction?.category}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" className="mb-4">
            {selectedAction?.message}
          </Typography>
          
          {selectedAction?.actionSteps && (
            <>
              <Typography variant="subtitle2" className="mb-2">
                Recommended Steps:
              </Typography>
              <List>
                {selectedAction.actionSteps.map((step, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleOutline color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={step} />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {selectedAction?.reasoning && (
            <Box className="mt-4 p-3 bg-gray-50 rounded">
              <Typography variant="body2" color="text.secondary">
                <strong>Why this matters:</strong> {selectedAction.reasoning}
              </Typography>
            </Box>
          )}

          {selectedAction?.potentialSavings && (
            <Box className="mt-4 p-3 bg-green-50 rounded">
              <Typography color="success.main">
                Potential {selectedAction.timeframe || 'Monthly'} Savings: ${selectedAction.potentialSavings.toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setActionDialogOpen(false)}
          >
            Got It
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AccountSummary; 