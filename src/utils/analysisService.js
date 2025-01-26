export const analyzeTransactions = (transactions) => {
  // Group transactions by category
  const categoryTotals = transactions.reduce((acc, transaction) => {
    const { Category, Amount } = transaction;
    acc[Category] = (acc[Category] || 0) + parseFloat(Amount);
    return acc;
  }, {});

  // Generate recommendations based on spending patterns
  const generateRecommendations = (spending, limits) => {
    const recommendations = [];

    Object.entries(spending).forEach(([category, amount]) => {
      const limit = limits[category];
      const percentageUsed = (amount / limit) * 100;

      if (percentageUsed > 100) {
        recommendations.push({
          category,
          analysis: `Overspent by ${(percentageUsed - 100).toFixed(1)}%`,
          suggestions: [
            `Consider setting a higher budget for ${category}`,
            `Look for ways to reduce ${category} expenses`,
            `Track ${category} spending more closely`
          ]
        });
      } else if (percentageUsed > 80) {
        recommendations.push({
          category,
          analysis: `Near limit (${percentageUsed.toFixed(1)}% used)`,
          suggestions: [
            `Monitor ${category} spending carefully`,
            `Plan remaining ${category} expenses`,
            `Look for cost-saving opportunities`
          ]
        });
      }
    });

    return recommendations;
  };

  return {
    spending: categoryTotals,
    recommendations: generateRecommendations(categoryTotals, {
      'Dining': 440,
      'Merchandise': 500,
      'Travel': 450,
      'Entertainment': 300,
      'Grocery': 500
    })
  };
}; 