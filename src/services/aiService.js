class AIService {
  constructor() {
    this.openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
  }

  async analyzeSpending(transactions, categories) {
    try {
      if (!this.openAIKey) {
        console.warn('OpenAI API key not found, using mock data');
        return this.getDefaultInsights(categories);
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openAIKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "system",
            content: `You are a financial advisor AI that analyzes spending patterns and provides personalized recommendations. 
                     Provide specific, actionable advice based on the user's actual spending patterns and budget limits.
                     Focus on practical steps they can take to improve their financial health.`
          }, {
            role: "user",
            content: this.formatSpendingData(transactions, categories)
          }],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI API');
      }

      return this.parseAIResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('AI API Error:', error);
      const insights = this.getDefaultInsights(categories);
      insights.alerts.unshift({
        type: 'error',
        message: 'Unable to generate AI insights at the moment. Showing default recommendations.'
      });
      return insights;
    }
  }

  getDefaultInsights(categories) {
    const insights = {
      recommendations: [],
      alerts: [],
      insights: []
    };

    try {
      // Generate basic insights
      Object.entries(categories).forEach(([category, data]) => {
        if (!data || typeof data.spent !== 'number' || typeof data.limit !== 'number') {
          return;
        }

        const spentPercentage = (data.spent / data.limit) * 100;

        // Add alerts for high spending
        if (spentPercentage > 80) {
          insights.alerts.push({
            type: 'warning',
            message: `You've used ${spentPercentage.toFixed(0)}% of your ${category} budget.`
          });
        }

        // Add alerts for exceeded budgets
        if (data.spent > data.limit) {
          insights.alerts.push({
            type: 'error',
            message: `You've exceeded your ${category} budget by $${(data.spent - data.limit).toFixed(2)}.`
          });
        }
      });

      // Add general financial insights
      insights.insights = [
        {
          type: 'pattern',
          message: 'Consider setting up automatic savings transfers to reach your financial goals faster.'
        },
        {
          type: 'tip',
          message: 'Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.'
        },
        {
          type: 'suggestion',
          message: 'Review your subscriptions and recurring charges to identify potential savings.'
        }
      ];

    } catch (error) {
      console.error('Error generating insights:', error);
    }

    return insights;
  }

  formatSpendingData(transactions, categories) {
    const categorySpending = Object.entries(categories)
      .map(([category, data]) => ({
        category,
        spent: data.spent,
        limit: data.limit,
        percentage: ((data.spent / data.limit) * 100).toFixed(1)
      }));

    const recentTransactions = transactions
      .slice(0, 20)
      .map(t => ({
        date: t.Date,
        description: t['Activity Description'],
        amount: parseFloat(t.Amount),
        category: t.Category
      }));

    return `
      Please analyze this financial data and provide specific, personalized recommendations:

      Current Category Spending:
      ${JSON.stringify(categorySpending, null, 2)}

      Recent Transactions:
      ${JSON.stringify(recentTransactions, null, 2)}

      Please provide:
      1. Specific recommendations for each category that's over 80% of its budget
      2. Actionable steps to reduce spending in high-spend categories
      3. Potential savings opportunities based on spending patterns
      4. Specific merchant or transaction-based insights
      5. Long-term financial health suggestions

      For each category, analyze the spending patterns and suggest realistic savings targets based on:
      - Comparison with typical spending in similar categories
      - Identification of non-essential expenses
      - Opportunities for better deals or alternatives
      - Seasonal spending patterns
      - Recurring vs one-time expenses

      Return a raw JSON object (no markdown, no code blocks) with this structure:
      {
        "recommendations": [
          {
            "category": "string",
            "message": "string",
            "actionSteps": ["string"],
            "potentialSavings": number,
            "reasoning": "string",
            "timeframe": "string"
          }
        ],
        "alerts": [
          {
            "type": "warning|error|info",
            "message": "string"
          }
        ],
        "insights": [
          {
            "type": "pattern|suggestion|tip",
            "message": "string"
          }
        ]
      }
      Important: Return only the JSON object, with no markdown formatting or code blocks.
      Make recommendations specific and actionable, with realistic savings targets based on actual spending patterns.
    `;
  }

  parseAIResponse(response) {
    try {
      // Strip markdown code block formatting if present
      const jsonString = response.replace(/```json\n|\n```/g, '').trim();
      
      // Parse the cleaned JSON string
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw response:', response); // For debugging
      return this.getDefaultInsights({});
    }
  }
}

export const aiService = new AIService(); 