import { useMutation, useQuery } from "vue-query";
import { getFamilyFn, getFamilyMemberFn, getMeFn, getUploadFn, getVideoFn, updateUploadFn } from "@/api/authApi";
import { ComputedRef, Ref } from "vue";
import { IUploadInput } from "@/api/types";

export function useMeQuery() {
  return useQuery('me', getMeFn)
}

export function useFamilyQuery(familyId: ComputedRef<string>, enabled?: Ref<boolean>) {
  return useQuery(['family', familyId], () => getFamilyFn(familyId.value), { enabled })
}

export function useFamilyMemberQuery(familyMemberId: ComputedRef<string>, enabled?: Ref<boolean>) {
  return useQuery(['familyMember', familyMemberId], () => getFamilyMemberFn(familyMemberId.value), { enabled })
}

export function useUploadQuery(uploadId: string) {
  return useQuery(['upload', uploadId], () => getUploadFn(uploadId))
}

export function useUploadMutation(uploadId: string) {
  return useMutation((data: IUploadInput) => updateUploadFn(uploadId, data))
}

export function useVideoQuery(videoId: string) {
  return useQuery(['video', videoId], () => getVideoFn(videoId))
}
