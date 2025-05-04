<template>
  <div class="abonos-container">
    <!-- Encabezado y estadísticas -->
    <div class="header-section">
      <div class="title-section">
        <h1>Gestión de Abonos</h1>
        <p class="subtitle">Administra los abonos de préstamos</p>
      </div>
      
      <div class="stats-cards">
        <div class="stat-card total">
          <div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div>
          <div class="stat-content">
            <h3>{{ formatCurrency(totalAbonos) }}</h3>
            <p>Total Abonos</p>
          </div>
        </div>
        
        <div class="stat-card today">
          <div class="stat-icon"><i class="fas fa-calendar-day"></i></div>
          <div class="stat-content">
            <h3>{{ formatCurrency(todayAbonos) }}</h3>
            <p>Abonos Hoy</p>
          </div>
        </div>
        
        <div class="stat-card interest">
          <div class="stat-icon"><i class="fas fa-percentage"></i></div>
          <div class="stat-content">
            <h3>{{ formatCurrency(totalIntereses) }}</h3>
            <p>Total Intereses</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Filtros y búsqueda -->
    <div class="filters-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar por nombre o cédula..." 
          @input="currentPage = 1"
        />
      </div>
      
      <div class="filter-controls">
        <div class="filter-group">
          <label>Tipo de Abono</label>
          <select v-model="filterType" @change="currentPage = 1">
            <option value="">Todos</option>
            <option value="Interés + Capital">Interés + Capital</option>
            <option value="Capital">Capital</option>
            <option value="Interés">Interés</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Desde</label>
          <input type="date" v-model="startDate" @change="currentPage = 1" />
        </div>
        
        <div class="filter-group">
          <label>Hasta</label>
          <input type="date" v-model="endDate" @change="currentPage = 1" />
        </div>
        
        <button class="btn-clear" @click="clearFilters">
          <i class="fas fa-times"></i> Limpiar
        </button>
      </div>
    </div>
    
    <!-- Tabla de abonos -->
    <div class="table-container">
      <table class="abonos-table">
        <thead>
          <tr>
            <th class="date-col">Fecha</th>
            <th class="client-col">Cliente</th>
            <th class="id-col">Cédula</th>
            <th class="type-col">Tipo</th>
            <th class="method-col">Método</th>
            <th class="amount-col">Monto</th>
            <th class="actions-col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="abono in filteredAbonos" :key="abono.id" :class="['abono-row', getTypeClass(abono.TipoAbono)]">
            <td class="date-cell">
              <div class="date-box">
                <span class="date-day">{{ getDay(abono.Fecha) }}</span>
                <span class="date-month">{{ getMonth(abono.Fecha) }}</span>
              </div>
            </td>
            <td class="client-cell">{{ abono.NombreCliente }}</td>
            <td class="id-cell">{{ abono.CedulaCliente }}</td>
            <td class="type-cell">
              <span class="tipo-badge" :class="getTypeClass(abono.TipoAbono)">
                {{ abono.TipoAbono }}
              </span>
            </td>
            <td class="method-cell">{{ abono.MetodoPago }}</td>
            <td class="amount-cell">{{ formatCurrency(abono.Monto) }}</td>
            <td class="actions-cell">
              <button class="btn-action view" @click="showDetails(abono)" title="Ver detalles">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn-action map" @click="verMapa(abono)" title="Ver ubicación" :disabled="!abono.Ubicacion">
                <i class="fas fa-map-marker-alt"></i>
              </button>
            </td>
          </tr>
          <tr v-if="filteredAbonos.length === 0">
            <td colspan="7" class="no-data">
              <i class="fas fa-search-minus"></i> No se encontraron abonos con los filtros aplicados
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Paginación -->
    <div class="pagination">
      <button 
        class="btn-page prev" 
        @click="prevPage" 
        :disabled="currentPage === 1"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      
      <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
      
      <button 
        class="btn-page next" 
        @click="nextPage" 
        :disabled="currentPage === totalPages || totalPages === 0"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
    
    <!-- Modal de detalles -->
    <div class="modal" v-if="showDetailsModal" @click.self="closeDetailsModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Detalles del Abono</h2>
          <button class="btn-close" @click="closeDetailsModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body" v-if="selectedAbono">
          <div class="detail-card" :class="getTypeClass(selectedAbono.TipoAbono)">
            <div class="detail-header">
              <h3>{{ selectedAbono.TipoAbono }}</h3>
              <div class="amount">{{ formatCurrency(selectedAbono.Monto) }}</div>
            </div>
            
            <div class="detail-content">
              <div class="detail-row">
                <div class="detail-label"><i class="fas fa-user"></i> Cliente:</div>
                <div class="detail-value">{{ selectedAbono.NombreCliente }}</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label"><i class="fas fa-id-card"></i> Cédula:</div>
                <div class="detail-value">{{ selectedAbono.CedulaCliente }}</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label"><i class="fas fa-calendar-alt"></i> Fecha:</div>
                <div class="detail-value">{{ formatDate(selectedAbono.Fecha) }}</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label"><i class="fas fa-credit-card"></i> Método de Pago:</div>
                <div class="detail-value">{{ selectedAbono.MetodoPago }}</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label"><i class="fas fa-file-invoice-dollar"></i> ID Préstamo:</div>
                <div class="detail-value">{{ selectedAbono.PrestamoId }}</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label"><i class="fas fa-user-tag"></i> ID Usuario:</div>
                <div class="detail-value">{{ selectedAbono.UserId }}</div>
              </div>
            </div>
            
            <div class="detail-actions">
              <button class="btn-primary" @click="verMapa(selectedAbono)" :disabled="!selectedAbono.Ubicacion">
                <i class="fas fa-map-marker-alt"></i> Ver Ubicación
              </button>
              <button class="btn-secondary" @click="closeDetailsModal">
                <i class="fas fa-times"></i> Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal del mapa -->
    <div class="modal map-modal" v-if="showMapModal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Ubicación del Abono</h2>
          <button class="btn-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div id="map" class="map-container"></div>
          
          <div class="map-info" v-if="selectedAbono">
            <div class="map-detail">
              <i class="fas fa-user"></i> <strong>Cliente:</strong> {{ selectedAbono.NombreCliente }}
            </div>
            <div class="map-detail">
              <i class="fas fa-calendar-alt"></i> <strong>Fecha:</strong> {{ formatDate(selectedAbono.Fecha) }}
            </div>
            <div class="map-detail">
              <i class="fas fa-money-bill-wave"></i> <strong>Monto:</strong> {{ formatCurrency(selectedAbono.Monto) }}
            </div>
            <div class="map-detail">
              <i class="fas fa-map-pin"></i> <strong>Coordenadas:</strong> {{ formatCoordinates(selectedLocation) }}
            </div>
          </div>
          
          <div class="map-actions">
            <button class="btn-primary" @click="openDirections" :disabled="!selectedLocation">
              <i class="fas fa-directions"></i> Cómo llegar
            </button>
            <button class="btn-secondary" @click="closeModal">
              <i class="fas fa-times"></i> Cerrar
            </button>
          </div>
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
  name: 'Abonos',
  setup() {
    const abonos = ref([]);
    const showMapModal = ref(false);
    const showDetailsModal = ref(false);
    const selectedLocation = ref(null);
    const selectedAbono = ref(null);
    const searchQuery = ref('');
    const filterType = ref('');
    const currentPage = ref(1);
    const itemsPerPage = 10;
    const startDate = ref('');
    const endDate = ref('');
    let map = null;
    let marker = null;
    
    // Configuración zona horaria Colombia (UTC-5)
    const colombiaOffset = -5 * 60 * 60 * 1000;
    
    // Cargar abonos desde Firestore
    const loadAbonos = async () => {
      try {
        const abonosCollection = collection(db, 'Abonos');
        const abonosSnapshot = await getDocs(abonosCollection);
        abonos.value = abonosSnapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() };
        });
        console.log("Abonos cargados:", abonos.value);
      } catch (error) {
        console.error('Error al cargar abonos:', error);
      }
    };
    
    // Obtener fecha actual en hora Colombia
    const getCurrentDateInColombia = () => {
      const now = new Date();
      return new Date(now.getTime() + colombiaOffset);
    };
    
    // Función para parsear fechas en formato DD/MM/AAAA
    const parseCustomDate = (dateString) => {
      if (!dateString) return null;
      const [day, month, year] = dateString.split('/');
      return new Date(`${year}-${month}-${day}T00:00:00`);
    };
    
    // Obtener fecha actual en formato DD/MM/AAAA para comparar con la base de datos
    const getCurrentDateString = () => {
      const now = getCurrentDateInColombia();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    // Filtros y búsqueda
    const filteredAbonos = computed(() => {
      let filtered = abonos.value;
      
      // Filtrar por tipo
      if (filterType.value) {
        filtered = filtered.filter(a => a.TipoAbono === filterType.value);
      }
      
      // Filtrar por búsqueda
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(a => 
          (a.NombreCliente?.toLowerCase().includes(query)) ||
          (a.CedulaCliente?.toLowerCase().includes(query)) ||
          (a.PrestamoId?.toLowerCase().includes(query))
        );
      }
      
      // Filtrar por rango de fechas
      if (startDate.value || endDate.value) {
        filtered = filtered.filter(a => {
          const abonoDate = parseCustomDate(a.Fecha);
          const fromDate = startDate.value ? new Date(startDate.value) : null;
          const toDate = endDate.value ? new Date(endDate.value) : null;
          
          // Ajustar la fecha final para incluir todo el día
          if (toDate) {
            toDate.setHours(23, 59, 59, 999);
          }
          
          // Verificar si la fecha del abono está dentro del rango
          const isAfterStart = !fromDate || abonoDate >= fromDate;
          const isBeforeEnd = !toDate || abonoDate <= toDate;
          
          return isAfterStart && isBeforeEnd;
        });
      }
      
      // Paginación
      const start = (currentPage.value - 1) * itemsPerPage;
      return filtered.slice(start, start + itemsPerPage);
    });

    // Totales
    const totalAbonos = computed(() => {
      return abonos.value.reduce((sum, a) => sum + (a.Monto || 0), 0);
    });

    const todayAbonos = computed(() => {
      const todayString = getCurrentDateString();
      
      return abonos.value
        .filter(a => a.Fecha === todayString)
        .reduce((sum, a) => sum + (a.Monto || 0), 0);
    });

    const totalIntereses = computed(() => {
      return abonos.value
        .filter(a => a.TipoAbono === "Interés" || a.TipoAbono === "Interés + Capital")
        .reduce((sum, a) => {
          // Para "Interés + Capital", estimamos que el 30% es interés
          if (a.TipoAbono === "Interés + Capital") {
            return sum + (a.Monto * 0.3);
          }
          return sum + (a.Monto || 0);
        }, 0);
    });
    
    // Cálculo de páginas totales
    const totalPages = computed(() => {
      let filtered = abonos.value;
      
      if (filterType.value) {
        filtered = filtered.filter(a => a.TipoAbono === filterType.value);
      }
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(a => 
          (a.NombreCliente?.toLowerCase().includes(query)) ||
          (a.CedulaCliente?.toLowerCase().includes(query)) ||
          (a.PrestamoId?.toLowerCase().includes(query))
        );
      }
      
      if (startDate.value || endDate.value) {
        filtered = filtered.filter(a => {
          const abonoDate = parseCustomDate(a.Fecha);
          const fromDate = startDate.value ? new Date(startDate.value) : null;
          const toDate = endDate.value ? new Date(endDate.value) : null;
          
          if (toDate) {
            toDate.setHours(23, 59, 59, 999);
          }
          
          const isAfterStart = !fromDate || abonoDate >= fromDate;
          const isBeforeEnd = !toDate || abonoDate <= toDate;
          
          return isAfterStart && isBeforeEnd;
        });
      }
      
      return Math.ceil(filtered.length / itemsPerPage) || 1;
    });
    
    // Formateadores
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      
      // Si es formato DD/MM/AAAA, convertirlo a objeto Date
      if (dateString.includes('/')) {
        const date = parseCustomDate(dateString);
        return date instanceof Date && !isNaN(date) 
          ? date.toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric',
              timeZone: 'America/Bogota'
            }) 
          : dateString;
      }
      
      // Si ya es un objeto Date o timestamp
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date) 
        ? date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            timeZone: 'America/Bogota'
          }) 
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
      // Si es formato DD/MM/AAAA, extraer directamente
      if (dateString.includes('/')) {
        const [day] = dateString.split('/');
        return day.padStart(2, '0');
      }
      
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date) 
        ? date.getDate().toString().padStart(2, '0') 
        : '--';
    };

    const getMonth = (dateString) => {
      if (!dateString) return '---';
      
      // Si es formato DD/MM/AAAA, extraer directamente
      if (dateString.includes('/')) {
        const [, month] = dateString.split('/');
        const monthIndex = parseInt(month, 10) - 1;
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return months[monthIndex] || '---';
      }
      
      const date = new Date(dateString);
      if (!(date instanceof Date) || isNaN(date)) return '---';
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return months[date.getMonth()];
    };
    
    // Clases para tipos
    const getTypeClass = (type) => {
      if (!type) return '';
      const typeClasses = {
        'Interés + Capital': 'combined-type',
        'Capital': 'capital-type',
        'Interés': 'interest-type'
      };
      return typeClasses[type] || '';
    };
    
    // Mapa
    const verMapa = (abono) => {
      selectedAbono.value = abono;
      
      if (abono.Ubicacion) {
        try {
          const coords = extractCoordinates(abono.Ubicacion);
          
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
        alert('No hay ubicación disponible para este abono');
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
                <h4>Detalles del Abono</h4>
                <p><strong>Cliente:</strong> ${selectedAbono.value?.NombreCliente || 'N/A'}</p>
                <p><strong>Tipo:</strong> ${selectedAbono.value?.TipoAbono || 'N/A'}</p>
                <p><strong>Monto:</strong> ${formatCurrency(selectedAbono.value?.Monto || 0)}</p>
                <p><strong>Fecha:</strong> ${formatDate(selectedAbono.value?.Fecha || '')}</p>
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
    
    // Detalles del abono
    const showDetails = (abono) => {
      selectedAbono.value = abono;
      showDetailsModal.value = true;
    };
    
    // Cerrar modales
    const closeModal = () => {
      showMapModal.value = false;
      selectedLocation.value = null;
      selectedAbono.value = null;
      
      // Limpiar el mapa si existe
      if (map) {
        map.remove();
        map = null;
      }
    };
    
    const closeDetailsModal = () => {
      showDetailsModal.value = false;
      selectedAbono.value = null;
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
    
    // Limpiar filtros
    const clearFilters = () => {
      searchQuery.value = '';
      filterType.value = '';
      startDate.value = '';
      endDate.value = '';
      currentPage.value = 1;
    };
    
    // Cargar datos al montar el componente
    onMounted(() => {
      loadAbonos();
      
      // Actualizar cada hora para detectar cambios de día
      setInterval(() => {
        loadAbonos();
      }, 3600000); // 1 hora
    });
    
    return {
      abonos,
      filteredAbonos,
      showMapModal,
      showDetailsModal,
      selectedLocation,
      selectedAbono,
      searchQuery,
      filterType,
      currentPage,
      totalPages,
      totalAbonos,
      todayAbonos,
      totalIntereses,
      startDate,
      endDate,
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
      prevPage,
      clearFilters
    };
  }
}
</script>

<style scoped>
/* Estilos base */
.abonos-container {
  font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  padding: 24px;
  background-color: #f8f9fa;
  color: #333;
  min-height: 100vh;
}

/* Encabezado */
.header-section {
  margin-bottom: 30px;
}

.title-section h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}

.title-section .subtitle {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
}

/* Tarjetas de estadísticas */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.stat-card.total {
  border-left: 4px solid #3498db;
}

.stat-card.today {
  border-left: 4px solid #2ecc71;
}

.stat-card.interest {
  border-left: 4px solid #e74c3c;
}

.stat-icon {
  width: 50px;
  height: 50px;
  background-color: rgba(52, 152, 219, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 20px;
  color: #3498db;
}

.stat-card.today .stat-icon {
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.stat-card.interest .stat-icon {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.stat-content h3 {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #2c3e50;
}

.stat-content p {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

/* Filtros */
.filters-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.search-box {
  position: relative;
  margin-bottom: 16px;
}

.search-box i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.filter-group select,
.filter-group input[type="date"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
}

.filter-group select:focus,
.filter-group input[type="date"]:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.btn-clear {
  padding: 10px 16px;
  background-color: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-clear:hover {
  background-color: #e2e8f0;
  color: #475569;
}

/* Tabla de abonos */
.table-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.abonos-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.abonos-table th {
  text-align: left;
  padding: 12px 16px;
  background-color: #f8fafc;
  color: #64748b;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
}

.abonos-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.abono-row:hover {
  background-color: #f8fafc;
}

/* Celdas especiales */
.date-cell {
  width: 80px;
}

.date-box {
  display: flex;
  flex-direction: column;
  align-items: center;
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
  font-weight: 500;
  color: #2c3e50;
}

.id-cell {
  color: #64748b;
  font-size: 14px;
}

.tipo-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.combined-type {
  background-color: #e0f2fe;
  color: #0369a1;
}

.capital-type {
  background-color: #dcfce7;
  color: #166534;
}

.interest-type {
  background-color: #fee2e2;
  color: #991b1b;
}

.method-cell {
  font-size: 14px;
  color: #475569;
}

.amount-cell {
  font-weight: 600;
  color: #2c3e50;
}

.actions-cell {
  width: 120px;
  text-align: center;
}

.btn-action {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.3s;
  margin: 0 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-action.view {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
}

.btn-action.map {
  color: #10b981;
  background-color: rgba(16, 185, 129, 0.1);
}

.btn-action:hover {
  transform: scale(1.1);
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-size: 16px;
}

.no-data i {
  font-size: 24px;
  margin-bottom: 12px;
  display: block;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.page-info {
  font-size: 14px;
  color: #64748b;
}

.btn-page {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-page:hover:not(:disabled) {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modales */
.modal {
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

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: #e2e8f0;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

/* Detalles del abono */
.detail-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.detail-header {
  padding: 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-card.combined-type .detail-header {
  background-color: #0369a1;
}

.detail-card.capital-type .detail-header {
  background-color: #166534;
}

.detail-card.interest-type .detail-header {
  background-color: #991b1b;
}

.detail-header h3 {
  margin: 0;
  font-size: 18px;
}

.detail-header .amount {
  font-size: 22px;
  font-weight: 600;
}

.detail-content {
  padding: 20px;
  background: white;
}

.detail-row {
  display: flex;
  margin-bottom: 16px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  width: 150px;
  font-weight: 500;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-value {
  flex: 1;
  color: #2c3e50;
}

.detail-actions {
  padding: 16px 20px;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-primary {
  padding: 10px 20px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 20px;
  background-color: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
}

/* Mapa */
.map-modal .modal-content {
  max-width: 900px;
}

.map-container {
  height: 400px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.map-info {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.map-detail {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.map-detail:last-child {
  margin-bottom: 0;
}

.map-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .filter-group {
    min-width: 100%;
  }
  
  .modal-content {
    width: 95%;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 4px;
  }
  
  .detail-label {
    width: 100%;
  }
  
  .detail-actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
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