<template>
  <div class="atrasados-container">
    <div class="card border-danger">
      <div class="card-header bg-danger text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Préstamos Atrasados
        </h5>
        <span v-if="!loading" class="badge bg-white text-danger">
          Total: {{ estadisticas.total }}
        </span>
      </div>
      
      <div class="card-body">
        <div v-if="loading" class="text-center py-3">
          <div class="spinner-border text-danger" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
        
        <div v-else-if="estadisticas.total === 0" class="alert alert-success text-center">
          <i class="bi bi-check-circle me-2"></i>
          No hay préstamos atrasados actualmente
        </div>
        
        <div v-else>
          <!-- Resumen y gráfico -->
          <div class="row mb-4">
            <div class="col-md-6">
              <div class="card h-100">
                <div class="card-header bg-light">
                  <h6 class="mb-0">Distribución por Ruta</h6>
                </div>
                <div class="card-body">
                  <div class="chart-container" style="position: relative; height: 200px;">
                    <canvas ref="chartCanvas"></canvas>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="card h-100">
                <div class="card-header bg-light">
                  <h6 class="mb-0">Resumen por Ruta</h6>
                </div>
                <div class="card-body p-0">
                  <div class="list-group list-group-flush">
                    <div v-for="(cantidad, ruta) in rutasOrdenadas" 
                         :key="ruta" 
                         class="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <i class="bi bi-geo-alt me-2 text-danger"></i>
                        {{ ruta }}
                      </div>
                      <span class="badge bg-danger rounded-pill">{{ cantidad }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Lista detallada de préstamos atrasados -->
          <div class="card mb-3">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <h6 class="mb-0 me-3">Detalle de Préstamos Atrasados</h6>
                <select v-model="filtroRuta" class="form-select form-select-sm">
                  <option value="">Todas las rutas</option>
                  <option v-for="ruta in Object.keys(estadisticas.porRuta)" :key="ruta" :value="ruta">
                    {{ ruta }}
                  </option>
                </select>
              </div>
              <div>
                <button class="btn btn-sm btn-danger me-2" @click="exportarPDF">
                  <i class="bi bi-file-earmark-pdf"></i> PDF
                </button>
                <button class="btn btn-sm btn-success" @click="exportarExcel">
                  <i class="bi bi-file-earmark-excel"></i> Excel
                </button>
              </div>
            </div>
            <div class="table-responsive">
              <table class="table table-hover table-sm mb-0" id="tablaPrestamosAtrasados">
                <thead class="table-light">
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
                  <tr v-for="prestamo in prestamosFiltrados" :key="prestamo.id">
                    <td>{{ prestamo.data.NombreUsuario }}</td>
                    <td>{{ prestamo.data.Cedula }}</td>
                    <td>{{ prestamo.data.Ruta }}</td>
                    <td class="text-end">{{ formatoMoneda(prestamo.data.Prestamo_Inicial) }}</td>
                    <td>{{ prestamo.data.Proximo_Pago }}</td>
                    <td class="text-end text-danger fw-bold">{{ prestamo.diasAtraso }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Botón para ver detalles completos -->
          <div class="text-center">
            <router-link to="/prestamos-atrasados" class="btn btn-outline-danger">
              Inicio
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { parse, isAfter, differenceInDays, format } from "date-fns";
import { Chart, registerables } from 'chart.js';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

Chart.register(...registerables);

export default {
  name: "Atrasados",
  data() {
    return {
      prestamos: [],
      loading: true,
      chart: null,
      filtroRuta: "",
      estadisticas: {
        total: 0,
        porRuta: {}
      }
    };
  },
  computed: {
    rutasOrdenadas() {
      // Convertir el objeto a un array, ordenar por cantidad (descendente) y volver a objeto
      const rutasArray = Object.entries(this.estadisticas.porRuta)
        .sort((a, b) => b[1] - a[1]);
      
      // Convertir de nuevo a objeto
      return Object.fromEntries(rutasArray);
    },
    prestamosAtrasados() {
      return this.prestamos.filter(p => 
        p.estaAtrasado && 
        p.data.Estado && 
        p.data.Estado.toLowerCase() === "activo"
      );
    },
    prestamosFiltrados() {
      if (!this.filtroRuta) return this.prestamosAtrasados;
      return this.prestamosAtrasados.filter(p => p.data.Ruta === this.filtroRuta);
    },
    fechaHoy() {
      return new Date();
    },
    fechaFormateada() {
      return format(this.fechaHoy, 'dd/MM/yyyy');
    }
  },
  methods: {
    async cargarPrestamos() {
      try {
        this.loading = true;
        const query = await getDocs(collection(db, "Prestamos"));
        const hoy = new Date();
        
        // Procesar préstamos
        this.prestamos = query.docs.map(doc => {
          const data = doc.data();
          let estaAtrasado = false;
          let diasAtraso = 0;

          if (data.Proximo_Pago && data.Estado && data.Estado.toLowerCase() === "activo") {
            try {
              const fechaPago = parse(data.Proximo_Pago, 'dd/MM/yyyy', new Date());
              estaAtrasado = isAfter(hoy, fechaPago);
              
              if (estaAtrasado) {
                diasAtraso = differenceInDays(hoy, fechaPago);
              }
            } catch (error) {
              console.error("Error al procesar fecha:", error);
            }
          }

          return {
            id: doc.id,
            data: data,
            estaAtrasado: estaAtrasado,
            diasAtraso: diasAtraso
          };
        });
        
        this.calcularEstadisticas();
      } catch (error) {
        console.error("Error al cargar préstamos:", error);
      } finally {
        this.loading = false;
      }
    },
    
    calcularEstadisticas() {
      // Calcular estadísticas por ruta
      const porRuta = {};
      
      this.prestamosAtrasados.forEach(p => {
        const ruta = p.data.Ruta || 'Sin Ruta';
        if (!porRuta[ruta]) {
          porRuta[ruta] = 0;
        }
        porRuta[ruta]++;
      });
      
      this.estadisticas = {
        total: this.prestamosAtrasados.length,
        porRuta: porRuta
      };
      
      // Crear el gráfico después de que el DOM se actualice
      this.$nextTick(() => {
        setTimeout(() => {
          this.crearGrafico();
        }, 200);
      });
    },
    
    crearGrafico() {
      try {
        if (!this.$refs.chartCanvas) {
          console.warn('El elemento canvas no está disponible');
          return;
        }
        
        const ctx = this.$refs.chartCanvas.getContext('2d');
        if (!ctx) {
          console.warn('No se pudo obtener el contexto 2D del canvas');
          return;
        }
        
        // Destruir gráfico anterior si existe
        if (this.chart) {
          this.chart.destroy();
        }
        
        // Preparar datos para el gráfico
        const labels = Object.keys(this.estadisticas.porRuta);
        const data = Object.values(this.estadisticas.porRuta);
        
        // Generar colores
        const colors = this.generarColores(labels.length);
        
        this.chart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: colors,
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  boxWidth: 15,
                  font: {
                    size: 11
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      } catch (error) {
        console.error('Error al crear el gráfico:', error);
      }
    },
    
    formatoMoneda(valor) {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(valor || 0);
    },
    
    generarColores(cantidad) {
      // Base de colores en tonos rojos/naranjas
      const baseColors = [
        '#dc3545', // Rojo Bootstrap
        '#e35d6a',
        '#e97285',
        '#ee889f',
        '#f39eb8',
        '#fd7e14', // Naranja Bootstrap
        '#fe8c2f',
        '#fe9a4a',
        '#fea865',
        '#feb680'
      ];
      
      // Si hay más rutas que colores base, generar colores adicionales
      if (cantidad <= baseColors.length) {
        return baseColors.slice(0, cantidad);
      } else {
        const colors = [...baseColors];
        for (let i = baseColors.length; i < cantidad; i++) {
          // Generar colores aleatorios en tonos rojos/naranjas
          const r = Math.floor(Math.random() * 56) + 200; // 200-255
          const g = Math.floor(Math.random() * 100) + 50; // 50-149
          const b = Math.floor(Math.random() * 50) + 20; // 20-69
          colors.push(`rgb(${r}, ${g}, ${b})`);
        }
        return colors;
      }
    },
    
    exportarPDF() {
      try {
        // Crear nueva instancia de jsPDF
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm'
        });

        // Configuración del título
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(220, 53, 69);
        doc.text('PRÉSTAMOS ATRASADOS ACTIVOS', 105, 15, { align: 'center' });

        // Configuración de la fecha
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Fecha del reporte: ${this.fechaFormateada}`, 105, 22, { align: 'center' });
        
        // Información de filtro
        if (this.filtroRuta) {
          doc.text(`Filtrado por ruta: ${this.filtroRuta}`, 105, 28, { align: 'center' });
        }

        // Configuración de columnas
        const headers = [
          { title: "Cliente", dataKey: "cliente" },
          { title: "Cédula", dataKey: "cedula" },
          { title: "Ruta", dataKey: "ruta" },
          { title: "Monto", dataKey: "monto" },
          { title: "Fecha Pago", dataKey: "fechaPago" },
          { title: "Días Atraso", dataKey: "diasAtraso" }
        ];

        // Preparar datos
        const data = this.prestamosFiltrados.map(p => ({
          cliente: p.data.NombreUsuario,
          cedula: p.data.Cedula,
          ruta: p.data.Ruta,
          monto: this.formatoMoneda(p.data.Prestamo_Inicial),
          fechaPago: p.data.Proximo_Pago,
          diasAtraso: p.diasAtraso.toString()
        }));

        // Configuración de la tabla
        doc.autoTable({
          head: [headers.map(h => h.title)],
          body: data.map(row => headers.map(h => row[h.dataKey])),
          startY: this.filtroRuta ? 35 : 30,
          headStyles: {
            fillColor: [220, 53, 69],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          columnStyles: {
            3: { halign: 'right' },
            5: { halign: 'right', textColor: [220, 53, 69] }
          },
          margin: { top: 30 }
        });
        
        // Añadir resumen por ruta
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Resumen por Ruta:', 14, finalY);
        
        let y = finalY + 8;
        Object.entries(this.rutasOrdenadas).forEach(([ruta, cantidad], index) => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.text(`${ruta}: ${cantidad} préstamos`, 20, y);
          y += 6;
          
          // Si llegamos al final de la página, crear una nueva
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        });

        // Guardar PDF
        doc.save(`Prestamos_Atrasados_${format(this.fechaHoy, 'yyyyMMdd')}.pdf`);
      } catch (error) {
        console.error("Error al exportar a PDF:", error);
        alert("Error al exportar a PDF. Consulta la consola para más detalles.");
      }
    },
    
    exportarExcel() {
      try {
        // Preparar datos para Excel
        const data = this.prestamosFiltrados.map(p => ({
          'Cliente': p.data.NombreUsuario,
          'Cédula': p.data.Cedula,
          'Ruta': p.data.Ruta,
          'Monto': p.data.Prestamo_Inicial,
          'Fecha Pago': p.data.Proximo_Pago,
          'Días Atraso': p.diasAtraso
        }));
        
        // Crear hoja de cálculo
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Préstamos Atrasados");
        
        // Formatear moneda
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const header = XLSX.utils.encode_col(C) + "1";
          if (worksheet[header].v === "Monto") {
            for (let R = range.s.r + 1; R <= range.e.r; ++R) {
              const cell = XLSX.utils.encode_cell({c: C, r: R});
              if (worksheet[cell]) {
                worksheet[cell].z = '"$"#,##0;[Red]"$"#,##0';
              }
            }
          }
        }
        
        // Añadir hoja de resumen
        const resumenData = [
          ['Resumen de Préstamos Atrasados'],
          ['Fecha del reporte:', this.fechaFormateada],
          ['Total de préstamos atrasados:', this.estadisticas.total],
          [''],
          ['Distribución por Ruta:']
        ];
        
        Object.entries(this.rutasOrdenadas).forEach(([ruta, cantidad]) => {
          resumenData.push([ruta, cantidad]);
        });
        
        const resumenWorksheet = XLSX.utils.aoa_to_sheet(resumenData);
        XLSX.utils.book_append_sheet(workbook, resumenWorksheet, "Resumen");
        
        // Guardar archivo
        XLSX.writeFile(workbook, `Prestamos_Atrasados_${format(this.fechaHoy, 'yyyyMMdd')}.xlsx`);
      } catch (error) {
        console.error("Error al exportar a Excel:", error);
        alert("Error al exportar a Excel. Consulta la consola para más detalles.");
      }
    }
  },
  mounted() {
    this.cargarPrestamos();
  }
};
</script>

<style scoped>
.atrasados-container {
  margin-bottom: 1.5rem;
}

.list-group-item {
  transition: background-color 0.2s;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.badge {
  font-size: 0.9rem;
  min-width: 30px;
}

.chart-container {
  margin: 0 auto;
  max-width: 100%;
}

.table th, .table td {
  padding: 0.5rem;
  font-size: 0.9rem;
}

.form-select-sm {
  width: auto;
  min-width: 150px;
}

.btn-sm {
  font-size: 0.8rem;
}
</style>