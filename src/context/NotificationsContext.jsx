import { createContext, useState, useContext, useEffect } from 'react';

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const checkLimits = (categories) => {
    Object.entries(categories).forEach(([category, data]) => {
      const percentageUsed = (data.spent / data.limit) * 100;
      
      if (percentageUsed >= 90) {
        addNotification(
          `Warning: You've used ${percentageUsed.toFixed(1)}% of your ${category} budget!`,
          'warning'
        );
      }
    });
  };

  const sendWeeklyReminder = () => {
    addNotification('Here\'s your weekly spending summary...', 'info');
    // Add logic to summarize weekly spending
  };

  useEffect(() => {
    // Set up weekly reminder
    const weeklyInterval = setInterval(sendWeeklyReminder, 7 * 24 * 60 * 60 * 1000);
    return () => clearInterval(weeklyInterval);
  }, []);

  return (
    <NotificationsContext.Provider 
      value={{
        notifications,
        addNotification,
        removeNotification,
        checkLimits
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext); 