import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import RegisterView from './views/RegisterView.vue';
import LoginView from './views/LoginView.vue';
import ControlView from './views/ControlView.vue';
import { useAuthStore } from './stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/register', component: RegisterView },
    { path: '/login', component: LoginView, meta: { guestOnly: true } },
    { path: '/control', component: ControlView, meta: { requiresAuth: true } },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.restore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) return { path: '/login', query: { redirect: to.fullPath } };
  if (to.meta.guestOnly && auth.isAuthenticated) return '/control';
});

export default router;
