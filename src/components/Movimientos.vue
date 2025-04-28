<template>
    <div class="container mt-5">
      <h1 class="display-4 fw-bold text-primary text-center mb-4">Movimientos</h1>
      
      <div class="card shadow-lg">
        <div class="card-header bg-primary text-white">
          <div class="row align-items-center">
            <div class="col-md-6">
              <h5 class="mb-0">Historial de Transacciones</h5>
            </div>
            <div class="col-md-6 text-end">
              <button class="btn btn-light btn-sm" @click="refreshMovimientos">
                <i class="fas fa-sync-alt"></i> Actualizar
              </button>
            </div>
          </div>
        </div>
        
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover table-striped">
              <thead class="table-light">
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Cédula</th>
                  <th>Tipo</th>
                  <th>Concepto</th>
                  <th>Método</th>
                  <th class="text-end">Monto</th>
                  <th>Ubicación</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="movimiento in movimientos" :key="movimiento.id">
                  <td>{{ movimiento.Fecha }}</td>
                  <td>{{ movimiento.NombreCliente }}</td>
                  <td>{{ movimiento.CedulaCliente }}</td>
                  <td>
                    <span class="badge" :class="{
                      'bg-success': movimiento.TipoMovimiento === 'Abono',
                      'bg-warning text-dark': movimiento.TipoMovimiento === 'Desembolso'
                    }">
                      {{ movimiento.TipoMovimiento }}
                    </span>
                  </td>
                  <td>{{ movimiento.TipoAbono }}</td>
                  <td>{{ movimiento.MetodoPago }}</td>
                  <td class="text-end">{{ formatCurrency(movimiento.Monto) }}</td>
                  <td>
                    <a v-if="movimiento.Ubicacion" 
                       :href="`https://maps.google.com/?q=${movimiento.Ubicacion[0]},${movimiento.Ubicacion[1]}`" 
                       target="_blank" 
                       class="text-decoration-none">
                      <i class="fas fa-map-marker-alt text-danger"></i> Ver mapa
                    </a>
                    <span v-else class="text-muted">Sin ubicación</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-if="loading" class="text-center my-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>
          
          <div v-if="movimientos.length === 0 && !loading" class="alert alert-info text-center">
            No se encontraron movimientos registrados
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { collection, getDocs, orderBy, query } from "firebase/firestore";
  import { db } from "@/firebase";
  
  export default {
    name: "Movimientos",
    data() {
      return {
        movimientos: [],
        loading: false
      };
    },
    async created() {
      await this.fetchMovimientos();
    },
    methods: {
      async fetchMovimientos() {
        try {
          this.loading = true;
          this.movimientos = [];
          
          const q = query(collection(db, "Movimientos"), orderBy("Timestamp", "desc"));
          const querySnapshot = await getDocs(q);
          
          this.movimientos = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data
            };
          });
        } catch (error) {
          console.error("Error al cargar movimientos:", error);
        } finally {
          this.loading = false;
        }
      },
      async refreshMovimientos() {
        await this.fetchMovimientos();
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
  .card {
    border-radius: 10px;
    overflow: hidden;
  }
  
  .table th {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.85rem;
  }
  
  .badge {
    font-size: 0.8rem;
    padding: 0.35em 0.65em;
  }
  
  @media (max-width: 768px) {
    .table-responsive {
      font-size: 0.9rem;
    }
    
    .table th, .table td {
      padding: 0.5rem;
    }
  }
  </style>