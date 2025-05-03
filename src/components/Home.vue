<template>
  <div class="container mt-5 text-center">
    <h1 class="display-4 fw-bold text-primary mb-4">Bienvenido al Sistema de Gestión</h1>
    <p class="lead text-secondary mb-4">
      Administra clientes, préstamos, rutas y verifica los atrasos de manera eficiente.
    </p>
    
    <!-- Tarjetas de Resumen -->
    <div class="row justify-content-center g-4 mb-5">
      <!-- Tarjeta para Clientes -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="card shadow-lg border-0 h-100">
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
        <div class="card shadow-lg border-0 h-100">
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
        <div class="card shadow-lg border-0 h-100">
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
        <div class="card shadow-lg border-0 h-100">
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
    
    <!-- Sección de Movimientos Recientes -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="card shadow-lg">
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Últimos Movimientos</h5>
            <button class="btn btn-light btn-sm" @click="fetchMovimientos">
              <i class="fas fa-sync-alt"></i> Actualizar
            </button>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th class="text-end">Monto</th>
                    <th>Método</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="movimiento in movimientos" :key="movimiento.id">
                    <td>{{ movimiento.Fecha }}</td>
                    <td>{{ movimiento.NombreCliente }}</td>
                    <td>
                      <span class="badge" :class="{
                        'bg-success': movimiento.TipoMovimiento === 'Abono',
                        'bg-warning text-dark': movimiento.TipoMovimiento !== 'Abono'
                      }">
                        {{ movimiento.TipoMovimiento }}
                      </span>
                    </td>
                    <td class="text-end fw-bold">{{ formatCurrency(movimiento.Monto) }}</td>
                    <td>{{ movimiento.MetodoPago }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="loadingMovimientos" class="text-center my-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
            </div>
            <div v-if="movimientos.length === 0 && !loadingMovimientos" class="alert alert-info text-center m-3">
              No hay movimientos recientes
            </div>
            <div class="text-center p-3 border-top">
              <router-link to="/movimientos" class="btn btn-outline-primary">
                Ver todos los movimientos
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase";
import { parse, isAfter } from "date-fns";

export default {
  name: "Home",
  data() {
    return {
      totalClientes: 0,
      prestamosActivos: 0,
      totalRutas: 0,
      prestamosAtrasados: 0,
      movimientos: [],
      loadingMovimientos: false
    };
  },
  async created() {
    await this.fetchTotalClientes();
    await this.fetchPrestamosActivos();
    await this.fetchTotalRutas();
    await this.fetchPrestamosAtrasados();
    await this.fetchMovimientos();
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
      try {
        const querySnapshot = await getDocs(collection(db, "Prestamos"));
        const hoy = new Date();
        
        // Filtrar préstamos atrasados activos
        this.prestamosAtrasados = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            let estaAtrasado = false;
            
            if (data.Proximo_Pago && data.Estado && data.Estado.toLowerCase() === "activo") {
              try {
                // Usar la misma lógica que en el componente Atrasados
                const fechaPago = parse(data.Proximo_Pago, 'dd/MM/yyyy', new Date());
                estaAtrasado = isAfter(hoy, fechaPago);
              } catch (error) {
                console.error("Error al procesar fecha:", error);
              }
            }
            
            return {
              id: doc.id,
              data: data,
              estaAtrasado: estaAtrasado
            };
          })
          .filter(p => p.estaAtrasado)
          .length;
      } catch (error) {
        console.error("Error al cargar préstamos atrasados:", error);
        this.prestamosAtrasados = 0;
      }
    },
    async fetchMovimientos() {
      try {
        this.loadingMovimientos = true;
        this.movimientos = [];
        
        const movimientosQuery = query(
          collection(db, "Movimientos"),
          orderBy("Timestamp", "desc"),
          limit(5)
        );
        
        const querySnapshot = await getDocs(movimientosQuery);
        this.movimientos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error("Error al cargar movimientos:", error);
      } finally {
        this.loadingMovimientos = false;
      }
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(value);
    }
  }
};
</script>

<style scoped>
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

.badge {
  font-size: 0.8rem;
  padding: 0.35em 0.65em;
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
  
  .table-responsive {
    font-size: 0.9rem;
  }
}
</style>