import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import Records from './pages/Records.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: "/records",
    name: "Records",
    component: Records
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
