<template>
    <div class="movimientos-container">
      <!-- Header con título y acciones -->
      <div class="header-container">
        <h1 class="page-title">Gestión de Movimientos</h1>
        <div class="action-buttons">
          <button class="btn-refresh" @click="refreshMovimientos" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            <span class="btn-text">Actualizar</span>
          </button>
        </div>
      </div>
  
      <!-- Filtros rápidos -->
      <div class="filters-container">
        <div class="filter-group">
          <label for="filter-type">Tipo:</label>
          <select id="filter-type" v-model="filters.tipo" class="form-select">
            <option value="">Todos</option>
            <option value="Abono">Abonos</option>
            <option value="Desembolso">Desembolsos</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-method">Método:</label>
          <select id="filter-method" v-model="filters.metodo" class="form-select">
            <option value="">Todos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="search">Buscar:</label>
          <input 
            id="search" 
            type="text" 
            v-model="filters.search" 
            placeholder="Cliente, cédula..." 
            class="form-control"
          >
        </div>
      </div>
  
      <!-- Tarjeta de resumen -->
      <div class="summary-cards">
        <div class="summary-card total">
          <div class="icon">
            <i class="fas fa-list-alt"></i>
          </div>
          <div class="info">
            <div class="label">Total Movimientos</div>
            <div class="value">{{ filteredMovimientos.length }}</div>
          </div>
        </div>
        <div class="summary-card income">
          <div class="icon">
            <i class="fas fa-hand-holding-usd"></i>
          </div>
          <div class="info">
            <div class="label">Total Abonos</div>
            <div class="value">{{ formatCurrency(totalAbonos) }}</div>
          </div>
        </div>
      </div>
  
      <!-- Tabla de movimientos -->
      <div class="card table-card">
        <div class="table-responsive">
          <table class="movimientos-table">
            <thead>
              <tr>
                <th @click="sortBy('Fecha')" class="sortable">
                  Fecha
                  <i class="fas" :class="sortIcon('Fecha')"></i>
                </th>
                <th>Cliente</th>
                <th @click="sortBy('Monto')" class="sortable">
                  Monto
                  <i class="fas" :class="sortIcon('Monto')"></i>
                </th>
                <th>Tipo</th>
                <th>Método</th>
                <th>Ubicación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="movimiento in paginatedMovimientos" :key="movimiento.id">
                <td>{{ formatDate(movimiento.Fecha) }}</td>
                <td>
                  <div class="client-info">
                    <div class="client-name">{{ movimiento.NombreCliente }}</div>
                    <div class="client-id">{{ movimiento.CedulaCliente }}</div>
                  </div>
                </td>
                <td :class="{
                  'text-success': movimiento.TipoMovimiento === 'Abono',
                  'text-warning': movimiento.TipoMovimiento === 'Desembolso'
                }">
                  {{ formatCurrency(movimiento.Monto) }}
                </td>
                <td>
                  <span class="badge" :class="{
                    'badge-success': movimiento.TipoMovimiento === 'Abono',
                    'badge-warning': movimiento.TipoMovimiento === 'Desembolso'
                  }">
                    {{ movimiento.TipoMovimiento }}
                    <span v-if="movimiento.TipoAbono">({{ movimiento.TipoAbono }})</span>
                  </span>
                </td>
                <td>{{ movimiento.MetodoPago }}</td>
                <td>
                  <button 
                    v-if="movimiento.Ubicacion" 
                    @click="showMap(movimiento.Ubicacion)"
                    class="btn-map"
                  >
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Ver ubicación</span>
                  </button>
                  <span v-else class="no-location">No registrada</span>
                </td>
                <td>
                  <button class="btn-action" @click="showDetails(movimiento)">
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Estado de carga -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando movimientos...</p>
        </div>
  
        <!-- Sin resultados -->
        <div v-if="!loading && filteredMovimientos.length === 0" class="empty-state">
          <i class="fas fa-file-alt"></i>
          <p>No se encontraron movimientos</p>
        </div>
  
        <!-- Paginación -->
        <div v-if="filteredMovimientos.length > 0" class="pagination-container">
          <div class="pagination-info">
            Mostrando {{ pagination.start }}-{{ pagination.end }} de {{ filteredMovimientos.length }}
          </div>
          <div class="pagination-controls">
            <button 
              @click="prevPage" 
              :disabled="pagination.currentPage === 1"
              class="pagination-btn"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <span class="page-indicator">
              Página {{ pagination.currentPage }} de {{ totalPages }}
            </span>
            <button 
              @click="nextPage" 
              :disabled="pagination.currentPage === totalPages"
              class="pagination-btn"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
  
      <!-- Modal de detalles -->
      <div v-if="selectedMovimiento" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Detalles del Movimiento</h3>
            <button @click="closeModal" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="detail-row">
              <span class="detail-label">Fecha:</span>
              <span class="detail-value">{{ formatDate(selectedMovimiento.Fecha) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Cliente:</span>
              <span class="detail-value">{{ selectedMovimiento.NombreCliente }} ({{ selectedMovimiento.CedulaCliente }})</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Tipo:</span>
              <span class="badge" :class="{
                'badge-success': selectedMovimiento.TipoMovimiento === 'Abono',
                'badge-warning': selectedMovimiento.TipoMovimiento === 'Desembolso'
              }">
                {{ selectedMovimiento.TipoMovimiento }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Concepto:</span>
              <span class="detail-value">{{ selectedMovimiento.TipoAbono || 'N/A' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Método de pago:</span>
              <span class="detail-value">{{ selectedMovimiento.MetodoPago }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Monto:</span>
              <span class="detail-value amount">{{ formatCurrency(selectedMovimiento.Monto) }}</span>
            </div>
            <div v-if="selectedMovimiento.Ubicacion" class="detail-row map-row">
                <span class="detail-label">Ubicación:</span>
                <div class="map-preview">
                    <img 
                    :src="`https://maps.googleapis.com/maps/api/staticmap?center=${selectedMovimiento.Ubicacion[0]},${selectedMovimiento.Ubicacion[1]}&zoom=15&size=300x150&maptype=roadmap&markers=color:red%7C${selectedMovimiento.Ubicacion[0]},${selectedMovimiento.Ubicacion[1]}&key=TU_API_KEY`" 
                    alt="Ubicación"
                    @click="openMaps(selectedMovimiento.Ubicacion)"
                    class="clickable-map"
                    >
                    <small class="coordinates">
                    {{ selectedMovimiento.Ubicacion[0] }}, {{ selectedMovimiento.Ubicacion[1] }}
                    </small>
                </div>
                </div>

          </div>
          <div class="modal-footer">
            <button @click="closeModal" class="btn-close-modal">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { collection, getDocs, query, orderBy } from "firebase/firestore";
  import { db } from "@/firebase";
  import { GoogleMap, GoogleMarker } from "vue3-google-map";

  
  export default {
    name: "Movimientos",
    data() {
      return {
        movimientos: [],
        loading: false,
        selectedMovimiento: null,
        filters: {
          tipo: "",
          metodo: "",
          search: ""
        },
        sortField: "Fecha",
        sortDirection: "desc",
        pagination: {
          currentPage: 1,
          itemsPerPage: 10
        }
      };
    },
    components: {
  GoogleMap,
  GoogleMarker
},

    computed: {
      filteredMovimientos() {
        let filtered = this.movimientos;
  
        if (this.filters.tipo) {
          filtered = filtered.filter(m => m.TipoMovimiento === this.filters.tipo);
        }
  
        if (this.filters.metodo) {
          filtered = filtered.filter(m => m.MetodoPago === this.filters.metodo);
        }
  
        if (this.filters.search) {
          const searchTerm = this.filters.search.toLowerCase();
          filtered = filtered.filter(m => 
            m.NombreCliente.toLowerCase().includes(searchTerm) || 
            m.CedulaCliente.includes(searchTerm)
          );
        }
  
        // Ordenamiento
        filtered.sort((a, b) => {
          const fieldA = a[this.sortField];
          const fieldB = b[this.sortField];
  
          if (fieldA < fieldB) return this.sortDirection === "asc" ? -1 : 1;
          if (fieldA > fieldB) return this.sortDirection === "asc" ? 1 : -1;
          return 0;
        });
  
        return filtered;
      },
      paginatedMovimientos() {
        const start = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
        const end = start + this.pagination.itemsPerPage;
        return this.filteredMovimientos.slice(start, end);
      },
      totalPages() {
        return Math.ceil(this.filteredMovimientos.length / this.pagination.itemsPerPage);
      },
      totalAbonos() {
        return this.filteredMovimientos
          .filter(m => m.TipoMovimiento === "Abono")
          .reduce((sum, m) => sum + m.Monto, 0);
      },
      pagination() {
        return {
          start: (this.pagination.currentPage - 1) * this.pagination.itemsPerPage + 1,
          end: Math.min(
            this.pagination.currentPage * this.pagination.itemsPerPage,
            this.filteredMovimientos.length
          ),
          currentPage: this.pagination.currentPage
        };
      }
    },
    async created() {
      await this.fetchMovimientos();
    },
    methods: {
      async fetchMovimientos() {
        try {
          this.loading = true;
          const q = query(collection(db, "Movimientos"), orderBy("Timestamp", "desc"));
          const querySnapshot = await getDocs(q);
          
          this.movimientos = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        } catch (error) {
          console.error("Error al cargar movimientos:", error);
        } finally {
          this.loading = false;
        }
      },
      async refreshMovimientos() {
        this.pagination.currentPage = 1;
        await this.fetchMovimientos();
      },
      formatCurrency(value) {
        return new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0
        }).format(value);
      },
      formatDate(dateString) {
        if (!dateString) return "N/A";
        const options = { day: "2-digit", month: "2-digit", year: "numeric" };
        return new Date(dateString).toLocaleDateString("es-CO", options);
      },
      sortBy(field) {
        if (this.sortField === field) {
          this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
        } else {
          this.sortField = field;
          this.sortDirection = "asc";
        }
      },
      sortIcon(field) {
        if (this.sortField !== field) return "fa-sort";
        return this.sortDirection === "asc" ? "fa-sort-up" : "fa-sort-down";
      },
      nextPage() {
        if (this.pagination.currentPage < this.totalPages) {
          this.pagination.currentPage++;
        }
      },
      prevPage() {
        if (this.pagination.currentPage > 1) {
          this.pagination.currentPage--;
        }
      },
      showDetails(movimiento) {
        this.selectedMovimiento = movimiento;
      },
      closeModal() {
        this.selectedMovimiento = null;
      },
      showMap(coords) {
        window.open(`https://www.google.com/maps?q=${coords[0]},${coords[1]}`, "_blank");
      },
      openMaps(coords) {
        window.open(`https://www.google.com/maps?q=${coords[0]},${coords[1]}`, "_blank");
      }
    }

  };
  </script>
  
  <style scoped>
  .movimientos-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .page-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: #2c3e50;
  }
  
  .action-buttons {
    display: flex;
    gap: 1rem;
  }
  
  .btn-refresh {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background-color 0.2s;
  }
  
  .btn-refresh:hover {
    background-color: #2980b9;
  }
  
  .btn-refresh:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
  
  .btn-text {
    font-size: 0.9rem;
  }
  
  .filters-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }
  
  .filter-group {
    flex: 1;
    min-width: 200px;
  }
  
  .filter-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #34495e;
  }
  
  .form-select,
  .form-control {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    background-color: white;
  }
  
  .summary-cards {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .summary-card {
    flex: 1;
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 1rem;
    color: white;
  }
  
  .summary-card.total {
    background-color: #3498db;
  }
  
  .summary-card.income {
    background-color: #2ecc71;
  }
  
  .summary-card .icon {
    font-size: 1.5rem;
  }
  
  .summary-card .label {
    font-size: 0.9rem;
    opacity: 0.9;
  }
  .map-interactive {
  margin-top: 0.5rem;
  width: 100%;
}

  
  .summary-card .value {
    font-size: 1.3rem;
    font-weight: 600;
  }
  
  .table-card {
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .movimientos-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .movimientos-table th,
  .movimientos-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  .movimientos-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #34495e;
    position: sticky;
    top: 0;
  }
  
  .movimientos-table tr:hover {
    background-color: #f8f9fa;
  }
  
  .sortable {
    cursor: pointer;
    user-select: none;
  }
  
  .sortable:hover {
    background-color: #f1f1f1;
  }
  
  .badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .badge-success {
    background-color: #d4edda;
    color: #155724;
  }
  
  .badge-warning {
    background-color: #fff3cd;
    color: #856404;
  }
  
  .client-info {
    display: flex;
    flex-direction: column;
  }
  
  .client-name {
    font-weight: 500;
  }
  
  .client-id {
    font-size: 0.8rem;
    color: #7f8c8d;
  }
  
  .text-success {
    color: #28a745;
  }
  
  .text-warning {
    color: #ffc107;
  }
  
  .btn-map {
    background: none;
    border: none;
    color: #e74c3c;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.9rem;
  }
  
  .btn-map:hover {
    text-decoration: underline;
  }
  
  .no-location {
    color: #95a5a6;
    font-style: italic;
  }
  
  .btn-action {
    background: none;
    border: none;
    color: #3498db;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .btn-action:hover {
    color: #2980b9;
  }
  
  .loading-state {
    padding: 2rem;
    text-align: center;
  }
  
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #3498db;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .empty-state {
    padding: 3rem;
    text-align: center;
    color: #95a5a6;
  }
  
  .empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  .pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-top: 1px solid #eee;
  }
  
  .pagination-info {
    color: #7f8c8d;
    font-size: 0.9rem;
  }
  
  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .pagination-btn {
    background: none;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
  }
  
  .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .page-indicator {
    font-size: 0.9rem;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  .modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header h3 {
    margin: 0;
    color: #2c3e50;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #7f8c8d;
    cursor: pointer;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .detail-row {
    display: flex;
    margin-bottom: 1rem;
  }
  
  .detail-label {
    flex: 0 0 120px;
    font-weight: 500;
    color: #34495e;
  }
  
  .detail-value {
    flex: 1;
  }
  
  .amount {
    font-weight: 600;
    font-size: 1.1rem;
  }
  
  .map-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .map-preview {
    margin-top: 0.5rem;
    width: 100%;
  }
  
  .clickable-map {
    cursor: pointer;
    border-radius: 6px;
    border: 1px solid #ddd;
    width: 100%;
    height: auto;
  }
  
  .coordinates {
    display: block;
    margin-top: 0.25rem;
    color: #7f8c8d;
    font-size: 0.8rem;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #eee;
    text-align: right;
  }
  
  .btn-close-modal {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
  }
  
  .btn-close-modal:hover {
    background-color: #2980b9;
  }
  
  @media (max-width: 768px) {
    .header-container {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .filters-container {
      flex-direction: column;
    }
    
    .summary-cards {
      flex-direction: column;
    }
    
    .movimientos-table {
      font-size: 0.9rem;
    }
    
    .movimientos-table th,
    .movimientos-table td {
      padding: 0.75rem;
    }
    
    .pagination-container {
      flex-direction: column;
      gap: 1rem;
    }
  }
  </style>