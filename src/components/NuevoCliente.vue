<template>
    <div class="nuevo-cliente-container">
      <h2>Nuevo Cliente</h2>
      
      <form @submit.prevent="guardarCliente" class="cliente-form">
        <!-- Sección Información Básica -->
        <fieldset>
          <legend>Información Básica</legend>
          
          <div class="form-group">
            <label for="nombre">Nombre:</label>
            <input 
              id="nombre" 
              v-model="cliente.Nombre" 
              type="text" 
              required
              placeholder="Ej: Juan"
            >
          </div>
          
          <div class="form-group">
            <label for="cedula">Cédula:</label>
            <input 
              id="cedula" 
              v-model="cliente.Cedula" 
              type="text" 
              required
              placeholder="Ej: 1234567890"
            >
          </div>
          
          <div class="form-group">
            <label for="celular">Celular:</label>
            <input 
              id="celular" 
              v-model="cliente.Celular" 
              type="tel" 
              placeholder="Ej: 3001234567"
            >
          </div>
          
          <div class="form-group">
            <label for="ciudad">Ciudad:</label>
            <input 
              id="ciudad" 
              v-model="cliente.Ciudad" 
              type="text" 
              placeholder="Ej: Pereira"
            >
          </div>
          
          <div class="form-group">
            <label for="direccion">Dirección:</label>
            <input 
              id="direccion" 
              v-model="cliente.Direccion" 
              type="text" 
              placeholder="Ej: Cra 10 #20-30"
            >
          </div>
          
          <div class="form-group">
            <label for="ruta">Ruta:</label>
            <input 
              id="ruta" 
              v-model="cliente.RutaSeleccionada" 
              type="text" 
              required
              placeholder="Ej: Pereira Centro"
            >
          </div>
          
          <div class="form-group">
            <label for="trabajo">Trabajo:</label>
            <input 
              id="trabajo" 
              v-model="cliente.Trabajo" 
              type="text" 
              placeholder="Ej: Comerciante"
            >
          </div>
        </fieldset>
        
        <!-- Sección Fiador -->
        <fieldset>
          <legend>Información del Fiador</legend>
          
          <div class="form-group">
            <label for="nombreFiador">Nombre Fiador:</label>
            <input 
              id="nombreFiador" 
              v-model="cliente.NombreFiador" 
              type="text" 
              placeholder="Ej: María Pérez"
            >
          </div>
          
          <div class="form-group">
            <label for="celularFiador">Celular Fiador:</label>
            <input 
              id="celularFiador" 
              v-model="cliente.CelularFiador" 
              type="tel" 
              placeholder="Ej: 3109876543"
            >
          </div>
          
          <div class="form-group">
            <label for="direccionFiador">Dirección Fiador:</label>
            <input 
              id="direccionFiador" 
              v-model="cliente.DireccionFiador" 
              type="text" 
              placeholder="Ej: Cra 5 #15-25"
            >
          </div>
          
          <div class="form-group">
            <label for="trabajoFiador">Trabajo Fiador:</label>
            <input 
              id="trabajoFiador" 
              v-model="cliente.TrabajoFiador" 
              type="text" 
              placeholder="Ej: Empleado"
            >
          </div>
        </fieldset>
        
        <!-- Sección Referencias -->
        <fieldset>
          <legend>Referencias</legend>
          
          <div class="form-group">
            <label for="refFamiliar1">Referencia Familiar 1:</label>
            <input 
              id="refFamiliar1" 
              v-model="cliente.ReferenciasFamiliares1" 
              type="text" 
              placeholder="Nombre y teléfono"
            >
          </div>
          
          <div class="form-group">
            <label for="refFamiliar2">Referencia Familiar 2:</label>
            <input 
              id="refFamiliar2" 
              v-model="cliente.ReferenciasFamiliares2" 
              type="text" 
              placeholder="Nombre y teléfono"
            >
          </div>
          
          <div class="form-group">
            <label for="refFiador1">Referencia Fiador 1:</label>
            <input 
              id="refFiador1" 
              v-model="cliente.ReferenciasFiador1" 
              type="text" 
              placeholder="Nombre y teléfono"
            >
          </div>
          
          <div class="form-group">
            <label for="refFiador2">Referencia Fiador 2:</label>
            <input 
              id="refFiador2" 
              v-model="cliente.ReferenciasFiador2" 
              type="text" 
              placeholder="Nombre y teléfono"
            >
          </div>
        </fieldset>
        
        <div class="form-actions">
          <button type="button" @click="cancelar" class="btn-cancelar">
            Cancelar
          </button>
          <button type="submit" class="btn-guardar">
            Guardar Cliente
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import { collection, addDoc } from "firebase/firestore";
  import { db } from "@/firebase";
  
  export default {
    name: "NuevoCliente",
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
    methods: {
      async guardarCliente() {
        try {
          // Validación básica
          if (!this.cliente.Nombre || !this.cliente.Cedula || !this.cliente.RutaSeleccionada) {
            alert("Por favor complete los campos obligatorios: Nombre, Cédula y Ruta");
            return;
          }
  
          // Guardar en Firestore
          const docRef = await addDoc(collection(db, "Clientes"), this.cliente);
          console.log("Cliente guardado con ID: ", docRef.id);
          
          // Mostrar mensaje de éxito
          alert("Cliente creado exitosamente");
          
          // Redirigir o limpiar el formulario
          this.resetForm();
          this.$router.push('/clientes'); // Opcional: redirigir a lista de clientes
          
        } catch (error) {
          console.error("Error al guardar el cliente: ", error);
          alert("Ocurrió un error al guardar el cliente");
        }
      },
      resetForm() {
        this.cliente = {
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
        };
      },
      cancelar() {
        if (confirm("¿Está seguro de cancelar? Los datos no guardados se perderán.")) {
          this.resetForm();
          this.$router.push('/clientes'); // Opcional: redirigir a lista de clientes
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .nuevo-cliente-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    color: #2c3e50;
    margin-bottom: 20px;
    text-align: center;
  }
  
  .cliente-form {
    display: grid;
    gap: 20px;
  }
  
  fieldset {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
  }
  
  legend {
    padding: 0 10px;
    color: #3498db;
    font-weight: bold;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #34495e;
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
  
  .btn-guardar {
    background-color: #2ecc71;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }
  
  .btn-guardar:hover {
    background-color: #27ae60;
  }
  
  .btn-cancelar {
    background-color: #e74c3c;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }
  
  .btn-cancelar:hover {
    background-color: #c0392b;
  }
  
  @media (max-width: 768px) {
    .nuevo-cliente-container {
      padding: 15px;
    }
    
    .cliente-form {
      grid-template-columns: 1fr;
    }
  }
  </style>