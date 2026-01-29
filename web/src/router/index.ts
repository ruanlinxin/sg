import { createRouter, createWebHashHistory } from 'vue-router'
import BaseLayout from '../layout/BaseLayout.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: BaseLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/home/index.vue')
        },
        {
          path: 'table-stats',
          name: 'table-stats',
          component: () => import('@/views/table-stats/index.vue')
        },
        {
          path: 'changelog',
          name: 'changelog',
          component: () => import('@/views/changelog/index.vue')
        },
        
      ]
    }
  ]
})

export default router
