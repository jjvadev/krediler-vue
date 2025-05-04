<template>
  <div class="clientes-container">
    <!-- Header con título y botón de nuevo cliente -->
    <div class="header">
      <h1><i class="icon-users"></i> Gestión de Clientes</h1>
      <router-link to="/clientes/nuevo" class="btn btn-primary">
        <i class="icon-plus"></i> Nuevo Cliente
      </router-link>
    </div>

    <!-- Panel de filtros -->
    <div class="filtros-panel">
      <div class="filtro-group">
        <label for="filtro-ruta">Filtrar por Ruta:</label>
        <select id="filtro-ruta" v-model="filtros.ruta" class="form-control">
          <option value="">Todas las rutas</option>
          <option v-for="ruta in rutasUnicas" :key="ruta" :value="ruta">{{ ruta }}</option>
        </select>
      </div>

      <div class="filtro-group">
        <label for="filtro-nombre">Buscar por Nombre:</label>
        <input 
          id="filtro-nombre" 
          v-model="filtros.nombre" 
          type="text" 
          placeholder="Escriba un nombre..." 
          class="form-control"
        >
      </div>

      <div class="filtro-group">
        <label for="filtro-cedula">Buscar por Cédula:</label>
        <input 
          id="filtro-cedula" 
          v-model="filtros.cedula" 
          type="text" 
          placeholder="Escriba una cédula..." 
          class="form-control"
        >
      </div>

      <button @click="resetFiltros" class="btn btn-secondary">
        <i class="icon-reset"></i> Limpiar Filtros
      </button>
    </div>

    <!-- Tabla de clientes -->
    <div class="table-responsive">
      <table class="clientes-table">
        <thead>
          <tr>
            <th @click="ordenarPor('Nombre')" :class="{ 'active': orden.campo === 'Nombre' }">
              Nombre
              <i class="sort-icon" :class="ordenIcono('Nombre')"></i>
            </th>
            <th @click="ordenarPor('Cedula')" :class="{ 'active': orden.campo === 'Cedula' }">
              Cédula
              <i class="sort-icon" :class="ordenIcono('Cedula')"></i>
            </th>
            <th @click="ordenarPor('Celular')" :class="{ 'active': orden.campo === 'Celular' }">
              Celular
              <i class="sort-icon" :class="ordenIcono('Celular')"></i>
            </th>
            <th @click="ordenarPor('RutaSeleccionada')" :class="{ 'active': orden.campo === 'RutaSeleccionada' }">
              Ruta
              <i class="sort-icon" :class="ordenIcono('RutaSeleccionada')"></i>
            </th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cliente in clientesFiltrados" :key="cliente.id">
            <td>
              <div class="cliente-info">
                <div class="cliente-avatar">
                  {{ getIniciales(cliente.data.Nombre) }}
                </div>
                <div class="cliente-details">
                  <strong>{{ cliente.data.Nombre }} {{ cliente.data.Apellido }}</strong>
                  <small>{{ cliente.data.Ciudad }}</small>
                </div>
              </div>
            </td>
            <td>{{ formatoCedula(cliente.data.Cedula) }}</td>
            <td>{{ formatoTelefono(cliente.data.Celular) }}</td>
            <td>{{ cliente.data.RutaSeleccionada }}</td>
            <td>
              <span class="estado-badge" :class="claseEstado(cliente.data.Estado)">
                {{ cliente.data.Estado || 'Activo' }}
              </span>
            </td>
            <td class="acciones">
              <router-link 
                :to="'/clientes/editar/' + cliente.id" 
                class="btn-action btn-edit" 
                title="Editar"
              >
                <i class="icon-edit"></i>
              </router-link>
              <router-link 
                :to="'/clientes/ver/' + cliente.id" 
                class="btn-action btn-view" 
                title="Ver detalles"
              >
                <i class="icon-eye"></i>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="paginacion" v-if="paginacion.totalPaginas > 1">
      <button 
        @click="paginaAnterior" 
        :disabled="paginacion.pagina === 1"
        class="btn-pagina"
      >
        <i class="icon-chevron-left"></i>
      </button>
      
      <span class="pagina-info">
        Página {{ paginacion.pagina }} de {{ paginacion.totalPaginas }}
      </span>
      
      <button 
        @click="paginaSiguiente" 
        :disabled="paginacion.pagina === paginacion.totalPaginas"
        class="btn-pagina"
      >
        <i class="icon-chevron-right"></i>
      </button>
    </div>

    <!-- Mensaje cuando no hay resultados -->
    <div v-if="clientesFiltrados.length === 0" class="empty-state">
      <i class="icon-search"></i>
      <h3>No se encontraron clientes</h3>
      <p>Intenta ajustar tus filtros de búsqueda</p>
      <button @click="resetFiltros" class="btn btn-primary">
        <i class="icon-reset"></i> Reiniciar filtros
      </button>
    </div>
  </div>
