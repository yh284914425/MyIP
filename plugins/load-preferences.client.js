// plugins/load-preferences.client.js
import { useMainStore } from '~/stores/main'

export default defineNuxtPlugin(() => {
  const store = useMainStore()
  store.loadPreferences()
})