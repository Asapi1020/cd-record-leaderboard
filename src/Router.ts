import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import Records from './pages/Records.vue';
import RecordDetails from './pages/RecordDetails.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: "/records", name: "Records", component: Records },
  { path: "/records/:id", name: "Record", component: RecordDetails }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
