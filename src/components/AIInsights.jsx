import { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';
import PropTypes from 'prop-types';
import { 
  Card, 
  CardContent, 
  Typography, 
  Alert, 
  Box,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import { 
  TrendingUp, 
  CheckCircleOutline,
  ArrowForward,
  LocalOffer
} from '@mui/icons-material';

const AIInsights = ({ transactions, categories }) => {
  const [insights, setInsights] = useState({
    recommendations: [],
    alerts: [],
    insights: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);

  useEffect(() => {
    const analyzeData = async () => {
      try {
        setLoading(true);
        const aiInsights = await aiService.analyzeSpending(transactions, categories);
        setInsights(aiInsights);
      } catch (error) {
        console.error('Error analyzing data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (transactions?.length > 0 && categories) {
      analyzeData();
    }
  }, [transactions, categories]);

  const handleActionClick = (recommendation) => {
    setSelectedAction(recommendation);
    setActionDialogOpen(true);
  };

  if (loading) {
    return (
      <Box p={2}>
        <LinearProgress />
        <Typography className="mt-2">Analyzing your spending patterns...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4">
            AI-Powered Financial Insights
          </Typography>

          {/* Alerts Section */}
          {insights.alerts.map((alert, index) => (
            <Alert 
              key={index} 
              severity={alert.type} 
              className="mb-3"
              icon={alert.type === 'warning' ? <TrendingUp /> : undefined}
            >
              {alert.message}
            </Alert>
          ))}

          {/* Recommendations Section */}
          <Box className="space-y-4 mt-4">
            {insights.recommendations.map((rec, index) => (
              <Card key={index} variant="outlined" className="p-4">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1" className="font-medium">
                      {rec.category}
                    </Typography>
                    <Typography className="text-gray-600 mt-1">
                      {rec.message}
                    </Typography>
                    {rec.potentialSavings && (
                      <Chip
                        icon={<LocalOffer />}
                        label={`Potential Savings: $${rec.potentialSavings.toFixed(2)}`}
                        color="success"
                        size="small"
                        className="mt-2"
                      />
                    )}
                  </Box>
                  <Button 
                    variant="contained"
                    color="primary"
                    endIcon={<ArrowForward />}
                    onClick={() => handleActionClick(rec)}
                  >
                    Take Action
                  </Button>
                </Box>
              </Card>
            ))}
          </Box>

          {/* General Insights Section */}
          <Box className="mt-6">
            <Typography variant="subtitle1" className="mb-3">
              Financial Health Insights
            </Typography>
            <List>
              {insights.insights.map((insight, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleOutline color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={insight.message} />
                </ListItem>
              ))}
            </List>
          </Box>
        </CardContent>
      </Card>

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

          {selectedAction?.potentialSavings && (
            <Box className="mt-4 p-3 bg-green-50 rounded">
              <Typography color="success.main">
                Potential Monthly Savings: ${selectedAction.potentialSavings.toFixed(2)}
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
    </>
  );
};

AIInsights.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.shape({
    Date: PropTypes.string,
    'Activity Description': PropTypes.string,
    Category: PropTypes.string,
    Amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })),
  categories: PropTypes.object
};

export default AIInsights; 