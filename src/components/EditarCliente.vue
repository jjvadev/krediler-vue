<template>
    <div class="editar-cliente-container">
      <div class="header">
        <h2>Editar Cliente</h2>
        <button @click="volverALista" class="btn-volver">
          <i class="icon-arrow-back"></i> Volver
        </button>
      </div>
  
      <form @submit.prevent="guardarCliente" class="cliente-form">
        <!-- Información Básica -->
        <div class="form-section">
          <h3>Información Básica</h3>
          <div class="form-group">
            <label>Nombre:</label>
            <input v-model="cliente.Nombre" required>
          </div>
          <div class="form-group">
            <label>Apellido:</label>
            <input v-model="cliente.Apellido">
          </div>
          <div class="form-group">
            <label>Cédula:</label>
            <input v-model="cliente.Cedula" required disabled>
          </div>
          <div class="form-group">
            <label>Celular:</label>
            <input v-model="cliente.Celular" type="tel">
          </div>
        </div>
  
        <!-- Dirección -->
        <div class="form-section">
          <h3>Dirección</h3>
          <div class="form-group">
            <label>Ciudad:</label>
            <input v-model="cliente.Ciudad">
          </div>
          <div class="form-group">
            <label>Dirección:</label>
            <input v-model="cliente.Direccion">
          </div>
          <div class="form-group">
            <label>Ruta:</label>
            <input v-model="cliente.RutaSeleccionada" required>
          </div>
        </div>
  
        <!-- Fiador -->
        <div class="form-section">
          <h3>Fiador</h3>
          <div class="form-group">
            <label>Nombre Fiador:</label>
            <input v-model="cliente.NombreFiador">
          </div>
          <div class="form-group">
            <label>Celular Fiador:</label>
            <input v-model="cliente.CelularFiador" type="tel">
          </div>
          <div class="form-group">
            <label>Dirección Fiador:</label>
            <input v-model="cliente.DireccionFiador">
          </div>
        </div>
  
        <!-- Referencias -->
        <div class="form-section">
          <h3>Referencias</h3>
          <div class="form-group">
            <label>Referencia Familiar 1:</label>
            <input v-model="cliente.ReferenciasFamiliares1">
          </div>
          <div class="form-group">
            <label>Referencia Familiar 2:</label>
            <input v-model="cliente.ReferenciasFamiliares2">
          </div>
          <div class="form-group">
            <label>Referencia Fiador 1:</label>
            <input v-model="cliente.ReferenciasFiador1">
          </div>
          <div class="form-group">
            <label>Referencia Fiador 2:</label>
            <input v-model="cliente.ReferenciasFiador2">
          </div>
        </div>
  
        <div class="form-actions">
          <button type="button" @click="volverALista" class="btn-cancelar">
            Cancelar
          </button>
          <button type="submit" class="btn-guardar">
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import { doc, getDoc, updateDoc } from "firebase/firestore";
  import { db } from "@/firebase";
  
  export default {
    name: "EditarCliente",
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
          Apellido: "",
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
            this.volverALista();
          }
        } catch (error) {
          console.error("Error al cargar cliente:", error);
          alert("Error al cargar los datos del cliente");
        }
      },
      async guardarCliente() {
        try {
          if (!this.cliente.Nombre || !this.cliente.Cedula || !this.cliente.RutaSeleccionada) {
            alert("Por favor complete los campos obligatorios");
            return;
          }
  
          const clienteRef = doc(db, "Clientes", this.$route.params.id);
          await updateDoc(clienteRef, this.cliente);
          
          alert("Cliente actualizado correctamente");
          this.volverALista();
        } catch (error) {
          console.error("Error al actualizar cliente:", error);
          alert("Error al guardar los cambios");
        }
      },
      volverALista() {
        this.$router.push('/clientes');
      }
    }
  };
  </script>
  
  <style scoped>
  .editar-cliente-container {
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
  }
  
  .cliente-form {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .form-section {
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }
  
  .form-section h3 {
    color: #3498db;
    margin-bottom: 15px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #495057;
  }
  
  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
  }
  
  input:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  
  .btn-volver,
  .btn-cancelar,
  .btn-guardar {
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.3s;
  }
  
  .btn-volver {
    background-color: #95a5a6;
    color: white;
    border: none;
    display: flex;
    align-items: center;
  }
  
  .btn-volver:hover {
    background-color: #7f8c8d;
  }
  
  .btn-cancelar {
    background-color: #e74c3c;
    color: white;
    border: none;
  }
  
  .btn-cancelar:hover {
    background-color: #c0392b;
  }
  
  .btn-guardar {
    background-color: #2ecc71;
    color: white;
    border: none;
  }
  
  .btn-guardar:hover {
    background-color: #27ae60;
  }
  
  .icon-arrow-back:before {
    content: "←";
    margin-right: 5px;
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .btn-volver {
      margin-top: 10px;
    }
    
    .form-group {
      margin-bottom: 10px;
    }
    
    input {
      padding: 8px;
    }
  }
  </style>