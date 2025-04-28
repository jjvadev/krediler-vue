<template>
    <div class="container mx-auto mt-6 px-4">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">Listado de Clientes</h1>
      <div class="overflow-x-auto shadow-lg rounded-lg">
        <table class="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead class="bg-blue-600 text-white">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Nombre</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Apellido</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Cédula</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Celular</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Celular Fiador</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Trabajo</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Barrio</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Ciudad</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Ruta</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Dirección Fiador</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Nombre Fiador</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Referencias</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="cliente in clientes"
              :key="cliente.id"
              class="hover:bg-gray-100 transition duration-200"
            >
              <td class="px-6 py-4 text-sm text-gray-700">{{ cliente.data.Nombre }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ cliente.data.Apellido }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ cliente.data.Cedula }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ cliente.data.Celular }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ cliente.data.CelularFiador }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ cliente.data.Trabajo }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ cliente.data.Barrio }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ cliente.data.Ciudad }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ cliente.data.RutaSeleccionada }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ cliente.data.DireccionFiador }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ cliente.data.NombreFiador }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ cliente.data.ReferenciasPersonales }}</td>
            </tr>
          </tbody>
        </table>
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
      };
    },
    async created() {
      await this.fetchClientes();
    },
    methods: {
      async fetchClientes() {
        try {
          const querySnapshot = await getDocs(collection(db, "Clientes"));
          this.clientes = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }));
          console.log("Datos obtenidos:", this.clientes);
        } catch (error) {
          console.error("Error al obtener los datos de Firestore: ", error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* General container styles */
  .container {
    max-width: 1200px;
  }
  
  /* Table styles */
  table {
    border-collapse: collapse;
    width: 100%;
  }
  
  th,
  td {
    text-align: left;
    padding: 12px;
  }
  
  th {
    background-color: #007bff;
    color: white;
    font-weight: bold;
  }
  
  tbody tr:hover {
    background-color: #f1f1f1;
    cursor: pointer;
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    table {
      font-size: 0.9rem;
    }
  
    th,
    td {
      padding: 10px;
    }
  }
  
  @media (max-width: 480px) {
    table {
      font-size: 0.8rem;
    }
  
    th,
    td {
      padding: 8px;
    }
  }
  </style>