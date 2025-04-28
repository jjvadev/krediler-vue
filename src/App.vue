<template>
  <div id="app">
    <!-- Encabezado -->
    <header>
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
          <a class="navbar-brand" href="#">Mi Dashboard</a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <router-link to="/" class="nav-link" active-class="active">Inicio</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/clientes" class="nav-link" active-class="active">Clientes</router-link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>

    <!-- Contenido principal -->
    <main class="container my-5">
      <router-view></router-view>
    </main>

    <!-- Pie de página -->
    <footer class="bg-light text-center py-3">
      <p class="mb-0">© 2025 Mi Dashboard. Todos los derechos reservados.</p>
    </footer>
  </div>
</template>

<script>

export default {
  name: "App",
};
</script>

<style>
/* Estilos personalizados */
body {
  font-family: 'Arial', sans-serif;
  background-color: #f8f9fa;
  margin: 0;
  padding: 0;
}

header {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

main {
  min-height: 70vh;
}

footer {
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}
</style>