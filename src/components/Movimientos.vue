<template>
  <div class="container mx-auto mt-6 px-4">
    <!-- Título y controles -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Listado de Movimientos</h1>
      <button 
        @click="fetchMovimientos" 
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        <i class="fas fa-sync-alt mr-2"></i> Actualizar
      </button>
    </div>

    <!-- Filtros -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Buscar por cédula</label>
        <input 
          v-model="filters.cedula" 
          type="text" 
          placeholder="Ingrese cédula..."
          class="w-full p-2 border border-gray-300 rounded-lg"
        >
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de movimiento</label>
        <select 
          v-model="filters.tipo" 
          class="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="">Todos</option>
          <option value="Abono">Abono</option>
          <option value="Desembolso">Desembolso</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
        <input 
          v-model="filters.fecha" 
          type="date" 
          class="w-full p-2 border border-gray-300 rounded-lg"
        >
      </div>
    </div>

    <!-- Tabla y Mapa -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Tabla de movimientos -->
      <div class="overflow-x-auto shadow-lg rounded-lg">
        <table class="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead class="bg-blue-600 text-white">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Fecha</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Cliente</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Tipo</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Ubicación</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="movimiento in filteredMovimientos"
              :key="movimiento.id"
              @click="showLocation(movimiento)"
              class="hover:bg-blue-50 transition duration-200 cursor-pointer"
              :class="{ 'bg-blue-100': selectedMovement?.id === movimiento.id }"
            >
              <td class="px-6 py-4 text-sm text-gray-700">{{ formatDate(movimiento.data.Fecha) }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">
                <div>{{ movimiento.data.NombreCliente }}</div>
                <div class="text-gray-500 text-xs">{{ movimiento.data.CedulaCliente }}</div>
              </td>
              <td class="px-6 py-4 text-sm">
                <span 
                  class="px-2 py-1 rounded-full text-xs"
                  :class="{
                    'bg-green-100 text-green-800': movimiento.data.TipoMovimiento === 'Abono',
                    'bg-yellow-100 text-yellow-800': movimiento.data.TipoMovimiento === 'Desembolso'
                  }"
                >
                  {{ movimiento.data.TipoMovimiento }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">
                <button
                  v-if="movimiento.data.Ubicacion"
                  @click.stop="showLocation(movimiento)"
                  class="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <i class="fas fa-map-marker-alt mr-1"></i> Ver mapa
                </button>
                <span v-else class="text-gray-400">Sin ubicación</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="loading" class="p-4 text-center">
          <i class="fas fa-spinner fa-spin text-blue-500"></i> Cargando movimientos...
        </div>
        <div v-if="!loading && filteredMovimientos.length === 0" class="p-4 text-center text-gray-500">
          No se encontraron movimientos
        </div>
      </div>

      <!-- Mapa -->
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="p-4 bg-blue-600 text-white">
          <h2 class="text-lg font-semibold">
            <i class="fas fa-map-marked-alt mr-2"></i> Ubicación del Movimiento
          </h2>
        </div>
        <div id="map" class="h-96 w-full"></div>
        <div v-if="selectedMovement" class="p-4 border-t">
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><span class="font-medium">Cliente:</span> {{ selectedMovement.data.NombreCliente }}</div>
            <div><span class="font-medium">Fecha:</span> {{ formatDate(selectedMovement.data.Fecha) }}</div>
            <div><span class="font-medium">Tipo:</span> {{ selectedMovement.data.TipoMovimiento }}</div>
            <div><span class="font-medium">Monto:</span> {{ formatCurrency(selectedMovement.data.Monto) }}</div>
          </div>
          <div v-if="selectedMovement.data.Ubicacion" class="mt-2 text-xs text-gray-500">
            Coordenadas: {{ selectedMovement.data.Ubicacion[0] }}, {{ selectedMovement.data.Ubicacion[1] }}
          </div>
        </div>
        <div v-else class="p-4 text-center text-gray-500">
          Seleccione un movimiento para ver su ubicación
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Configuración de iconos para Leaflet (necesario para evitar errores)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export default {
  name: "Movimientos",
  data() {
    return {
      movimientos: [],
      loading: false,
      selectedMovement: null,
      map: null,
      marker: null,
      filters: {
        cedula: "",
        tipo: "",
        fecha: ""
      }
    };
  },
  computed: {
    filteredMovimientos() {
      return this.movimientos.filter(movimiento => {
        // Filtro por cédula
        if (this.filters.cedula && 
            !movimiento.data.CedulaCliente.includes(this.filters.cedula)) {
          return false;
        }
        
        // Filtro por tipo
        if (this.filters.tipo && 
            movimiento.data.TipoMovimiento !== this.filters.tipo) {
          return false;
        }
        
        // Filtro por fecha
        if (this.filters.fecha) {
          const movimientoDate = new Date(movimiento.data.Fecha).toISOString().split('T')[0];
          if (movimientoDate !== this.filters.fecha) {
            return false;
          }
        }
        
        return true;
      });
    }
  },
  async mounted() {
    await this.fetchMovimientos();
    this.initMap();
  },
  methods: {
    async fetchMovimientos() {
      try {
        this.loading = true;
        const q = query(collection(db, "Movimientos"), orderBy("Timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        this.movimientos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }));
      } catch (error) {
        console.error("Error al cargar movimientos:", error);
      } finally {
        this.loading = false;
      }
    },
    
    initMap() {
      // Inicializar el mapa con vista por defecto (Medellín)
      this.map = L.map('map').setView([6.2442, -75.5812], 12);
      
      // Añadir capa de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
    },
    
    showLocation(movimiento) {
      this.selectedMovement = movimiento;
      
      if (!movimiento.data.Ubicacion || movimiento.data.Ubicacion.length !== 2) {
        // Si no hay ubicación, centrar en Medellín
        this.map.setView([6.2442, -75.5812], 12);
        
        // Eliminar marcador si existe
        if (this.marker) {
          this.map.removeLayer(this.marker);
          this.marker = null;
        }
        return;
      }

      // Obtener las coordenadas
      let latString = movimiento.data.Ubicacion[0]; // Ejemplo: "10.151798° N"
      let lngString = movimiento.data.Ubicacion[1]; // Ejemplo: "75.3979879° W"

      // Convertir a formato decimal
      const lat = this.convertToDecimal(latString);
      const lng = this.convertToDecimal(lngString);

      // Mover el mapa a la ubicación seleccionada
      this.map.setView([lat, lng], 15);

      // Eliminar marcador anterior si existe
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }

      // Crear nuevo marcador
      this.marker = L.marker([lat, lng]).addTo(this.map);

      // Añadir popup con información y mostrar coordenadas
      this.marker.bindPopup(`
        <b>${movimiento.data.NombreCliente}</b><br>
        ${movimiento.data.TipoMovimiento} - ${this.formatCurrency(movimiento.data.Monto)}<br>
        ${this.formatDate(movimiento.data.Fecha)}<br>
        <strong>Coordenadas:</strong> ${lat}, ${lng}
      `).openPopup();
    },
    
    convertToDecimal(coordinate) {
      const match = coordinate.match(/([+-]?\d+(\.\d+)?)\s*(N|S|E|W)/);
      if (!match) {
        return null;
      }
      let decimal = parseFloat(match[1]);
      const direction = match[3];

      if (direction === 'S' || direction === 'W') {
        decimal = -decimal;
      }
      return decimal;
    },

    formatDate(dateString) {
      if (!dateString) return "N/A";
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-CO', options);
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(value);
    }
  },
  beforeDestroy() {
    // Limpiar el mapa cuando el componente se destruye
    if (this.map) {
      this.map.remove();
    }
  }
};
</script>

<style scoped>
/* Estilos personalizados para el mapa */
#map {
  z-index: 0; /* Asegurar que el mapa esté detrás de otros elementos */
}

/* Estilo para las filas seleccionadas */
.bg-blue-100 {
  background-color: #ebf5ff;
}

/* Transición suave para hover */
.transition {
  transition: all 0.2s ease;
}

/* Ajustes para móviles */
@media (max-width: 1024px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  #map {
    height: 300px;
  }
}
</style>
