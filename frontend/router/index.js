import { createRouter, createWebHashHistory } from 'vue-router';

// 组件懒加载
const EmptyComponent = () => import('../components/advanced-tools/Empty.vue');
const LearnPage = () => import('../components/LearnPage.vue');

const routes = [
  { path: '/', component: EmptyComponent },
  { path: '/learn', component: LearnPage },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;