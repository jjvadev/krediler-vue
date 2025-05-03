import { createStore } from 'vuex';
import { auth } from '@/firebase';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

// Configurar persistencia
setPersistence(auth, browserLocalPersistence);

export default createStore({
  modules: {
    auth: {
      namespaced: true,
      state: {
        user: null,
        token: null
      },
      getters: {
        isAuthenticated: state => !!state.user,
        currentUser: state => state.user
      },
      mutations: {
        SET_USER(state, user) {
          state.user = user;
        },
        SET_TOKEN(state, token) {
          state.token = token;
        },
        CLEAR_AUTH(state) {
          state.user = null;
          state.token = null;
        }
      },
      actions: {
        async checkAuth({ commit }) {
          return new Promise((resolve) => {
            auth.onAuthStateChanged(user => {
              if (user) {
                commit('SET_USER', user);
                user.getIdToken().then(token => {
                  commit('SET_TOKEN', token);
                  localStorage.setItem('authToken', token);
                  localStorage.setItem('user', JSON.stringify(user));
                });
              } else {
                commit('CLEAR_AUTH');
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
              }
              resolve();
            });
          });
        },
        
        async login({ dispatch }, { email, password }) {
          try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            await dispatch('checkAuth');
            return userCredential;
          } catch (error) {
            throw error;
          }
        },
        
        async logout({ commit }) {
          try {
            await auth.signOut();
            commit('CLEAR_AUTH');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          } catch (error) {
            throw error;
          }
        }
      }
    }
  }
});