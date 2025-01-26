import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTransactions } from '../context/TransactionsContext';
import { 
    Dialog,
    DialogContent,
    Button,
    Checkbox,
    FormControlLabel,
    Grid,
    Box,
    Typography,
    TextField,
    IconButton,
    Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function BudgetPlanModal({ onClose }) {
    const { categories, updateLimits } = useTransactions();
    const [formData, setFormData] = useState({
        totalBudget: Object.values(categories).reduce((sum, cat) => sum + cat.limit, 0).toString(),
        startDate: '',
        endDate: '',
        alertThreshold: 80,
        categories: Object.keys(categories).reduce((acc, category) => {
            const limit = categories[category].limit;
            const total = Object.values(categories).reduce((sum, cat) => sum + cat.limit, 0);
            acc[category] = {
                percentage: total > 0 ? ((limit / total) * 100).toFixed(1) : '',
                amount: limit.toString()
            };
            return acc;
        }, {})
    });

    const handleTotalBudgetChange = (value) => {
        const totalBudget = parseFloat(value) || 0;
        setFormData(prev => ({
        ...prev,
        totalBudget: value,
        categories: Object.keys(prev.categories).reduce((acc, category) => {
            const percentage = parseFloat(prev.categories[category].percentage) || 0;
            acc[category] = {
            percentage: prev.categories[category].percentage,
            amount: ((totalBudget * percentage) / 100).toFixed(2),
            };
            return acc;
        }, {})
        }));
    };

    const handlePercentageChange = (category, value) => {
        const percentage = parseFloat(value) || 0;
        const amount = ((parseFloat(formData.totalBudget) || 0) * percentage / 100).toFixed(2);
        
        setFormData(prev => ({
        ...prev,
        categories: {
            ...prev.categories,
            [category]: { percentage: value, amount }
        }
        }));
    };

    const handleAmountChange = (category, value) => {
        const amount = parseFloat(value) || 0;
        const percentage = formData.totalBudget ? 
        ((amount / parseFloat(formData.totalBudget)) * 100).toFixed(1) : '0';
        
        setFormData(prev => ({
        ...prev,
        categories: {
            ...prev.categories,
            [category]: { percentage, amount: value }
        }
        }));
    };

    // Calculate total percentage and check if it exceeds 100%
    const { totalPercentage, totalAmount } = useMemo(() => {
        const total = Object.values(formData.categories).reduce(
            (sum, { percentage }) => sum + (parseFloat(percentage) || 0),
            0
        );
        const amount = Object.values(formData.categories).reduce(
            (sum, { amount }) => sum + (parseFloat(amount) || 0),
            0
        );
        return { totalPercentage: total, totalAmount: amount };
    }, [formData.categories]);

    const isOverBudget = totalAmount > parseFloat(formData.totalBudget || 0);
    const isOver100Percent = totalPercentage > 100;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isOverBudget || isOver100Percent) {
            return;
        }

        // Format the limits for the context update
        const limits = Object.entries(formData.categories).reduce((acc, [category, data]) => {
            acc[category] = { limit: parseFloat(data.amount) || 0 };
            return acc;
        }, {});

        updateLimits(limits, {
            startDate: formData.startDate,
            endDate: formData.endDate
        });
        onClose();
    };

    return (
        <Dialog 
            open={true} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            sx={{ '& .MuiDialog-paper': { bgcolor: '#EEF3F8' } }}
        >
        <Box className="flex justify-between items-center p-4">
            <Typography variant="h6" className="text-gray-800">
                Create a new budget plan
            </Typography>
            <IconButton 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
                size="small"
            >
                <CloseIcon />
            </IconButton>
        </Box>
        <DialogContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <Typography variant="subtitle2" className="mb-2 text-gray-700">
                    Budget
                </Typography>
                <TextField
                    fullWidth
                    type="number"
                    value={formData.totalBudget}
                    onChange={(e) => handleTotalBudgetChange(e.target.value)}
                    placeholder="Enter total budget"
                    required
                    InputProps={{
                        startAdornment: <span className="text-gray-500 mr-2">$</span>,
                    }}
                    className="bg-white rounded-md"
                />
            </div>

            <Grid container spacing={3}>
                <Grid item xs={6}>
                <Typography variant="subtitle2" className="mb-2 text-gray-700">
                    Start date
                </Typography>
                <TextField
                    fullWidth
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                    className="bg-white rounded-md"
                    InputLabelProps={{ shrink: true }}
                />
                </Grid>
                <Grid item xs={6}>
                <Typography variant="subtitle2" className="mb-2 text-gray-700">
                    End date
                </Typography>
                <TextField
                    fullWidth
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                    className="bg-white rounded-md"
                    InputLabelProps={{ shrink: true }}
                />
                </Grid>
            </Grid>

            <Box className="space-y-4">
                {Object.entries(formData.categories).map(([category, values]) => (
                <Grid container key={category} spacing={2} alignItems="center">
                    <Grid item xs={4}>
                    <Typography variant="subtitle2" className="text-gray-700">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            type="number"
                            value={values.percentage}
                            onChange={(e) => handlePercentageChange(category, e.target.value)}
                            placeholder="0"
                            InputProps={{
                                endAdornment: <span className="text-gray-500 ml-2">%</span>,
                            }}
                            className="bg-white rounded-md"
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            type="number"
                            value={values.amount}
                            onChange={(e) => handleAmountChange(category, e.target.value)}
                            placeholder="0.00"
                            InputProps={{
                                startAdornment: <span className="text-gray-500 mr-2">$</span>,
                            }}
                            className="bg-white rounded-md"
                        />
                    </Grid>
                </Grid>
                ))}
            </Box>

            {/* Only show the budget allocation box when limits are exceeded */}
            {(isOverBudget || isOver100Percent) && (
                <Box className="mt-4 p-4 bg-white rounded-lg">
                    <Typography 
                        className="font-medium text-lg text-red-600"
                    >
                        Total Budget Allocation
                    </Typography>
                    <Box className="flex justify-between items-center mt-2">
                        <Typography className="text-red-600">
                            ${totalAmount.toFixed(2)} of ${parseFloat(formData.totalBudget || 0).toFixed(2)}
                            <span className="ml-2">({totalPercentage.toFixed(1)}%)</span>
                        </Typography>
                    </Box>
                    <Alert severity="error" className="mt-2">
                        {isOverBudget 
                            ? 'Total allocation exceeds your budget' 
                            : 'Total percentage exceeds 100%'
                        }
                    </Alert>
                </Box>
            )}

            <FormControlLabel
                control={
                    <Checkbox
                        checked={formData.alertThreshold !== null}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            alertThreshold: e.target.checked ? 80 : null
                        }))}
                        className="text-gray-700"
                    />
                }
                label="Set budget limit alert (80%)"
                className="text-gray-700"
            />

            <Box className="flex justify-center space-x-4 pt-6">
                <Button 
                    type="submit" 
                    variant="contained"
                    className="w-32 bg-red-600 hover:bg-red-700 normal-case"
                    disabled={isOverBudget || isOver100Percent}
                    sx={{ 
                        bgcolor: '#dc2626',
                        '&:hover': { bgcolor: '#b91c1c' },
                        '&.Mui-disabled': {
                            bgcolor: '#f87171',
                        }
                    }}
                >
                    Create
                </Button>
            </Box>
            </form>
        </DialogContent>
        </Dialog>
    );
    }

    BudgetPlanModal.propTypes = {
    onClose: PropTypes.func.isRequired
    };

    export default BudgetPlanModal; 