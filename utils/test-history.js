// Test History Management
const HISTORY_KEY = 'secureDNSCheck_testHistory';
const MAX_HISTORY_ITEMS = 10;

export const saveTestResult = (testResult) => {
  try {
    const history = getTestHistory();
    const newResult = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...testResult
    };
    
    // Add new result to the beginning
    history.unshift(newResult);
    
    // Keep only the latest MAX_HISTORY_ITEMS
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
    
    return newResult;
  } catch (error) {
    console.error('Error saving test result:', error);
    return null;
  }
};

export const getTestHistory = () => {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading test history:', error);
    return [];
  }
};

export const clearTestHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing test history:', error);
    return false;
  }
};

export const formatTestDate = (timestamp) => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    // Less than 1 day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Less than 1 week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    // Format as date
    return date.toLocaleDateString();
  } catch (error) {
    return 'Unknown date';
  }
};