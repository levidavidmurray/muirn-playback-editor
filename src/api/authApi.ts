import axios from 'axios'
import { GenericResponse, ILoginInput, ILoginResponse, ISignUpInput } from './types'
const BASE_URL = 'http://localhost:3000'

const authApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

authApi.defaults.headers.common['Content-Type'] = 'application/json'

export const refreshAccessTokenFn = async () => {
  const response = await authApi.get<ILoginResponse>('auth/refresh')
  return response.data
}

authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    // if (error.message == 'Network Error') {

    // }
    const errMessage = error.response?.data?.message as string
    if (errMessage?.includes('not logged in') && !originalRequest._retry) {
      originalRequest._retry = true
      await refreshAccessTokenFn()
      return authApi(originalRequest)
    }
    return Promise.reject(error)
  }
)

export const signUpUserFn = async (user: ISignUpInput) => {
  const response = await authApi.post<GenericResponse>('/signup', { user })
  return response.data
}

export const loginUserFn = async (user: ILoginInput) => {
  const response = await authApi.post<ILoginResponse>('/login', { user })
  return response.data
}

export const logoutUserFn = async () => {
  const response = await authApi.get<GenericResponse>('/logout')
  return response.data
}

export const getMeFn = async () => {
  const response = await authApi.get('/me')
  return response.data
}
