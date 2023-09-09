import { createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

import { useAuthStore } from './stores/authStore'
import middlewarePipeline from './router/middlewarePipeline'
import requireAuth from './router/middleware/requireAuth'
import requireUnauth from './router/middleware/requireUnauth'

const routes = [
  {
    name: 'login',
    path: '/login',
    component: () => import('@/pages/Login.vue'),
    meta: {
      middleware: [requireUnauth]
    }
  },
  {
    name: 'signup',
    path: '/signup',
    component: () => import('@/pages/SignUp.vue'),
    meta: {
      middleware: [requireUnauth]
    }
  },
  {
    name: 'home',
    path: '/',
    component: () => import('@/pages/FamilyHome.vue'),
    meta: {
      title: 'My Family',
      middleware: [requireAuth],
    },
  },
  {
    name: 'newUpload',
    path: '/uploads/new',
    component: () => import('@/pages/UploadNew.vue'),
    meta: {
      title: 'Upload',
      middleware: [requireAuth],
    },
  },
  {
    name: 'upload',
    path: '/uploads/:uploadId',
    component: () => import('@/pages/UploadStatus.vue'),
    meta: {
      title: 'Upload',
      middleware: [requireAuth],
    },
  },
  {
    name: 'videoView',
    path: '/videos/:id',
    component: () => import('@/pages/VideoView.vue'),
    meta: {
      title: 'Video Player',
    },
  },
  {
    name: 'videoEdit',
    path: '/videos/:id/edit',
    component: () => import('@/pages/VideoEdit.vue'),
    meta: {
      title: 'Video Edit',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const authStore = useAuthStore()

  if (!to.meta.middleware) {
    return next()
  }

  const middleware = to.meta.middleware as any

  const context = { to, from, next, authStore }

  return middleware[0]({
    ...context,
    next: middlewarePipeline(context, middleware, 1),
  })
})

export default router
