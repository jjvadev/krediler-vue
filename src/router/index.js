import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/components/Home.vue';
import Login from '@/components/Login.vue';
import { auth } from '@/firebase';
import store from '@/store';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true, title: 'Inicio' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      requiresAuth: false, 
      layout: 'empty',  // Usará EmptyLayout
      title: 'Iniciar sesión' 
    }
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: () => import('@/components/Clientes.vue'),
    meta: { requiresAuth: true, title: 'Clientes' }
  },
  {
    path: '/clientes/nuevo',
    name: 'NuevoCliente',
    component: () => import('@/components/NuevoCliente.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/clientes/ver/:id',
    name: 'VerCliente',
    component: () => import('@/components/VerCliente.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/clientes/editar/:id',
    name: 'EditarCliente',
    component: () => import('@/components/EditarCliente.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/prestamos',
    name: 'Prestamos',
    component: () => import('@/components/Prestamos.vue'),
    meta: { requiresAuth: true, title: 'Préstamos' }
  },
  {
    path: '/rutas',
    name: 'Rutas',
    component: () => import('@/components/Rutas.vue'),
    meta: { requiresAuth: true, title: 'Rutas' }
  },
  {
    path: '/atrasados',
    name: 'Atrasados',
    component: () => import('@/components/Atrasados.vue'),
    meta: { requiresAuth: true, title: 'Préstamos atrasados' }
  },
  {
    path: '/movimientos',
    name: 'Movimientos',
    component: () => import('@/components/Movimientos.vue'),
    meta: { requiresAuth: true, title: 'Movimientos' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  // Verificar autenticación con Firebase
  await store.dispatch('auth/checkAuth');
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = store.getters['auth/isAuthenticated'];
  
  // Actualizar título de la página
  document.title = to.meta.title ? `${to.meta.title} | TuApp` : 'TuApp';
  
  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;