import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Clientes from '../components/Clientes.vue';
import Prestamos from '@/components/Prestamos.vue';
import Rutas from '@/components/Rutas.vue';
import Atrasados from '@/components/Atrasados.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/clientes', component: Clientes },
  { path: '/prestamos', component: Prestamos},
  { path: '/rutas' , component: Rutas},
  { path: '/atrasados' , component: Atrasados},
];

const router = createRouter({
  history: createWebHistory(), // Usa el historial del navegador
  routes,
});

export default router;