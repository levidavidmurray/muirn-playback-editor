import { IUserRecord } from '@/api/types'
import { defineStore } from 'pinia'

export type AuthStoreState = {
  authUser: IUserRecord | null
}

export const useAuthStore = defineStore({
  id: 'auth',
  state: (): AuthStoreState => ({
    authUser: null,
  }),
  getters: {},
  actions: {
    setAuthUser(user: IUserRecord | null) {
      this.authUser = user
    },
  },
})
