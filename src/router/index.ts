import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/macae-dashboard',
      name: 'macae-dashboard',
      component: () => import('../views/MacaeViews/DashboardView.vue')
    }
  ],
})

export default router
