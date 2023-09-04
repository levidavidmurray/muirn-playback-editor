export interface IUser {
  email: string
  id: string
}

export interface GenericResponse {
  status: string
  message: string
}

export interface ILoginInput {
  email: string
  password: string
}

export interface ISignUpInput {
  email: string
  password: string
  passwordConfirm: string
}

export interface ILoginResponse {
  status: string
  access_token: string
}

export interface IUserResponse {
  status: string
  data: {
    user: IUser
  }
}

export interface VideoResultDto {
  id?: string
  title?: string
  thumbnail_url?: string
  video_url?: string
  uploader?: {
    id?: string
    name?: string
    avatar_url?: string
  }
}
