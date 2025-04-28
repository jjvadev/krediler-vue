<template>
    <div class="container py-3">
      <h2 class="text-danger text-center mb-4">
        <i class="bi bi-exclamation-triangle"></i> Préstamos Atrasados Activos
      </h2>
  
      <div class="alert alert-light text-center mb-3">
        <strong>Fecha de hoy:</strong> {{ hoyFormateado }}
      </div>
  
      <div v-if="loading" class="text-center my-4">
        <div class="spinner-border text-danger" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
  
      <div v-else-if="prestamosAtrasados.length === 0" class="alert alert-success">
        <i class="bi bi-check-circle"></i> No hay préstamos atrasados activos
      </div>
  
      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead class="table-danger">
            <tr>
              <th>Cliente</th>
              <th>Cédula</th>
              <th>Ruta</th>
              <th class="text-end">Monto</th>
              <th>Fecha Pago</th>
              <th class="text-end">Días Atraso</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in prestamosAtrasados" :key="p.id">
              <td>{{ p.data.NombreUsuario }}</td>
              <td>{{ p.data.Cedula }}</td>
              <td>{{ p.data.Ruta }}</td>
              <td class="text-end">{{ formatoMoneda(p.data.Prestamo_Inicial) }}</td>
              <td>{{ p.data.Proximo_Pago }}</td>
              <td class="text-end text-danger fw-bold">{{ p.diasAtraso }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  import { collection, getDocs } from "firebase/firestore";
  import { db } from "@/firebase";
  import { parse, differenceInDays, isAfter, format } from "date-fns";
  
  export default {
    name: "PrestamosAtrasadosActivos",
    data() {
      return {
        prestamos: [],
        hoy: new Date(),
        loading: true
      };
    },
    computed: {
      hoyFormateado() {
        return format(this.hoy, "dd/MM/yyyy");
      },
      prestamosAtrasados() {
        return this.prestamos.filter(p => 
          p.estaAtrasado && 
          p.data.Estado && 
          p.data.Estado.toLowerCase() === "activo"
        );
      }
    },
    methods: {
      async cargarPrestamos() {
        try {
          const query = await getDocs(collection(db, "Prestamos"));
          this.hoy = new Date(); // Actualizar fecha al momento de cargar
          
          this.prestamos = query.docs.map(doc => {
            const data = doc.data();
            let diasAtraso = 0;
            let estaAtrasado = false;
  
            if (data.Proximo_Pago) {
              try {
                const fechaPago = parse(data.Proximo_Pago, 'dd/MM/yyyy', new Date());
                estaAtrasado = isAfter(this.hoy, fechaPago);
                
                if (estaAtrasado) {
                  diasAtraso = differenceInDays(this.hoy, fechaPago);
                }
              } catch (error) {
                console.error("Error al procesar fecha:", error);
              }
            }
  
            return {
              id: doc.id,
              data: data,
              diasAtraso: diasAtraso,
              estaAtrasado: estaAtrasado
            };
          });
  
        } catch (error) {
          console.error("Error al cargar préstamos:", error);
        } finally {
          this.loading = false;
        }
      },
      formatoMoneda(valor) {
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0
        }).format(valor || 0);
      }
    },
    async created() {
      await this.cargarPrestamos();
    }
  };
  </script>
  
  <style scoped>
  .table th {
    font-weight: 500;
    white-space: nowrap;
  }
  .table td {
    vertical-align: middle;
  }
  </style>