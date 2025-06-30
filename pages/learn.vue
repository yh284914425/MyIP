<template>
  <div>
    <!-- Learning Center Component -->
    <LearnPage />
  </div>
</template>

<script setup>
// SEO Meta配置 - 针对学习页面优化
useSeoMeta({
  title: 'DNS Security Learning Center - SecureDNSCheck',
  description: 'Master DNS security with comprehensive guides, tutorials and best practices. Learn about DNS leaks, VPN protection, and privacy security.',
  ogTitle: 'DNS Security Learning Center - SecureDNSCheck',
  ogDescription: 'Comprehensive DNS security guides and tutorials. Learn how to protect your privacy online.',
  ogType: 'website',
  keywords: 'DNS security guide, VPN tutorials, DNS leak protection, online privacy, cybersecurity education'
})

// 页面配置 - 启用预渲染优化SEO
definePageMeta({
  prerender: true
})
</script>