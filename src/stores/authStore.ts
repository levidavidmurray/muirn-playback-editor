import { defineStore } from 'pinia'
import { IUser } from '../api/types'

export type AuthStoreState = {
  authUser: IUser | null
}

export const useAuthStore = defineStore({
  id: 'auth',
  state: (): AuthStoreState => ({
    authUser: null,
  }),
  getters: {},
  actions: {
    setAuthUser(user: IUser | null) {
      this.authUser = user
    },
  },
})
