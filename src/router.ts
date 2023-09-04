import { createRouter, createWebHistory } from 'vue-router'

import Upload from '@/pages/Upload.vue'
import About from '@/pages/About.vue'
import FamilyHome from './pages/FamilyHome.vue'

const routes = [
  {
    path: '/',
    component: FamilyHome,
    meta: {
      title: 'Muirn | Family Memories',
    },
  },
  {
    path: '/login/',
    component: () => import('@/pages/Login.vue'),
  },
  {
    path: '/signup/',
    component: () => import('@/pages/SignUp.vue'),
  },
  {
    path: '/upload/',
    component: Upload,
    meta: {
      title: 'Upload',
    },
  },
  {
    path: '/about/',
    component: About,
    meta: {
      title: 'About',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
