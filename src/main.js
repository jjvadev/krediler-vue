import { createApp } from 'vue';
import App from './App.vue';
import Vue3GoogleMap from 'vue3-google-map'
import router from './router';
import 'bootstrap/dist/css/bootstrap.css';
import "leaflet/dist/leaflet.css";

const app = createApp(App);

app.use(Vue3GoogleMap, {
    load: {
      key: 'AIzaSyCHjaOsz8qXxAyPWE2dyGO8FJl6lfsF210',
      libraries: 'places',
    },
  })

app.use(router); // Usa el router en la aplicación
app.mount('#app'); // Monta la aplicación en el elemento con id "app"