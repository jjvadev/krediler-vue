<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <router-link to="/" class="navbar-brand">Mi App</router-link>
        
        <div class="collapse navbar-collapse">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item dropdown" v-if="user">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown">
                {{ user.email }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><button class="dropdown-item" @click="logout">Cerrar Sesión</button></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </template>
  
  <script>
  import { signOut } from "firebase/auth";
  import { auth } from "@/firebase";
  
  export default {
    name: 'AppNavbar',
    data() {
      return {
        user: null
      }
    },
    created() {
      auth.onAuthStateChanged(user => {
        this.user = user;
      });
    },
    methods: {
      async logout() {
        try {
          await signOut(auth);
          this.$router.push('/login');
        } catch (error) {
          console.error("Error al cerrar sesión:", error);
        }
      }
    }
  }
  </script>