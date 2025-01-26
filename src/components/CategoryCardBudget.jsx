import { cards } from "../utils/constants";
import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Alert, Button, LinearProgress } from "@mui/material";
import { useTransactions } from "../context/TransactionsContext";
import PropTypes from 'prop-types';

export default function CategoryCardBudget({ category_name }) {
  const { categories, dateRange } = useTransactions();
  const { limit, spent, percentage } = categories[category_name.toLowerCase()] || 
    { limit: 0, spent: 0, percentage: 0 };
  const parse_category_name = category_name.charAt(0).toUpperCase() + category_name.substring(1);
  
  const isOverBudget = spent > limit && limit > 0;
  const isNearLimit = percentage > 80 && limit > 0;

  return (
    <Card className="min-w-[500px]">
      <CardContent sx={{ height: '100%' }} className="text-left">
        {/* Category Header with Alert */}
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h5" component="div">
            {parse_category_name}
          </Typography>
          {isOverBudget && (
            <Alert 
              severity="error" 
              icon={false}
              className="py-0 px-2"
            >
              Over Budget
            </Alert>
          )}
          {!isOverBudget && isNearLimit && (
            <Alert 
              severity="warning"
              icon={false}
              className="py-0 px-2"
            >
              Near Limit
            </Alert>
          )}
        </Box>

        {/* Spending Amount */}
        <Typography variant="h3" className="font-bold mb-2">
          ${spent.toFixed(2)} {limit > 0 ? `/ $${limit.toFixed(2)}` : '(No limit set)'}
        </Typography>

        {/* Progress Bar */}
        {limit > 0 && (
          <Box className="mb-2">
            <LinearProgress
              variant="determinate"
              value={Math.min(percentage, 100)}
              className={isOverBudget ? 'bg-red-200' : isNearLimit ? 'bg-yellow-200' : 'bg-blue-200'}
              sx={{
                height: 8,
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  bgcolor: isOverBudget ? '#ef4444' : isNearLimit ? '#f59e0b' : '#2563eb'
                }
              }}
            />
          </Box>
        )}

        {/* Spending Status */}
        {isOverBudget && (
          <Alert 
            severity="error" 
            className="mb-3"
          >
            You've exceeded your budget by ${(spent - limit).toFixed(2)}
          </Alert>
        )}
        {!isOverBudget && isNearLimit && (
          <Alert 
            severity="warning"
            className="mb-3"
          >
            You've used {percentage.toFixed(0)}% of your budget
          </Alert>
        )}

        {/* Date Range */}
        <Typography variant="body2" className="font-bold mb-2">
          Date: {dateRange.startDate} - {dateRange.endDate}
        </Typography>

        {/* Action Buttons */}
        <Box className="flex gap-2">
          <Button 
            variant="outlined" 
            color={isOverBudget ? "error" : isNearLimit ? "warning" : "primary"}
            className="my-2"
          >
            <Typography variant="body2">
              Edit Limit
            </Typography>
          </Button>
          {(isOverBudget || isNearLimit) && (
            <Button 
              variant="outlined" 
              color={isOverBudget ? "error" : "warning"}
              className="my-2"
            >
              <Typography variant="body2">
                View Savings Tips
              </Typography>
            </Button>
          )}
        </Box>

        {/* Additional Info */}
        <Box className="mt-4 p-3 bg-gray-50 rounded-lg">
          <Typography variant="body2" color="text.secondary">
            {isOverBudget ? (
              "⚠️ Consider reviewing your spending in this category to get back on track."
            ) : isNearLimit ? (
              "⚠️ You're close to your budget limit. Consider reducing spending in this category."
            ) : (
              "✅ You're managing this budget well!"
            )}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

CategoryCardBudget.propTypes = {
  category_name: PropTypes.string.isRequired
};