</template>

<script>
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

export default {
  name: "Clientes",
  data() {
    return {
      clientes: [],
      filtros: {
        ruta: '',
        nombre: '',
        cedula: ''
      },
      orden: {
        campo: 'Nombre',
        direccion: 'asc'
      },
      paginacion: {
        pagina: 1,
        porPagina: 10,
        total: 0,
        totalPaginas: 1
      }
    };
  },
  async created() {
    await this.cargarClientes();
  },
  computed: {
    rutasUnicas() {
      const rutas = this.clientes.map(c => c.data.RutaSeleccionada);
      return [...new Set(rutas)].filter(r => r).sort();
    },
    clientesFiltrados() {
      let filtrados = [...this.clientes];
      
      // Aplicar filtros
      if (this.filtros.ruta) {
        filtrados = filtrados.filter(c => 
          c.data.RutaSeleccionada?.toLowerCase().includes(this.filtros.ruta.toLowerCase())
        );
      }
      
      if (this.filtros.nombre) {
        filtrados = filtrados.filter(c => 
          c.data.Nombre?.toLowerCase().includes(this.filtros.nombre.toLowerCase()) ||
          c.data.Apellido?.toLowerCase().includes(this.filtros.nombre.toLowerCase())
        );
      }
      
      if (this.filtros.cedula) {
        filtrados = filtrados.filter(c => 
          c.data.Cedula?.includes(this.filtros.cedula)
        );
      }
      
      // Ordenar
      filtrados.sort((a, b) => {
        const campoA = a.data[this.orden.campo]?.toString().toLowerCase() || '';
        const campoB = b.data[this.orden.campo]?.toString().toLowerCase() || '';
        
        if (campoA < campoB) return this.orden.direccion === 'asc' ? -1 : 1;
        if (campoA > campoB) return this.orden.direccion === 'asc' ? 1 : -1;
        return 0;
      });
      
      // Paginación
      this.paginacion.total = filtrados.length;
      this.paginacion.totalPaginas = Math.ceil(filtrados.length / this.paginacion.porPagina);
      
      const inicio = (this.paginacion.pagina - 1) * this.paginacion.porPagina;
      const fin = inicio + this.paginacion.porPagina;
      
      return filtrados.slice(inicio, fin);
    }
  },
  methods: {
    async cargarClientes() {
      try {
        const querySnapshot = await getDocs(collection(db, "Clientes"));
        this.clientes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }));
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        alert("Error al cargar los clientes");
      }
    },
    ordenarPor(campo) {
      if (this.orden.campo === campo) {
        this.orden.direccion = this.orden.direccion === 'asc' ? 'desc' : 'asc';
      } else {
        this.orden.campo = campo;
        this.orden.direccion = 'asc';
      }
      this.paginacion.pagina = 1; // Resetear a primera página al cambiar orden
    },
    ordenIcono(campo) {
      if (this.orden.campo !== campo) return 'icon-sort';
      return this.orden.direccion === 'asc' ? 'icon-sort-up' : 'icon-sort-down';
    },
    resetFiltros() {
      this.filtros = {
        ruta: '',
        nombre: '',
        cedula: ''
      };
      this.orden = {
        campo: 'Nombre',
        direccion: 'asc'
      };
      this.paginacion.pagina = 1;
    },
    getIniciales(nombre) {
      if (!nombre) return '';
      const partes = nombre.split(' ');
      return partes.map(p => p[0]).join('').toUpperCase();
    },
    formatoCedula(cedula) {
      if (!cedula) return '';
      return cedula.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
    },
    formatoTelefono(telefono) {
      if (!telefono) return '';
      return telefono.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    },
    claseEstado(estado) {
      estado = estado?.toLowerCase() || 'activo';
      return {
        'activo': estado === 'activo',
        'inactivo': estado === 'inactivo',
        'moroso': estado === 'moroso',
        'pendiente': estado === 'pendiente'
      };
    },
    paginaAnterior() {
      if (this.paginacion.pagina > 1) {
        this.paginacion.pagina--;
      }
    },
    paginaSiguiente() {
      if (this.paginacion.pagina < this.paginacion.totalPaginas) {
        this.paginacion.pagina++;
      }
    }
  }
};
</script>

