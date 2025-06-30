// 简化的analytics工具 - 避免外部依赖
const analyticsID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '';

// 简单的Google Analytics 4 事件跟踪
function trackEvent(category, action, label) {
  if (typeof window !== 'undefined' && window.gtag && analyticsID) {
    try {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        measurement_id: analyticsID
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }
}

// 初始化Google Analytics（如果需要的话）
function initializeAnalytics() {
  if (typeof window !== 'undefined' && analyticsID) {
    // 如果页面已经加载了gtag，就使用它
    if (!window.gtag) {
      console.log('Google Analytics not loaded, skipping initialization');
    }
  }
}

export { initializeAnalytics, trackEvent };