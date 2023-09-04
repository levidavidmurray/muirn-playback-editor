import { getMeFn } from '@/api/authApi'
import { NavigationGuardNext } from 'vue-router'

export default async function requireUnauth({ next, authStore }: { next: NavigationGuardNext; authStore: any }) {
  try {
    const response = await getMeFn()
    const user = response.data
    authStore.setAuthUser(user)

    if (user) {
      return next({
        name: 'home',
      })
    }
  } catch (error) {
    return next()
  }

  return next()
}
