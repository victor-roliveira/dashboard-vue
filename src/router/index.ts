import Allocations from '@/views/Allocations.vue'
import DashboardView from '@/views/MacaeViews/DashboardView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/controle-engenharia',
      name: 'controle-engenharia',
      component: DashboardView
    },
    {
      path: '/alocacoes',
      name: 'alocacoes',
      component: Allocations
    }
  ],
})

export default router
