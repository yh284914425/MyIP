import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    // 基础状态
    isDarkMode: false,
    isMobile: false,
    lang: 'en',
    currentPath: { path: '/' },
    
    // 挂载状态跟踪
    mountingStatus: {},
    
    // Firebase相关（如果需要的话）
    isFireBaseSet: false,
    
    // 后端配置
    backendConfigs: null
  }),

  getters: {
    // 计算属性
  },

  actions: {
    // 设置移动端状态
    setIsMobile(isMobile) {
      this.isMobile = isMobile
    },

    // 设置挂载状态
    setMountingStatus(component, status) {
      this.mountingStatus[component] = status
    },

    // 加载用户偏好设置
    async loadPreferences() {
      // 从localStorage加载设置
      try {
        const darkMode = localStorage.getItem('darkMode')
        if (darkMode !== null) {
          this.isDarkMode = JSON.parse(darkMode)
        }
      } catch (error) {
        console.warn('Failed to load preferences:', error)
      }
    },

    // 获取后端配置
    async fetchConfigs() {
      try {
        // 在Nuxt中使用$fetch来调用API
        const { data } = await $fetch('/api/configs')
        this.backendConfigs = data
      } catch (error) {
        console.warn('Failed to fetch backend configs:', error)
      }
    },

    // 检查Firebase环境
    checkFirebaseEnv() {
      // Firebase相关逻辑（如果需要的话）
      this.isFireBaseSet = false
    },

    // 初始化认证监听器
    async initializeAuthListener() {
      // Firebase认证相关逻辑
      return Promise.resolve()
    }
  }
})