<template>
    <div class="ver-cliente-container">
      <div class="header">
        <h2>Detalles del Cliente</h2>
        <button @click="volverALista" class="btn-volver">
          <i class="icon-arrow-back"></i> Volver
        </button>
      </div>
  
      <div class="cliente-detalle">
        <!-- Información Básica -->
        <div class="seccion">
          <h3>Información Básica</h3>
          <div class="detalle-item">
            <span class="detalle-label">Nombre:</span>
            <span class="detalle-valor">{{ cliente.Nombre }} {{ cliente.Apellido }}</span>
          </div>
          <div class="detalle-item">
            <span class="detalle-label">Cédula:</span>
            <span class="detalle-valor">{{ cliente.Cedula }}</span>
          </div>
          <div class="detalle-item">
            <span class="detalle-label">Celular:</span>
            <span class="detalle-valor">{{ cliente.Celular }}</span>
          </div>
          <div class="detalle-item">
            <span class="detalle-label">Ciudad:</span>
            <span class="detalle-valor">{{ cliente.Ciudad }}</span>
          </div>
          <div class="detalle-item">
            <span class="detalle-label">Dirección:</span>
            <span class="detalle-valor">{{ cliente.Direccion }}</span>
          </div>
          <div class="detalle-item">
            <span class="detalle-label">Ruta:</span>
            <span class="detalle-valor">{{ cliente.RutaSeleccionada }}</span>
          </div>
          <div class="detalle-item">
            <span class="detalle-label">Trabajo:</span>
            <span class="detalle-valor">{{ cliente.Trabajo }}</span>
          </div>
          <div class="detalle-item" v-if="cliente.ReferenciasFamiliares1">
            <span class="detalle-label">Referencia Familiar 1:</span>
            <span class="detalle-valor">{{ cliente.ReferenciasFamiliares1 }}</span>
          </div>
          <div class="detalle-item" v-if="cliente.ReferenciasFamiliares2">
            <span class="detalle-label">Referencia Familiar 2:</span>
            <span class="detalle-valor">{{ cliente.ReferenciasFamiliares2 }}</span>
          </div>
        </div>
  
        <!-- Información del Fiador -->
        <div class="seccion" v-if="cliente.NombreFiador">
          <h3>Información del Fiador</h3>
          <div class="detalle-item">
            <span class="detalle-label">Nombre:</span>
            <span class="detalle-valor">{{ cliente.NombreFiador }}</span>
          </div>
          <div class="detalle-item">
            <span class="detalle-label">Celular:</span>
            <span class="detalle-valor">{{ cliente.CelularFiador }}</span>
          </div>
          <div class="detalle-item">
            <span class="detalle-label">Dirección:</span>
            <span class="detalle-valor">{{ cliente.DireccionFiador }}</span>
          </div>
          <div class="detalle-item">
            <span class="detalle-label">Trabajo:</span>
            <span class="detalle-valor">{{ cliente.TrabajoFiador }}</span>
          </div>
          <div class="detalle-item" v-if="cliente.ReferenciasFiador1">
            <span class="detalle-label">Referencia Fiador 1:</span>
            <span class="detalle-valor">{{ cliente.ReferenciasFiador1 }}</span>
          </div>
          <div class="detalle-item" v-if="cliente.ReferenciasFiador2">
            <span class="detalle-label">Referencia Fiador 2:</span>
            <span class="detalle-valor">{{ cliente.ReferenciasFiador2 }}</span>
          </div>
        </div>
  
        <div class="acciones">
          <router-link 
            :to="'/clientes/editar/' + $route.params.id" 
            class="btn-editar"
          >
            <i class="icon-edit"></i> Editar Cliente
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { doc, getDoc } from "firebase/firestore";
  import { db } from "@/firebase";
  
  export default {
    name: "VerCliente",
    data() {
      return {
        cliente: {
          Cedula: "",
          Celular: "",
          CelularFiador: "",
          Ciudad: "",
          Direccion: "",
          DireccionFiador: "",
          Nombre: "",
          NombreFiador: "",
          ReferenciasFamiliares1: "",
          ReferenciasFamiliares2: "",
          ReferenciasFiador1: "",
          ReferenciasFiador2: "",
          RutaSeleccionada: "",
          Trabajo: "",
          TrabajoFiador: ""
        }
      };
    },
    async created() {
      await this.cargarCliente();
    },
    methods: {
      async cargarCliente() {
        try {
          const docRef = doc(db, "Clientes", this.$route.params.id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            this.cliente = docSnap.data();
          } else {
            alert("No se encontró el cliente");
            this.$router.push('/clientes');
          }
        } catch (error) {
          console.error("Error al cargar el cliente: ", error);
          alert("Ocurrió un error al cargar el cliente");
        }
      },
      volverALista() {
        this.$router.push('/clientes');
      }
    }
  };
  </script>
  
  <style scoped>
  .ver-cliente-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  h2 {
    color: #2c3e50;
    margin: 0;
  }
  
  .cliente-detalle {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .seccion {
    margin-bottom: 25px;
  }
  
  .seccion h3 {
    color: #3498db;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }
  
  .detalle-item {
    display: flex;
    margin-bottom: 10px;
  }
  
  .detalle-label {
    font-weight: 500;
    color: #7f8c8d;
    min-width: 150px;
  }
  
  .detalle-valor {
    color: #2c3e50;
  }
  
  .acciones {
    margin-top: 30px;
    text-align: right;
  }
  
  .btn-volver {
    background-color: #95a5a6;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  
  .btn-volver:hover {
    background-color: #7f8c8d;
  }
  
  .btn-editar {
    background-color: #3498db;
    color: white;
    padding: 8px 15px;
    border-radius: 4px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }
  
  .btn-editar:hover {
    background-color: #2980b9;
  }
  
  .icon-arrow-back:before {
    content: "←";
    margin-right: 5px;
  }
  
  .icon-edit:before {
    content: "✏️";
    margin-right: 5px;
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .btn-volver {
      margin-top: 10px;
      align-self: flex-end;
    }
    
    .detalle-item {
      flex-direction: column;
    }
    
    .detalle-label {
      margin-bottom: 5px;
    }
  }
  </style>