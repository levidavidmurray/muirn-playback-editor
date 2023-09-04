import axios from 'axios'
import { IMessageResponse, ILoginInput, ILoginResponse, ISignUpInput, IUserResponse, IFamilyResponse, IFamilyMemberResponse } from './types'
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

authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers['Authorization'] = `${token}`
  }
  return config
})

authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
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
  const response = await authApi.post<IMessageResponse>('/signup', { user })
  return response.data
}

export const loginUserFn = async (user: ILoginInput) => {
  const response = await authApi.post<IMessageResponse>('/login', { user })

  const token = response.headers['authorization']
  if (token) {
    localStorage.setItem('accessToken', token)
  }

  return response.data
}

export const logoutUserFn = async () => {
  localStorage.removeItem('accessToken')
  // const response = await authApi.get<GenericResponse>('/logout')
  // return response.data
}

export const getMeFn = async () => {
  const response = await authApi.get<IUserResponse>('/me', {
    headers: { 'Cache-Control': 'no-cache' },
  })
  return response.data
}

export const getFamilyFn = async (familyId: string) => {
  const response = await authApi.get<IFamilyResponse>(`/families/${familyId}`)
  return response.data
}

export const getFamilyMemberFn = async (familyMemberId: string) => {
  const response = await authApi.get<IFamilyMemberResponse>(`/family_members/${familyMemberId}`)
  return response.data
}
