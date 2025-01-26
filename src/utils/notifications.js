export const playAlertSound = () => {
  const audio = new Audio('/alert.mp3'); // Add an alert.mp3 to your public folder
  audio.play().catch(e => console.log('Audio play failed:', e));
};

export const checkAndNotifyOverspending = (categories) => {
  Object.entries(categories).forEach(([category, data]) => {
    if (data.spent > data.limit) {
      playAlertSound();
      // You can also add browser notifications here
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Budget Alert', {
          body: `You've exceeded your ${category} budget by $${(data.spent - data.limit).toFixed(2)}`,
          icon: '/logo.png'
        });
      }
    }
  });
}; 