/* Generics */
export interface IData<T> {
  data: T
}

export interface IRecord<T = {}> {
  id: string
  type: string
  attributes?: T
}

export interface IRootRecord<T, K> extends IRecord<T> {
  relationships?: K
}

/* API Responses */

export type IUserRecord = IRootRecord<{ email: string }, {
  family: IData<IRecord>
  familyMember: IData<IRecord>
  familyUser: IData<IRecord>
}>

export type IUserResponse = IData<IUserRecord>

export type IFamilyRecord = IRootRecord<{ name: string }, {
  familyMembers: IData<IRecord[]>
}>

export type IFamilyResponse = IData<IFamilyRecord>

export type IFamilyMemberRecord = IRootRecord<{
  firstName: string
  lastName: string
  dateOfBirth: string
}, {
  family: IData<IRecord>
}>

export type IFamilyMemberResponse = IData<IFamilyMemberRecord>

export type IVideoRecord = IRootRecord<{
  title: string
  date: string
  manifestUrl: string
  thumbnailUrl: string
}, {
  user: IData<IRecord>
  family: IData<IRecord>
}>

export type IVideoResponse = IData<IVideoRecord>

export type IVideosResponse = IData<Array<IVideoRecord>>

export interface IVideoInput {
  title: string
  date: string
  family_id?: string
}

export type IUploadRecord = IRootRecord<{
  date: string
  status: string
  title: string
}, {
  user: IData<IRecord>
}>

export type IUploadResponse = IData<IVideoRecord>

export interface IUploadInput {
  title: string
  date: number
}

export interface IMessageResponse {
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
  message: string
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