<style scoped>
.clientes-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  font-size: 28px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.filtros-panel {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 25px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  align-items: end;
}

.filtro-group {
  display: flex;
  flex-direction: column;
}

.filtro-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
  font-size: 14px;
}

.form-control {
  padding: 10px 15px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-control:focus {
  border-color: #4dabf7;
  box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.2);
  outline: none;
}

.btn {
  padding: 10px 15px;
  border-radius: 6px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background-color: #4dabf7;
  color: white;
}

.btn-primary:hover {
  background-color: #339af0;
}

.btn-secondary {
  background-color: #e9ecef;
  color: #495057;
}

.btn-secondary:hover {
  background-color: #dee2e6;
}

.table-responsive {
  overflow-x: auto;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.clientes-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.clientes-table th {
  background-color: #f1f3f5;
  color: #495057;
  font-weight: 600;
  padding: 15px;
  text-align: left;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.clientes-table th.active {
  background-color: #e9ecef;
  color: #212529;
}

.clientes-table th:hover {
  background-color: #e9ecef;
}

.sort-icon {
  margin-left: 5px;
  font-size: 12px;
}

.clientes-table td {
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.cliente-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cliente-avatar {
  width: 40px;
  height: 40px;
  background-color: #4dabf7;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.cliente-details {
  display: flex;
  flex-direction: column;
}

.cliente-details small {
  color: #868e96;
  font-size: 12px;
  margin-top: 3px;
}

.estado-badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.estado-badge.activo {
  background-color: #d3f9d8;
  color: #2b8a3e;
}

.estado-badge.inactivo {
  background-color: #ffe3e3;
  color: #c92a2a;
}

.estado-badge.moroso {
  background-color: #fff3bf;
  color: #e67700;
}

.estado-badge.pendiente {
  background-color: #d0ebff;
  color: #1971c2;
}

.acciones {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-edit {
  background-color: #fff3bf;
  color: #e67700;
}

.btn-edit:hover {
  background-color: #ffec99;
}

.btn-view {
  background-color: #d0ebff;
  color: #1971c2;
}

.btn-view:hover {
  background-color: #a5d8ff;
}

.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.btn-pagina {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f3f5;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-pagina:hover:not(:disabled) {
  background-color: #e9ecef;
}

.btn-pagina:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagina-info {
  font-size: 14px;
  color: #495057;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 10px;
  margin-top: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-state i {
  font-size: 48px;
  color: #adb5bd;
  margin-bottom: 15px;
  display: inline-block;
}

.empty-state h3 {
  color: #343a40;
  margin-bottom: 10px;
}

.empty-state p {
  color: #868e96;
  margin-bottom: 20px;
}

/* Iconos (puedes reemplazar con tu librería de iconos preferida) */
[class^="icon-"]:before {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: normal;
  speak: never;
  display: inline-block;
  text-decoration: none;
  width: 1em;
  margin-right: 0.2em;
  text-align: center;
  font-variant: normal;
  text-transform: none;
  line-height: 1em;
}

.icon-users:before { content: "👥"; }
.icon-plus:before { content: "+"; }
.icon-reset:before { content: "🔄"; }
.icon-sort:before { content: "⇅"; }
.icon-sort-up:before { content: "↑"; }
.icon-sort-down:before { content: "↓"; }
.icon-edit:before { content: "✏️"; }
.icon-eye:before { content: "👁️"; }
.icon-chevron-left:before { content: "❮"; }
.icon-chevron-right:before { content: "❯"; }
.icon-search:before { content: "🔍"; }

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .filtros-panel {
    grid-template-columns: 1fr;
  }
  
  .clientes-table th, 
  .clientes-table td {
    padding: 10px;
    font-size: 14px;
  }
  
  .cliente-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .cliente-avatar {
    width: 30px;
    height: 30px;
    font-size: 12px;
  }
}
</style>