<template>
    <svg :style="{ fill: isDarkMode ? '#fff' : '#1d4ed8' }" class="me-2" width="28" height="28"
        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <!-- Shield with DNS icon -->
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
        <!-- DNS Server icon inside shield -->
        <rect x="8" y="7" width="8" height="1.5" rx="0.75" :fill="isDarkMode ? '#1f2937' : '#fff'"/>
        <rect x="8" y="9.5" width="6" height="1.5" rx="0.75" :fill="isDarkMode ? '#1f2937' : '#fff'"/>
        <rect x="8" y="12" width="8" height="1.5" rx="0.75" :fill="isDarkMode ? '#1f2937' : '#fff'"/>
        <rect x="8" y="14.5" width="4" height="1.5" rx="0.75" :fill="isDarkMode ? '#1f2937' : '#fff'"/>
        <!-- Connection dots -->
        <circle cx="6.5" cy="8" r="1" :fill="isDarkMode ? '#10b981' : '#059669'"/>
        <circle cx="6.5" cy="13" r="1" :fill="isDarkMode ? '#10b981' : '#059669'"/>
        <circle cx="17.5" cy="10.5" r="1" :fill="isDarkMode ? '#ef4444' : '#dc2626'"/>
    </svg>
</template>

<script setup>
import { computed } from 'vue';
import { useMainStore } from '@/store';

const store = useMainStore();
const isDarkMode = computed(() => store.isDarkMode);
</script>