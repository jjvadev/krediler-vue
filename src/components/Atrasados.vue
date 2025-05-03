<template>
  <div class="container py-3">
    <h2 class="text-danger text-center mb-4">
      <i class="bi bi-exclamation-triangle"></i> Préstamos Atrasados Activos
    </h2>

    <div class="alert alert-light text-center mb-3">
      <strong>Fecha de hoy:</strong> {{ hoyFormateado }}
    </div>

    <!-- Filtros -->
    <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label">Filtrar por ruta:</label>
        <select v-model="filtroRuta" class="form-select">
          <option value="">Todas las rutas</option>
          <option v-for="ruta in rutasUnicas" :key="ruta" :value="ruta">{{ ruta }}</option>
        </select>
      </div>
      <div class="col-md-6 d-flex align-items-end justify-content-end">
        <button class="btn btn-danger me-2" @click="exportarPDF">
          <i class="bi bi-file-earmark-pdf"></i> Exportar PDF
        </button>
        <button class="btn btn-success" @click="exportarExcel">
          <i class="bi bi-file-earmark-excel"></i> Exportar Excel
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border text-danger" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <div v-else-if="prestamosFiltrados.length === 0" class="alert alert-success">
      <i class="bi bi-check-circle"></i> No hay préstamos atrasados activos
    </div>

    <div v-else class="table-responsive">
      <table class="table table-hover" id="tablaPrestamos">
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
          <tr v-for="p in prestamosFiltrados" :key="p.id">
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
import 'jspdf-autotable';
import { jsPDF } from "jspdf";
import * as XLSX from 'xlsx';

export default {
  name: "PrestamosAtrasadosActivos",
  data() {
    return {
      prestamos: [],
      hoy: new Date(),
      loading: true,
      filtroRuta: ""
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
    },
    prestamosFiltrados() {
      if (!this.filtroRuta) return this.prestamosAtrasados;
      return this.prestamosAtrasados.filter(p => 
        p.data.Ruta === this.filtroRuta
      );
    },
    rutasUnicas() {
      const rutas = this.prestamosAtrasados.map(p => p.data.Ruta);
      return [...new Set(rutas)].sort();
    }
  },
  methods: {
    exportarPDF() {
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
      doc.text(`Fecha del reporte: ${this.hoyFormateado}`, 105, 22, { align: 'center' });

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
        startY: 30,
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

      // Guardar PDF
      doc.save(`Prestamos_Atrasados_${format(this.hoy, 'yyyyMMdd')}.pdf`);
    },
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
    },
    exportarPDF() {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.setTextColor(220, 53, 69); // Rojo
      doc.text('Préstamos Atrasados Activos', 105, 15, { align: 'center' });
      
      // Fecha
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Negro
      doc.text(`Fecha de reporte: ${this.hoyFormateado}`, 105, 25, { align: 'center' });
      
      // Filtro aplicado
      if (this.filtroRuta) {
        doc.text(`Filtrado por ruta: ${this.filtroRuta}`, 105, 32, { align: 'center' });
      }
      
      // Datos
      const headers = [
        'Cliente', 
        'Cédula', 
        'Ruta', 
        'Monto', 
        'Fecha Pago', 
        'Días Atraso'
      ];
      
      const data = this.prestamosFiltrados.map(p => [
        p.data.NombreUsuario,
        p.data.Cedula,
        p.data.Ruta,
        this.formatoMoneda(p.data.Prestamo_Inicial),
        p.data.Proximo_Pago,
        p.diasAtraso.toString()
      ]);
      
      doc.autoTable({
        head: [headers],
        body: data,
        startY: 40,
        styles: {
          halign: 'center',
          valign: 'middle'
        },
        columnStyles: {
          3: { halign: 'right' },
          5: { halign: 'right', textColor: [220, 53, 69] }
        },
        headStyles: {
          fillColor: [220, 53, 69],
          textColor: [255, 255, 255]
        }
      });
      
      doc.save(`Prestamos_Atrasados_${format(this.hoy, 'yyyyMMdd')}.pdf`);
    },
    exportarExcel() {
      const data = this.prestamosFiltrados.map(p => ({
        'Cliente': p.data.NombreUsuario,
        'Cédula': p.data.Cedula,
        'Ruta': p.data.Ruta,
        'Monto': p.data.Prestamo_Inicial,
        'Fecha Pago': p.data.Proximo_Pago,
        'Días Atraso': p.diasAtraso
      }));
      
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
      
      XLSX.writeFile(workbook, `Prestamos_Atrasados_${format(this.hoy, 'yyyyMMdd')}.xlsx`);
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