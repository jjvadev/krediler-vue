import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Vue3GoogleMap from 'vue3-google-map';
import { auth } from './firebase';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.css';
import 'leaflet/dist/leaflet.css';
import { SpeedInsights } from "@vercel/speed-insights/vue"
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Configura Font Awesome
library.add(fas);

// Crea la aplicación Vue primero
const app = createApp(App);

// Configura los plugins
app.use(Vue3GoogleMap, {
  load: {
    key: 'AIzaSyCHjaOsz8qXxAyPWE2dyGO8FJl6lfsF210',
    libraries: 'places',
  },
});

app.use(store);
app.use(router);

// Registra el componente FontAwesomeIcon
app.component('font-awesome-icon', FontAwesomeIcon);

// Maneja el estado de autenticación
auth.onAuthStateChanged(user => {
  if (user) {
    store.dispatch('login', user);
  } else {
    store.dispatch('logout');
  }
});

// Monta la aplicación
app.mount('#app');