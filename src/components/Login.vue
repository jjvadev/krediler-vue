<template>
    <div class="login-container">
      <div class="card">
        <div class="card-body">
          <h2 class="text-center mb-4">Iniciar Sesión</h2>
          
          <form @submit.prevent="login">
            <div class="form-group">
              <label>Correo Electrónico</label>
              <input v-model="email" type="email" class="form-control" required>
            </div>
            
            <div class="form-group">
              <label>Contraseña</label>
              <input v-model="password" type="password" class="form-control" required>
            </div>
            
            <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
              <span v-if="!loading">Ingresar</span>
              <span v-else class="spinner-border spinner-border-sm"></span>
            </button>
            
            <div v-if="error" class="alert alert-danger mt-3">
              {{ error }}
            </div>
          </form>
          
          <div class="text-center mt-3">
            <router-link to="/forgot-password">¿Olvidaste tu contraseña?</router-link>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { signInWithEmailAndPassword } from "firebase/auth";
  import { auth } from "@/firebase";
  
  export default {
    name: 'LoginPage',
    data() {
      return {
        email: '',
        password: '',
        loading: false,
        error: ''
      }
    },
    methods: {
      async login() {
        this.loading = true;
        this.error = '';
        
        try {
          await signInWithEmailAndPassword(auth, this.email, this.password);
          this.$router.push('/');
        } catch (err) {
          this.error = this.getErrorMessage(err.code);
        } finally {
          this.loading = false;
        }
      },
      getErrorMessage(code) {
        const messages = {
          'auth/invalid-email': 'Correo electrónico inválido',
          'auth/user-disabled': 'Cuenta deshabilitada',
          'auth/user-not-found': 'Usuario no encontrado',
          'auth/wrong-password': 'Contraseña incorrecta',
          'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.'
        };
        return messages[code] || 'Error al iniciar sesión';
      }
    }
  }
  </script>
  
  <style scoped>
  .login-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .card {
    border: none;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .btn-block {
    width: 100%;
    padding: 0.5rem;
  }
  </style>