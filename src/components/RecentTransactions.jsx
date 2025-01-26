import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import PropTypes from 'prop-types';

const RecentTransactions = ({ transactions = [], initialCount = 5 }) => {
  const [showAll, setShowAll] = useState(false);

  // Filter out transactions with invalid dates and sort
  const sortedTransactions = [...transactions]
    .filter(t => t?.Date && !isNaN(new Date(t.Date).getTime()))
    .sort((a, b) => new Date(b.Date) - new Date(a.Date));

  const displayedTransactions = showAll 
    ? sortedTransactions 
    : sortedTransactions.slice(0, initialCount);

  if (!transactions?.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
        <p className="text-gray-600">No transactions available.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Recent Transactions</h2>
        <button
         onClick={() => setShowAll(!showAll)}
         className="bg-white text-blue-600 border font-medium px-4 py-2 rounded"
         style={{
           color: '#2F76AE',
           borderColor: '#2F76AE',
         }}
         onMouseEnter={(e) => {
           e.target.style.backgroundColor = '#2F76AE';
           e.target.style.color = '#ffffff';
         }}
         onMouseLeave={(e) => {
           e.target.style.backgroundColor = '#ffffff';
           e.target.style.color = '#2F76AE';
         }}
       >
         {showAll ? 'Show Less' : 'Show All'}
       </button>

      </div>
      
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedTransactions.map((transaction, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(transaction.Date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction['Activity Description']}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    getCategoryColor(transaction.Category)
                  }`}>
                    {transaction.Category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                  ${parseFloat(transaction.Amount || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper function to get category color classes
const getCategoryColor = (category) => {
  const colors = {
    'Dining': 'bg-red-100 text-red-800',
    'Merchandise': 'bg-blue-100 text-blue-800',
    'Travel': 'bg-green-100 text-green-800',
    'Entertainment': 'bg-purple-100 text-purple-800',
    'Grocery': 'bg-yellow-100 text-yellow-800'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

RecentTransactions.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      Date: PropTypes.string,
      'Activity Description': PropTypes.string,
      Category: PropTypes.string,
      Amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  ),
  initialCount: PropTypes.number
};

RecentTransactions.defaultProps = {
  transactions: [],
  initialCount: 5
};

export default RecentTransactions; 