import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.css';

const app = createApp(App);

app.use(router); // Usa el router en la aplicación
app.mount('#app'); // Monta la aplicación en el elemento con id "app"