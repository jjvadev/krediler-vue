<template>
    <div class="container mt-5">
      <h1 class="display-4 fw-bold text-primary text-center mb-4">Listado de Rutas</h1>
      <div class="table-responsive shadow-sm rounded">
        <table class="table table-striped table-hover">
          <thead class="table-primary">
            <tr>
              <th scope="col">Base</th>
              <th scope="col">Caja</th>
              <th scope="col">Cobrador</th>
              <th scope="col">Código</th>
              <th scope="col">Nombre</th>
              <th scope="col">Super</th>
              <th scope="col">Supervisor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ruta in rutas" :key="ruta.id" class="align-middle">
              <td>{{ ruta.data.Base }}</td>
              <td>{{ ruta.data.Caja }}</td>
              <td>{{ ruta.data.Cobrador }}</td>
              <td>{{ ruta.data.Codigo }}</td>
              <td>{{ ruta.data.Nombre }}</td>
              <td>{{ ruta.data.Super }}</td>
              <td>{{ ruta.data.Supervisor }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  import { collection, getDocs } from "firebase/firestore";
  import { db } from "@/firebase"; // Asegúrate de que la ruta sea correcta
  
  export default {
    name: "Rutas",
    data() {
      return {
        rutas: [], // Almacena las rutas obtenidas de Firestore
      };
    },
    async created() {
      await this.fetchRutas();
    },
    methods: {
      async fetchRutas() {
        try {
          const querySnapshot = await getDocs(collection(db, "Rutas"));
          this.rutas = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }));
          console.log("Datos de rutas obtenidos:", this.rutas);
        } catch (error) {
          console.error("Error al obtener las rutas:", error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Estilo adicional para personalizar el diseño */
  .container {
    max-width: 1200px;
  }
  
  h1 {
    font-size: 2.5rem;
  }
  
  .table {
    margin-top: 20px;
  }
  
  .table th {
    text-align: center;
    vertical-align: middle;
  }
  
  .table td {
    text-align: center;
    vertical-align: middle;
  }
  
  @media (max-width: 768px) {
    h1 {
      font-size: 2rem;
    }
  
    .table {
      font-size: 0.9rem;
    }
  }
  </style>