<template>
    <div class="mapa-container">
      <GoogleMap
        :center="center"
        :zoom="zoom"
        style="width: 100%; height: 300px"
      >
        <Marker :options="{ position: center }" />
      </GoogleMap>
      <div class="text-center mt-2">
        <small class="text-muted">{{ coordenadasFormateadas }}</small>
      </div>
    </div>
  </template>
  
  <script>
  import { GoogleMap, Marker } from 'vue3-google-map'
  
  export default {
    components: { GoogleMap, Marker },
    props: {
      ubicacion: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        zoom: 15
      }
    },
    computed: {
      center() {
        return { 
          lat: parseFloat(this.ubicacion[0]), 
          lng: parseFloat(this.ubicacion[1]) 
        }
      },
      coordenadasFormateadas() {
        return `Latitud: ${this.ubicacion[0]}, Longitud: ${this.ubicacion[1]}`
      }
    }
  }
  </script>
  
  <style scoped>
  .mapa-container {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    margin: 10px 0;
  }
  </style>