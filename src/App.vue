<template>
  <!-- Layout completo para rutas normales -->
  <div v-if="showLayout" id="app" class="app-container">
    <!-- Encabezado -->
    <header class="app-header">
      <nav class="navbar navbar-expand-lg">
        <div class="container-fluid">
          <div class="navbar-brand-container">
            <router-link to="/" class="navbar-brand">
              <svg class="logo-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M13 3V11H21V3H13M3 21H11V13H3V21M3 3V11H11V3H3M13 16H16V13H18V16H21V18H18V21H16V18H13V16Z" />
              </svg>
              <span class="brand-text">KREDILLER</span>
            </router-link>
          </div>
          
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <router-link to="/" class="nav-link" active-class="active">
                  <svg class="nav-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" />
                  </svg>
                  <span>Inicio</span>
                </router-link>
              </li>
              <li class="nav-item">
                <router-link to="/clientes" class="nav-link" active-class="active">
                  <svg class="nav-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 4C14.21 4 16 5.79 16 8C16 10.21 14.21 12 12 12C9.79 12 8 10.21 8 8C8 5.79 9.79 4 12 4M12 14C16.42 14 20 15.79 20 18V20H4V18C4 15.79 7.58 14 12 14Z" />
                  </svg>
                  <span>Clientes</span>
                </router-link>
              </li>
              <li class="nav-item">
                <router-link to="/movimientos" class="nav-link" active-class="active">
                  <svg class="nav-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M5 6H19V8H5V6M5 11H19V13H5V11M5 16H19V18H5V16Z" />
                  </svg>
                  <span>Movimientos</span>
                </router-link>
              </li>

              <li>
                <a class="dropdown-item" href="#" @click.prevent="logout">
                  <svg class="dropdown-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H5v16h9v-2h2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h9z" />
                  </svg>
                  Cerrar sesión
                </a>
              </li>
            </ul>
            
            <div class="user-menu" v-if="currentUser">
              <div class="dropdown">
                <button class="user-btn dropdown-toggle" data-bs-toggle="dropdown">
                  <div class="avatar">{{ getInitials(currentUser.nombre) }}</div>
                  <span class="user-name">{{ currentUser.nombre }}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" href="#">
                    <svg class="dropdown-icon" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12 4a4 4 0 014 4a4 4 0 01-4 4a4 4 0 01-4-4a4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z" />
                    </svg> 
                    Perfil
                  </a></li>
                  <li><a class="dropdown-item" href="#" @click.prevent="logout">
                    <svg class="dropdown-icon" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5a2 2 0 00-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
                    </svg> 
                    Cerrar sesión
                  </a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <!-- Contenido principal -->
    <main class="app-main">
      <div class="container-fluid">
        <div class="page-header">
          <h1 class="page-title">{{ currentRouteName }}</h1>
          <div class="breadcrumb">
            <router-link to="/">Inicio</router-link>
            <span class="breadcrumb-divider">/</span>
            <span>{{ currentRouteName }}</span>
          </div>
        </div>
        <router-view></router-view>
      </div>
    </main>

    <!-- Pie de página -->
    <footer class="app-footer">
      <div class="container-fluid">
        <div class="footer-content">
          <p class="copyright">© 2025 FinanzasPro. Todos los derechos reservados.</p>
          <div class="footer-links">
            <a href="#">Términos de servicio</a>
            <a href="#">Política de privacidad</a>
            <a href="#">Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
  
  <!-- Layout mínimo para login -->
  <div v-else id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { mapState } from 'vuex';

export default {
  name: "App",
  computed: {
    ...mapState(['currentUser']),
    currentRouteName() {
      return this.$route.name || 'Dashboard';
    },
    showLayout() {
      // Oculta el layout si la ruta tiene meta.hideLayout = true
      return !this.$route.meta?.hideLayout;
    }
  },
  methods: {
    getInitials(name) {
      if (!name) return '';
      const parts = name.split(' ');
      let initials = parts[0].charAt(0);
      if (parts.length > 1) {
        initials += parts[parts.length - 1].charAt(0);
      }
      return initials.toUpperCase();
    },
    async logout() {
      try {
        await signOut(auth);
        this.$store.commit('SET_CURRENT_USER', null);
        this.$router.push('/login');
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Ocurrió un error al cerrar sesión');
      }
    }
  }
};
</script>

<style scoped>
/* Variables de color */
:root {
  --primary-color: #4361ee;
  --primary-light: #eef2ff;
  --secondary-color: #3f37c9;
  --accent-color: #4cc9f0;
  --text-dark: #2b2d42;
  --text-medium: #4a4e69;
  --text-light: #8e9aaf;
  --bg-light: #f8f9fa;
  --bg-white: #ffffff;
  --border-color: #e9ecef;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --error-color: #f44336;
}

/* Estilos base */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-light);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Encabezado */
.app-header {
  background-color: var(--bg-white);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar {
  padding: 0.75rem 1rem;
}

.navbar-brand {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--primary-color);
  text-decoration: none;
  transition: all 0.2s;
}

.navbar-brand:hover {
  color: var(--secondary-color);
}

.logo-icon {
  width: 28px;
  height: 28px;
  margin-right: 10px;
}

.brand-text {
  margin-left: 8px;
}

.nav-item {
  margin: 0 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-medium);
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.nav-link.active {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.nav-link span {
  margin-left: 8px;
}

.nav-icon {
  width: 20px;
  height: 20px;
}

/* Menú de usuario */
.user-menu {
  margin-left: auto;
}

.user-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  color: var(--text-dark);
  cursor: pointer;
  transition: all 0.2s;
}

.user-btn:hover {
  color: var(--primary-color);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 8px;
}

.user-name {
  font-weight: 500;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 0.5rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  color: var(--text-medium);
  transition: all 0.2s;
}

.dropdown-item:hover {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.dropdown-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

/* Contenido principal */
.app-main {
  flex: 1;
  padding: 1.5rem 0;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  color: var(--text-light);
  font-size: 0.875rem;
}

.breadcrumb a {
  color: var(--primary-color);
  text-decoration: none;
  transition: all 0.2s;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.breadcrumb-divider {
  margin: 0 8px;
  color: var(--text-light);
}

/* Pie de página */
.app-footer {
  background-color: var(--bg-white);
  border-top: 1px solid var(--border-color);
  padding: 1.5rem 0;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.copyright {
  color: var(--text-light);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a {
  color: var(--text-medium);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.footer-links a:hover {
  color: var(--primary-color);
}

/* Responsive */
@media (min-width: 768px) {
  .footer-content {
    flex-direction: row;
  }
  
  .copyright {
    margin-bottom: 0;
  }
  
  .navbar {
    padding: 0.75rem 2rem;
  }
  
  .app-main {
    padding: 2rem;
  }
}

@media (max-width: 767px) {
  .nav-link span {
    display: none;
  }
  
  .user-name {
    display: none;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
}
</style>