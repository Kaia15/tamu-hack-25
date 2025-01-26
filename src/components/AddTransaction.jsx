import { useState } from 'react';
import PropTypes from 'prop-types';
import { useTransactions } from '../context/TransactionsContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Alert
} from '@mui/material';

function AddTransaction({ onClose }) {
  const { accounts, merchants, createPurchase } = useTransactions();
  const [formData, setFormData] = useState({
    accountId: '',
    merchantId: '',
    amount: '',
    description: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.accountId || !formData.merchantId || !formData.amount) {
        setError('Please fill in all required fields');
        return;
      }

      await createPurchase(formData.accountId, {
        merchant_id: formData.merchantId,
        amount: parseFloat(formData.amount),
        description: formData.description,
        purchase_date: new Date().toISOString()
      });

      onClose();
    } catch (err) {
      setError('Failed to create transaction');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Dialog 
      open={true} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: "rounded-lg"
      }}
    >
      <DialogTitle className="bg-white border-b">
        Add New Transaction
      </DialogTitle>
      <DialogContent className="p-6">
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} className="space-y-4">
          <TextField
            select
            fullWidth
            label="Account"
            name="accountId"
            value={formData.accountId}
            onChange={handleChange}
            required
            className="bg-white"
          >
            <MenuItem value="">Select Account</MenuItem>
            {accounts.map(account => (
              <MenuItem key={account._id} value={account._id}>
                {account.nickname || account.type}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Merchant"
            name="merchantId"
            value={formData.merchantId}
            onChange={handleChange}
            required
            className="bg-white"
          >
            <MenuItem value="">Select Merchant</MenuItem>
            {merchants.map(merchant => (
              <MenuItem key={merchant._id} value={merchant._id}>
                {merchant.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Amount"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: <span className="text-gray-500 mr-2">$</span>,
            }}
            className="bg-white"
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter description"
            className="bg-white"
          />
        </Box>
      </DialogContent>
      <DialogActions className="bg-gray-50 border-t p-4">
        <Button 
          onClick={onClose}
          className="text-gray-600"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Transaction
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AddTransaction.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default AddTransaction; 