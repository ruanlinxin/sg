import { createRouter, createWebHistory } from 'vue-router'
import BaseLayout from '../layout/BaseLayout.vue'
import GameSettings from '../views/GameSettings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: BaseLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: ()=> import('../views/home/index.vue')
        },
        {
          path: 'game-settings',
          name: 'game-settings',
          component: GameSettings
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/About.vue')
        }
      ]
    }
  ]
})

export default router
