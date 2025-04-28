<template>
    <div class="forgot-container">
      <div class="card">
        <div class="card-body">
          <h2 class="text-center mb-4">Recuperar Contraseña</h2>
          
          <form @submit.prevent="sendResetEmail">
            <div class="form-group">
              <label>Correo Electrónico</label>
              <input v-model="email" type="email" class="form-control" required>
            </div>
            
            <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
              <span v-if="!loading">Enviar enlace</span>
              <span v-else class="spinner-border spinner-border-sm"></span>
            </button>
            
            <div v-if="message" class="alert mt-3" :class="{
              'alert-success': success,
              'alert-danger': !success
            }">
              {{ message }}
            </div>
          </form>
          
          <div class="text-center mt-3">
            <router-link to="/login">Volver a Login</router-link>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { sendPasswordResetEmail } from "firebase/auth";
  import { auth } from "@/firebase";
  
  export default {
    name: 'ForgotPassword',
    data() {
      return {
        email: '',
        loading: false,
        message: '',
        success: false
      }
    },
    methods: {
      async sendResetEmail() {
        this.loading = true;
        this.message = '';
        
        try {
          await sendPasswordResetEmail(auth, this.email);
          this.message = 'Se ha enviado un correo para restablecer tu contraseña';
          this.success = true;
        } catch (err) {
          this.message = this.getErrorMessage(err.code);
          this.success = false;
        } finally {
          this.loading = false;
        }
      },
      getErrorMessage(code) {
        const messages = {
          'auth/invalid-email': 'Correo electrónico inválido',
          'auth/user-not-found': 'Usuario no encontrado'
        };
        return messages[code] || 'Error al enviar el correo';
      }
    }
  }
  </script>
  
  <style scoped>
  .forgot-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
  }
  </style>