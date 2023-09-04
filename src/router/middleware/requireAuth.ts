import { getMeFn } from '@/api/authApi'
import { NavigationGuardNext } from 'vue-router'

export default async function requireAuth({ next, authStore }: { next: NavigationGuardNext; authStore: any }) {
  try {
    const response = await getMeFn()
    const user = response.data
    authStore.setAuthUser(user)

    if (!user) {
      return next({
        name: 'login',
      })
    }
  } catch (error) {
    document.location.href = '/login'
  }

  return next()
}
