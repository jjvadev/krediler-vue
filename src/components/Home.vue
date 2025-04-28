<template>
  <div class="container mt-5 text-center">
    <h1 class="display-4 fw-bold text-primary mb-4">Bienvenido al Sistema de Gestión</h1>
    <p class="lead text-secondary mb-4">
      Administra clientes, préstamos, rutas y verifica los atrasos de manera eficiente.
    </p>
    <div class="row justify-content-center g-4">
      <!-- Tarjeta para Clientes -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="card shadow-lg border-0">
          <div class="card-body text-center">
            <div class="icon-container bg-primary text-white rounded-circle mb-3">
              <i class="fas fa-users fa-2x"></i>
            </div>
            <h5 class="card-title text-primary">Clientes Registrados</h5>
            <p class="card-text display-6 fw-bold text-dark">{{ totalClientes }}</p>
            <router-link to="/clientes" class="btn btn-primary w-100">
              Gestionar Clientes
            </router-link>
          </div>
        </div>
      </div>
      <!-- Tarjeta para Préstamos Activos -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="card shadow-lg border-0">
          <div class="card-body text-center">
            <div class="icon-container bg-success text-white rounded-circle mb-3">
              <i class="fas fa-hand-holding-usd fa-2x"></i>
            </div>
            <h5 class="card-title text-success">Préstamos Activos</h5>
            <p class="card-text display-6 fw-bold text-dark">{{ prestamosActivos }}</p>
            <router-link to="/prestamos" class="btn btn-success w-100">
              Gestionar Préstamos
            </router-link>
          </div>
        </div>
      </div>
      <!-- Tarjeta para Rutas -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="card shadow-lg border-0">
          <div class="card-body text-center">
            <div class="icon-container bg-info text-white rounded-circle mb-3">
              <i class="fas fa-map-marked-alt fa-2x"></i>
            </div>
            <h5 class="card-title text-info">Rutas</h5>
            <p class="card-text display-6 fw-bold text-dark">{{ totalRutas }}</p>
            <router-link to="/rutas" class="btn btn-info w-100">
              Gestionar Rutas
            </router-link>
          </div>
        </div>
      </div>
      <!-- Tarjeta para Préstamos Atrasados -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="card shadow-lg border-0">
          <div class="card-body text-center">
            <div class="icon-container bg-danger text-white rounded-circle mb-3">
              <i class="fas fa-exclamation-triangle fa-2x"></i>
            </div>
            <h5 class="card-title text-danger">Préstamos Atrasados</h5>
            <p class="card-text display-6 fw-bold text-dark">{{ prestamosAtrasados }}</p>
            <router-link to="/atrasados" class="btn btn-danger w-100">
              Ver Atrasados
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { parseISO } from "date-fns";

export default {
  name: "Home",
  data() {
    return {
      totalClientes: 0,
      prestamosActivos: 0,
      totalRutas: 0,
      prestamosAtrasados: 0,
    };
  },
  async created() {
    await this.fetchTotalClientes();
    await this.fetchPrestamosActivos();
    await this.fetchTotalRutas();
    await this.fetchPrestamosAtrasados();
  },
  methods: {
    async fetchTotalClientes() {
      const querySnapshot = await getDocs(collection(db, "Clientes"));
      this.totalClientes = querySnapshot.size;
    },
    async fetchPrestamosActivos() {
      const prestamosQuery = query(
        collection(db, "Prestamos"),
        where("Estado", "==", "Activo")
      );
      const querySnapshot = await getDocs(prestamosQuery);
      this.prestamosActivos = querySnapshot.size;
    },
    async fetchTotalRutas() {
      const querySnapshot = await getDocs(collection(db, "Rutas"));
      this.totalRutas = querySnapshot.size;
    },
    async fetchPrestamosAtrasados() {
      const querySnapshot = await getDocs(collection(db, "Prestamos"));
      const prestamos = querySnapshot.docs.map((doc) => doc.data());
      const fechaActual = new Date();
      this.prestamosAtrasados = prestamos.filter((prestamo) => {
        const proximoPagoStr = prestamo.Proximo_Pago;
        if (!proximoPagoStr) return false;
        const proximoPago = parseISO(proximoPagoStr);
        return fechaActual > proximoPago;
      }).length;
    },
  },
};
</script>

<style scoped>
/* Estilo adicional para personalizar el diseño */
.container {
  max-width: 1200px;
}

h1 {
  font-size: 2.5rem;
}

p {
  font-size: 1.2rem;
}

.card {
  border-radius: 15px;
}

.icon-container {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.card-title {
  font-size: 1.3rem;
}

.card-text {
  font-size: 2rem;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }

  p {
    font-size: 1rem;
  }

  .card-title {
    font-size: 1.2rem;
  }

  .card-text {
    font-size: 1.5rem;
  }
}
</style>