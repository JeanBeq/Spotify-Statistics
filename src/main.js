import { createApp } from 'vue'
import App from './App.vue'
import * as VueRouter from 'vue-router'
import Home from './pages/home.vue'
import Callback from './pages/callback.vue'
import './style.css'
import { createRouter, createWebHistory } from 'vue-router'
const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home
        },
        {
            path: '/callback',
            name: 'Callback',
            component: Callback
        }
      ]
    })
export default router
const app = createApp(App)
app.use(router).mount('#app')