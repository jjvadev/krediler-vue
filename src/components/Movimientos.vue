<template>
  <div class="movimientos-container">
    <h3>Movimientos</h3>
    
    <table class="movimientos-table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Cliente</th>
          <th>Tipo</th>
          <th>Método</th>
          <th>Monto</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="movimiento in movimientos" :key="movimiento.id || movimiento.PrestamoId">
          <td>{{ formatDate(movimiento.Fecha) }}</td>
          <td>{{ movimiento.NombreCliente || 'N/A' }}</td>
          <td>{{ movimiento.TipoMovimiento }}</td>
          <td>{{ movimiento.MetodoPago }}</td>
          <td>{{ formatCurrency(movimiento.Monto) }}</td>
          <td>
            <button @click="verMapa(movimiento)" class="btn-mapa" :disabled="!movimiento.Ubicacion">
              Ver Mapa
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Modal para mostrar el mapa -->
    <div v-if="showMapModal" class="map-modal">
      <div class="map-modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h3>Ubicación del Movimiento</h3>
        <div class="coord-info" v-if="selectedLocation">
          <p><strong>Coordenadas:</strong> {{ formatCoordinates(selectedLocation) }}</p>
          <p v-if="selectedMovimiento"><strong>Cliente:</strong> {{ selectedMovimiento.NombreCliente || 'N/A' }}</p>
          <p v-if="selectedMovimiento"><strong>Fecha:</strong> {{ formatDate(selectedMovimiento.Fecha) }}</p>
        </div>
        <div id="map" style="height: 400px; width: 100%;"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase'; // Asegúrate de tener configurado tu archivo firebase.js

export default {
  name: 'Movimientos',
  setup() {
    const movimientos = ref([]);
    const showMapModal = ref(false);
    const selectedLocation = ref(null);
    const selectedMovimiento = ref(null);
    let map = null;
    let marker = null;
    
    const loadMovimientos = async () => {
      try {
        const movimientosCollection = collection(db, 'Movimientos');
        const movimientosSnapshot = await getDocs(movimientosCollection);
        const movimientosList = movimientosSnapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() };
        });
        movimientos.value = movimientosList;
        console.log("Movimientos cargados:", movimientos.value.length);
      } catch (error) {
        console.error('Error al cargar movimientos:', error);
      }
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date) 
        ? date.toLocaleDateString() 
        : dateString;
    };
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
      }).format(amount);
    };
    
    const formatCoordinates = (location) => {
      if (!location) return '';
      
      const lat = Math.abs(location.lat).toFixed(6);
      const lng = Math.abs(location.lng).toFixed(6);
      
      const latDir = location.lat >= 0 ? 'N' : 'S';
      const lngDir = location.lng >= 0 ? 'E' : 'W';
      
      return `${lat}° ${latDir}, ${lng}° ${lngDir}`;
    };
    
    const extractCoordinates = (ubicacion) => {
      console.log("Extrayendo coordenadas de:", ubicacion);
      console.log("Tipo de ubicación:", typeof ubicacion);
      
      // Caso 1: Es un objeto con propiedades lat/lng o latitude/longitude
      if (typeof ubicacion === 'object' && ubicacion !== null) {
        console.log("Propiedades del objeto:", Object.keys(ubicacion));
        
        // Verificar si es un GeoPoint de Firestore
        if (ubicacion.latitude !== undefined && ubicacion.longitude !== undefined) {
          console.log("Detectado GeoPoint de Firestore");
          return {
            lat: ubicacion.latitude,
            lng: ubicacion.longitude
          };
        }
        
        // Verificar si tiene propiedades lat/lng
        if (ubicacion.lat !== undefined && ubicacion.lng !== undefined) {
          console.log("Detectado objeto con lat/lng");
          return {
            lat: ubicacion.lat,
            lng: ubicacion.lng
          };
        }
        
        // Verificar si es un objeto con _lat/_long (formato interno de Firestore)
        if (ubicacion._lat !== undefined && ubicacion._long !== undefined) {
          console.log("Detectado objeto con _lat/_long");
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
          
          console.log("Coordenadas extraídas de string:", lat, lng);
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
          
          console.log("Números extraídos de string:", lat, lng);
          return { lat, lng };
        }
      }
      
      // Caso 3: Es un array [lat, lng]
      if (Array.isArray(ubicacion) && ubicacion.length >= 2) {
        console.log("Detectado array de coordenadas");
        return {
          lat: ubicacion[0],
          lng: ubicacion[1]
        };
      }
      
      // No se pudo extraer coordenadas
      console.error("No se pudieron extraer coordenadas de:", ubicacion);
      return null;
    };
    
    const verMapa = (movimiento) => {
      console.log("Mostrando mapa para movimiento:", movimiento.id || movimiento.PrestamoId);
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
    
    const loadLeafletResources = () => {
      return new Promise((resolve, reject) => {
        // Cargar CSS de Leaflet
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }
        
        // Cargar JS de Leaflet
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
            
            // Añadir coordenadas como un elemento HTML normal
            const coordInfoDiv = document.createElement('div');
            coordInfoDiv.className = 'coord-info-map';
            coordInfoDiv.innerHTML = formatCoordinates(selectedLocation.value);
            coordInfoDiv.style.position = 'absolute';
            coordInfoDiv.style.bottom = '10px';
            coordInfoDiv.style.left = '50%';
            coordInfoDiv.style.transform = 'translateX(-50%)';
            coordInfoDiv.style.backgroundColor = 'white';
            coordInfoDiv.style.padding = '5px 10px';
            coordInfoDiv.style.borderRadius = '4px';
            coordInfoDiv.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
            coordInfoDiv.style.zIndex = '1000';
            coordInfoDiv.style.fontWeight = 'bold';
            
            // Añadir el div al contenedor del mapa
            mapElement.appendChild(coordInfoDiv);
            
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
    
    onMounted(() => {
      loadMovimientos();
    });
    
    return {
      movimientos,
      formatDate,
      formatCurrency,
      formatCoordinates,
      verMapa,
      showMapModal,
      closeModal,
      selectedLocation,
      selectedMovimiento
    };
  }
}
</script>

<style scoped>
.movimientos-container {
  padding: 20px;
}

.movimientos-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.movimientos-table th, .movimientos-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.movimientos-table th {
  background-color: #f2f2f2;
}

.btn-mapa {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
}

.btn-mapa:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.map-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.map-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 80%;
  max-width: 800px;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
}

.coord-info {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #4285F4;
}

/* Estilos para el popup */
:deep(.info-window) {
  font-family: Arial, sans-serif;
}

:deep(.info-window h4) {
  margin-top: 0;
  color: #4285F4;
}

:deep(.info-window p) {
  margin: 5px 0;
}

/* Estilos para el contenedor del mapa */
#map {
  position: relative;
}
</style>