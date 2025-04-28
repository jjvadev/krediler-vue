<template>
    <div class="container mx-auto mt-6 px-4">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">Listado de Préstamos</h1>
      <div class="overflow-x-auto shadow-lg rounded-lg">
        <table class="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead class="bg-blue-600 text-white">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Cédula</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Cuota Aproximada</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Deuda Pendiente</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Día Semana</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Fecha</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Interés</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Interés Incrementado</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Método Pago</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Nombre Usuario</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Número Cuotas</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Préstamo Inicial</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Próximo Pago</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Ruta</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Tipo Pago</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Último Pago</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Valor Intereses</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Valor Total</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Valor Préstamo</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">ID Préstamo</th>
              <th class="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">User ID</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="prestamo in prestamos"
              :key="prestamo.idPrestamo"
              class="hover:bg-gray-100 transition duration-200"
            >
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.Cedula }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.Cuota_Aproximada }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.Deuda_Pendiente }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.DiaSemana }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.Estado }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.Fecha }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.Interes }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.Interes_Incrementado }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.Metodo_Pago }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.NombreUsuario }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.Numero_Cuotas }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.Prestamo_Inicial }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.Proximo_Pago }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.Ruta }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.Tipo_Pago }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.Ultimo_Pago }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.ValorIntereses }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.ValorTotal }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.Valor_Prestamo }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.idPrestamo }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ prestamo.data.userId }}</td>
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
    name: "Prestamos",
    data() {
      return {
        prestamos: [],
      };
    },
    async created() {
      await this.fetchPrestamos();
    },
    methods: {
      async fetchPrestamos() {
        try {
          const querySnapshot = await getDocs(collection(db, "Prestamos"));
          this.prestamos = querySnapshot.docs.map((doc) => ({
            idPrestamo: doc.id,
            data: doc.data(),
          }));
          console.log("Datos obtenidos:", this.prestamos);
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