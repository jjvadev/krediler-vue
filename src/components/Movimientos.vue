<template>
  <div class="movimientos-container">
    <div class="header-section">
      <h2 class="page-title">Historial de Movimientos</h2>
      <div class="header-actions">
        <div class="search-box">
          <i class="search-icon">🔍</i>
          <input v-model="searchQuery" type="text" placeholder="Buscar movimientos..." class="search-input">
        </div>
        <div class="filter-dropdown">
          <select v-model="filterType" class="filter-select">
            <option value="">Todos los tipos</option>
            <option value="Pago Cuota">Pago Cuota</option>
            <option value="Abono">Abono</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="summary-cards">
      <div class="summary-card income">
        <div class="card-icon">💰</div>
        <div class="card-content">
          <span class="card-label">Ingresos</span>
          <span class="card-value">{{ formatCurrency(totalIncome) }}</span>
        </div>
      </div>
      <div class="summary-card expenses">
        <div class="card-icon">💸</div>
        <div class="card-content">
          <span class="card-label">Egresos</span>
          <span class="card-value">{{ formatCurrency(totalExpenses) }}</span>
        </div>
      </div>
      <div class="summary-card balance">
        <div class="card-icon">🏦</div>
        <div class="card-content">
          <span class="card-label">Balance</span>
          <span class="card-value">{{ formatCurrency(totalBalance) }}</span>
        </div>
      </div>
    </div>
    
    <div class="table-container">
      <table class="movimientos-table">
        <thead>
          <tr>
            <th class="date-col">Fecha</th>
            <th class="client-col">Cliente</th>
            <th class="type-col">Tipo</th>
            <th class="method-col">Método</th>
            <th class="amount-col">Monto</th>
            <th class="actions-col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(movimiento, index) in filteredMovimientos" :key="movimiento.id" 
              :class="{'even-row': index % 2 === 0, 'odd-row': index % 2 !== 0}">
            <td>
              <div class="date-cell">
                <span class="date-day">{{ getDay(movimiento.Fecha) }}</span>
                <span class="date-month">{{ getMonth(movimiento.Fecha) }}</span>
              </div>
            </td>
            <td>
              <div class="client-cell">
                <span class="client-name">{{ movimiento.NombreCliente || 'N/A' }}</span>
                <span class="client-id">ID: {{ movimiento.id?.slice(0, 8) || 'N/A' }}</span>
              </div>
            </td>
            <td>
              <span class="type-badge" :class="getTypeClass(movimiento.TipoMovimiento)">
                {{ movimiento.TipoMovimiento || 'N/A' }}
              </span>
            </td>
            <td>
              <span class="method-badge">
                {{ movimiento.MetodoPago || 'N/A' }}
              </span>
            </td>
            <td :class="{'positive-amount': movimiento.Monto >= 0, 'negative-amount': movimiento.Monto < 0}">
              {{ formatCurrency(movimiento.Monto) }}
            </td>
            <td>
              <button @click="verMapa(movimiento)" class="btn-mapa" :disabled="!movimiento.Ubicacion">
                <i class="map-icon">🗺️</i> Mapa
              </button>
              <button class="btn-details" @click="showDetails(movimiento)">
                <i class="details-icon">📄</i> Detalles
              </button>
            </td>
          </tr>
          <tr v-if="filteredMovimientos.length === 0">
            <td colspan="6" class="no-results">
              No se encontraron movimientos
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="pagination-controls">
      <button class="pagination-btn prev-btn" @click="prevPage" :disabled="currentPage === 1">Anterior</button>
      <span class="page-indicator">Página {{ currentPage }} de {{ totalPages }}</span>
      <button class="pagination-btn next-btn" @click="nextPage" :disabled="currentPage === totalPages">Siguiente</button>
    </div>
    
    <!-- Modal para mostrar el mapa -->
    <div v-if="showMapModal" class="map-modal">
      <div class="map-modal-content">
        <div class="modal-header">
          <h3>Ubicación del Movimiento</h3>
          <button class="close-btn" @click="closeModal">
            <i class="close-icon">✕</i>
          </button>
        </div>
        <div class="modal-body">
          <div class="movement-info">
            <div class="info-item">
              <span class="info-label">Cliente:</span>
              <span class="info-value">{{ selectedMovimiento?.NombreCliente || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha:</span>
              <span class="info-value">{{ formatDate(selectedMovimiento?.Fecha) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Tipo:</span>
              <span class="info-value">{{ selectedMovimiento?.TipoMovimiento || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Monto:</span>
              <span class="info-value">{{ formatCurrency(selectedMovimiento?.Monto || 0) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Coordenadas:</span>
              <span class="info-value">{{ formatCoordinates(selectedLocation) }}</span>
            </div>
          </div>
          <div id="map" class="map-container"></div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn close-modal-btn" @click="closeModal">Cerrar</button>
          <button class="modal-btn directions-btn" @click="openDirections" :disabled="!selectedLocation">Cómo llegar</button>
        </div>
      </div>
    </div>
    
    <!-- Modal de detalles -->
    <div v-if="showDetailsModal" class="details-modal">
      <div class="details-modal-content">
        <div class="modal-header">
          <h3>Detalles del Movimiento</h3>
          <button class="close-btn" @click="closeDetailsModal">
            <i class="close-icon">✕</i>
          </button>
        </div>
        <div class="modal-body">
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">ID:</span>
              <span class="detail-value">{{ selectedMovimiento?.id || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Fecha:</span>
              <span class="detail-value">{{ formatDate(selectedMovimiento?.Fecha) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Cliente:</span>
              <span class="detail-value">{{ selectedMovimiento?.NombreCliente || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Tipo:</span>
              <span class="detail-value">{{ selectedMovimiento?.TipoMovimiento || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Método de Pago:</span>
              <span class="detail-value">{{ selectedMovimiento?.MetodoPago || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Monto:</span>
              <span class="detail-value">{{ formatCurrency(selectedMovimiento?.Monto || 0) }}</span>
            </div>
            <div class="detail-item full-width" v-if="selectedMovimiento?.Notas">
              <span class="detail-label">Notas:</span>
              <span class="detail-value">{{ selectedMovimiento.Notas }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn close-modal-btn" @click="closeDetailsModal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  name: 'Movimientos',
  setup() {
    const movimientos = ref([]);
    const showMapModal = ref(false);
    const showDetailsModal = ref(false);
    const selectedLocation = ref(null);
    const selectedMovimiento = ref(null);
    const searchQuery = ref('');
    const filterType = ref('');
    const currentPage = ref(1);
    const itemsPerPage = 10;
    let map = null;
    let marker = null;
    
    // Cargar movimientos desde Firestore
    const loadMovimientos = async () => {
      try {
        const movimientosCollection = collection(db, 'Movimientos');
        const movimientosSnapshot = await getDocs(movimientosCollection);
        movimientos.value = movimientosSnapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() };
        });
        console.log("Movimientos cargados:", movimientos.value);
      } catch (error) {
        console.error('Error al cargar movimientos:', error);
      }
    };
    
    // Filtros y búsqueda
    const filteredMovimientos = computed(() => {
      let filtered = movimientos.value;
      
      // Filtrar por tipo
      if (filterType.value) {
        filtered = filtered.filter(m => m.TipoMovimiento === filterType.value);
      }
      
      // Filtrar por búsqueda
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(m => 
          (m.NombreCliente?.toLowerCase().includes(query)) ||
          (m.TipoMovimiento?.toLowerCase().includes(query)) ||
          (m.MetodoPago?.toLowerCase().includes(query)) ||
          (m.id?.toLowerCase().includes(query))
        );
      }
      
      // Paginación
      const start = (currentPage.value - 1) * itemsPerPage;
      return filtered.slice(start, start + itemsPerPage);
    });
    
    // Totales calculados
    const totalIncome = computed(() => {
      return movimientos.value
        .filter(m => m.Monto > 0)
        .reduce((sum, m) => sum + (m.Monto || 0), 0);
    });
    
    const totalExpenses = computed(() => {
      return movimientos.value
        .filter(m => m.Monto < 0)
        .reduce((sum, m) => sum + (m.Monto || 0), 0);
    });
    
    const totalBalance = computed(() => totalIncome.value + totalExpenses.value);
    
    const totalPages = computed(() => {
      const filteredLength = movimientos.value.filter(m => 
        (!filterType.value || m.TipoMovimiento === filterType.value) &&
        (!searchQuery.value || 
          m.NombreCliente?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          m.TipoMovimiento?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          m.MetodoPago?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          m.id?.toLowerCase().includes(searchQuery.value.toLowerCase()))
      ).length;
      return Math.ceil(filteredLength / itemsPerPage);
    });
    
    // Formateadores
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date) 
        ? date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
        : dateString;
    };
    
    const formatCurrency = (amount) => {
      if (amount === undefined || amount === null) return '$0';
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(amount);
    };
    
    const formatCoordinates = (location) => {
      if (!location) return 'N/A';
      const lat = Math.abs(location.lat).toFixed(6);
      const lng = Math.abs(location.lng).toFixed(6);
      const latDir = location.lat >= 0 ? 'N' : 'S';
      const lngDir = location.lng >= 0 ? 'E' : 'W';
      return `${lat}° ${latDir}, ${lng}° ${lngDir}`;
    };
    
    // Funciones de fecha
    const getDay = (dateString) => {
      if (!dateString) return '--';
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date) 
        ? date.getDate().toString().padStart(2, '0') 
        : '--';
    };
    
    const getMonth = (dateString) => {
      if (!dateString) return '---';
      const date = new Date(dateString);
      if (!(date instanceof Date) || isNaN(date)) return '---';
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return months[date.getMonth()];
    };
    
    // Clases para tipos
    const getTypeClass = (type) => {
      if (!type) return '';
      const typeClasses = {
        'Préstamo': 'loan-type',
        'Pago': 'payment-type',
        'Abono': 'credit-type',
        'Retiro': 'withdrawal-type',
        'Depósito': 'deposit-type'
      };
      return typeClasses[type] || '';
    };
    
    // Mapa
    const verMapa = (movimiento) => {
      selectedMovimiento.value = movimiento;
      
      if (movimiento.Ubicacion) {
        try {
          const coords = extractCoordinates(movimiento.Ubicacion);
          
          if (coords) {
            selectedLocation.value = coords;
            showMapModal.value = true;
            
            // Inicializar el mapa después de que el modal esté visible
            setTimeout(() => {
              initLeafletMap();
            }, 100);
          } else {
            alert('No se pudieron extraer las coordenadas correctamente');
          }
        } catch (error) {
          console.error('Error al procesar ubicación:', error);
          alert('Error al procesar la ubicación: ' + error.message);
        }
      } else {
        alert('No hay ubicación disponible para este movimiento');
      }
    };
    
    const extractCoordinates = (ubicacion) => {
      console.log("Extrayendo coordenadas de:", ubicacion);
      
      // Caso 1: Es un objeto con propiedades lat/lng o latitude/longitude
      if (typeof ubicacion === 'object' && ubicacion !== null) {
        // GeoPoint de Firestore
        if (ubicacion.latitude !== undefined && ubicacion.longitude !== undefined) {
          return {
            lat: ubicacion.latitude,
            lng: ubicacion.longitude
          };
        }
        
        // Objeto con lat/lng
        if (ubicacion.lat !== undefined && ubicacion.lng !== undefined) {
          return {
            lat: ubicacion.lat,
            lng: ubicacion.lng
          };
        }
        
        // Objeto con _lat/_long (formato interno de Firestore)
        if (ubicacion._lat !== undefined && ubicacion._long !== undefined) {
          return {
            lat: ubicacion._lat,
            lng: ubicacion._long
          };
        }
        
        // Si es un objeto pero no tiene las propiedades esperadas, convertirlo a string
        ubicacion = JSON.stringify(ubicacion);
      }
      
      // Caso 2: Es una cadena de texto
      if (typeof ubicacion === 'string') {
        // Intentar extraer de formato "[37.4219983° N, 122.084° W]"
        const regex = /\[(\d+\.\d+)°\s*([NS]),\s*(\d+\.\d+)°\s*([WE])\]/;
        const match = ubicacion.match(regex);
        
        if (match) {
          let lat = parseFloat(match[1]);
          let lng = parseFloat(match[3]);
          
          // Ajustar según hemisferio
          if (match[2] === 'S') lat = -lat;
          if (match[4] === 'W') lng = -lng;
          
          return { lat, lng };
        }
        
        // Intentar extraer números directamente
        const numbers = ubicacion.match(/\d+\.\d+/g);
        if (numbers && numbers.length >= 2) {
          let lat = parseFloat(numbers[0]);
          let lng = parseFloat(numbers[1]);
          
          // Determinar si es negativo basado en N/S, E/W
          if (ubicacion.includes('S')) lat = -lat;
          if (ubicacion.includes('W')) lng = -lng;
          
          return { lat, lng };
        }
      }
      
      // Caso 3: Es un array [lat, lng]
      if (Array.isArray(ubicacion) && ubicacion.length >= 2) {
        return {
          lat: ubicacion[0],
          lng: ubicacion[1]
        };
      }
      
      // No se pudo extraer coordenadas
      console.error("No se pudieron extraer coordenadas de:", ubicacion);
      return null;
    };
    
    const loadLeafletResources = () => {
      return new Promise((resolve, reject) => {
        // Cargar CSS de Leaflet si no está cargado
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }
        
        // Cargar JS de Leaflet si no está cargado
        if (!window.L) {
          const script = document.createElement('script');
          script.id = 'leaflet-js';
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = '';
          script.onload = () => resolve();
          script.onerror = (e) => reject(e);
          document.head.appendChild(script);
        } else {
          resolve();
        }
      });
    };
    
    const initLeafletMap = async () => {
      if (!selectedLocation.value) return;
      
      try {
        // Cargar recursos de Leaflet si no están cargados
        await loadLeafletResources();
        
        // Esperar un momento para asegurarse de que Leaflet esté completamente cargado
        setTimeout(() => {
          const mapElement = document.getElementById('map');
          if (mapElement && window.L) {
            // Limpiar el contenedor del mapa si ya existe un mapa
            mapElement.innerHTML = '';
            
            // Crear el mapa
            map = L.map('map').setView([selectedLocation.value.lat, selectedLocation.value.lng], 15);
            
            // Añadir capa de mapa base
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            // Añadir marcador
            marker = L.marker([selectedLocation.value.lat, selectedLocation.value.lng]).addTo(map);
            
            // Añadir círculo
            L.circle([selectedLocation.value.lat, selectedLocation.value.lng], {
              color: '#4285F4',
              fillColor: '#4285F4',
              fillOpacity: 0.2,
              radius: 100
            }).addTo(map);
            
            // Añadir popup con información
            const popupContent = `
              <div class="info-window">
                <h4>Detalles del Movimiento</h4>
                <p><strong>Cliente:</strong> ${selectedMovimiento.value?.NombreCliente || 'N/A'}</p>
                <p><strong>Tipo:</strong> ${selectedMovimiento.value?.TipoMovimiento || 'N/A'}</p>
                <p><strong>Monto:</strong> ${formatCurrency(selectedMovimiento.value?.Monto || 0)}</p>
                <p><strong>Fecha:</strong> ${formatDate(selectedMovimiento.value?.Fecha || '')}</p>
                <p><strong>Coordenadas:</strong> ${formatCoordinates(selectedLocation.value)}</p>
              </div>
            `;
            
            marker.bindPopup(popupContent).openPopup();
            
            // Añadir control de escala
            L.control.scale().addTo(map);
            
            // Actualizar el mapa después de que el modal esté completamente visible
            setTimeout(() => {
              map.invalidateSize();
            }, 100);
          } else {
            console.error('Elemento del mapa no encontrado o Leaflet no está disponible');
          }
        }, 200);
      } catch (error) {
        console.error('Error al inicializar el mapa de Leaflet:', error);
        alert('Error al cargar el mapa: ' + error.message);
      }
    };
    
    const openDirections = () => {
      if (selectedLocation.value) {
        const { lat, lng } = selectedLocation.value;
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
      }
    };
    
    // Detalles del movimiento
    const showDetails = (movimiento) => {
      selectedMovimiento.value = movimiento;
      showDetailsModal.value = true;
    };
    
    // Cerrar modales
    const closeModal = () => {
      showMapModal.value = false;
      selectedLocation.value = null;
      selectedMovimiento.value = null;
      
      // Limpiar el mapa si existe
      if (map) {
        map.remove();
        map = null;
      }
    };
    
    const closeDetailsModal = () => {
      showDetailsModal.value = false;
      selectedMovimiento.value = null;
    };
    
    // Paginación
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };
    
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };
    
    // Cargar datos al montar el componente
    onMounted(() => {
      loadMovimientos();
    });
    
    return {
      movimientos,
      filteredMovimientos,
      showMapModal,
      showDetailsModal,
      selectedLocation,
      selectedMovimiento,
      searchQuery,
      filterType,
      currentPage,
      totalPages,
      totalIncome,
      totalExpenses,
      totalBalance,
      formatDate,
      formatCurrency,
      formatCoordinates,
      getDay,
      getMonth,
      getTypeClass,
      verMapa,
      openDirections,
      showDetails,
      closeModal,
      closeDetailsModal,
      nextPage,
      prevPage
    };
  }
}
</script>

<style scoped>
/* Estilos base */
.movimientos-container {
  font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  padding: 24px;
  background-color: #f8f9fa;
  color: #333;
  min-height: 100vh;
}

/* Encabezado */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 16px;
  color: #7f8c8d;
}

.search-input {
  padding: 10px 16px 10px 36px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  width: 240px;
  transition: all 0.3s;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.filter-dropdown {
  position: relative;
}

.filter-select {
  padding: 10px 36px 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  appearance: none;
  background-color: white;
  cursor: pointer;
  min-width: 160px;
  border: 1px solid #e2e8f0;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
}

.filter-select:focus {
  outline: none;
  border-color: #3498db;
}

/* Tarjetas de resumen */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #e2e8f0;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 32px;
  margin-right: 16px;
  padding: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
}

.income .card-icon {
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.expenses .card-icon {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.balance .card-icon {
  background-color: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.card-content {
  display: flex;
  flex-direction: column;
}

.card-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.card-value {
  font-size: 22px;
  font-weight: 600;
}

.income .card-value {
  color: #2ecc71;
}

.expenses .card-value {
  color: #e74c3c;
}

.balance .card-value {
  color: #3498db;
}

/* Tabla de movimientos */
.table-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}

.movimientos-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.movimientos-table th {
  background-color: #f1f5f9;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
  padding: 16px 12px;
  text-align: left;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #e2e8f0;
}

.movimientos-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.even-row {
  background-color: white;
}

.odd-row {
  background-color: #f8fafc;
}

.no-results {
  text-align: center;
  padding: 24px;
  color: #64748b;
  font-style: italic;
}

/* Celdas personalizadas */
.date-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.date-day {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.date-month {
  font-size: 12px;
  color: #7f8c8d;
  text-transform: uppercase;
}

.client-cell {
  display: flex;
  flex-direction: column;
}

.client-name {
  font-weight: 500;
  margin-bottom: 2px;
  color: #2c3e50;
}

.client-id {
  font-size: 12px;
  color: #7f8c8d;
}

/* Badges */
.type-badge, .method-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.type-badge {
  background-color: #e2e8f0;
  color: #334155;
}

.method-badge {
  background-color: #dbeafe;
  color: #1e40af;
}

.loan-type {
  background-color: #fef3c7;
  color: #92400e;
}

.payment-type {
  background-color: #dcfce7;
  color: #166534;
}

.credit-type {
  background-color: #e0e7ff;
  color: #4338ca;
}

.withdrawal-type {
  background-color: #fee2e2;
  color: #991b1b;
}

.deposit-type {
  background-color: #ecfdf5;
  color: #047857;
}

/* Montos */
.positive-amount {
  color: #2ecc71;
  font-weight: 500;
}

.negative-amount {
  color: #e74c3c;
  font-weight: 500;
}

/* Botones */
.btn-mapa, .btn-details {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-mapa {
  background-color: #e0f2fe;
  color: #0369a1;
  margin-right: 8px;
}

.btn-mapa:hover:not(:disabled) {
  background-color: #bae6fd;
}

.btn-mapa:disabled {
  background-color: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
}

.btn-details {
  background-color: #ede9fe;
  color: #6d28d9;
}

.btn-details:hover {
  background-color: #ddd6fe;
}

/* Paginación */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.pagination-btn {
  padding: 8px 16px;
  border-radius: 6px;
  background-color: white;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f1f5f9;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 14px;
  color: #64748b;
}

/* Modales */
.map-modal, .details-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.map-modal-content, .details-modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: #f1f5f9;
  color: #475569;
}

.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.movement-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.map-container {
  height: 400px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

/* Detalles del movimiento */
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

/* Modal footer */
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 14px;
}

.close-modal-btn {
  background-color: #f1f5f9;
  color: #475569;
}

.close-modal-btn:hover {
  background-color: #e2e8f0;
}

.directions-btn {
  background-color: #3b82f6;
  color: white;
}

.directions-btn:hover {
  background-color: #2563eb;
}

/* Responsive */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .search-input {
    width: 100%;
  }
  
  .movement-info, .details-grid {
    grid-template-columns: 1fr;
  }
  
  .movimientos-table td {
    padding: 12px 8px;
  }
  
  .btn-mapa, .btn-details {
    padding: 6px 8px;
    font-size: 12px;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 8px;
  }
  
  .modal-btn {
    width: 100%;
  }
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.map-modal, .details-modal {
  animation: fadeIn 0.3s ease-out;
}

/* Scroll personalizado */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Estilos para el mapa de Leaflet */
:deep(.leaflet-container) {
  font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

:deep(.leaflet-popup-content) {
  margin: 12px;
  font-size: 14px;
}

:deep(.leaflet-popup-content h4) {
  margin-top: 0;
  margin-bottom: 8px;
  color: #1e293b;
  font-size: 16px;
}

:deep(.leaflet-popup-content p) {
  margin: 4px 0;
  color: #334155;
}

:deep(.leaflet-control-scale) {
  margin-bottom: 20px;
  margin-left: 20px;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}
</style>