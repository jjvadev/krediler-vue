import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/components/Home.vue'; // Ajustado a la ubicación correcta
import Login from '@/components/Login.vue';
import { auth } from '@/firebase';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: () => import('@/components/Clientes.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/prestamos',
    name: 'Prestamos',
    component: () => import('@/components/Prestamos.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rutas',
    name: 'Rutas',
    component: () => import('@/components/Rutas.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/atrasados',
    name: 'Atrasados',
    component: () => import('@/components/Atrasados.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = auth.currentUser;
  
  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;