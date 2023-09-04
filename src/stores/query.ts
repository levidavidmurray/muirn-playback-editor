import { useQuery } from "vue-query";
import { getFamilyFn, getFamilyMemberFn, getMeFn } from "@/api/authApi";
import { ComputedRef, Ref } from "vue";

export function useMeQuery() {
  return useQuery('me', getMeFn)
}

export function useFamilyQuery(familyId: ComputedRef<string>, enabled?: Ref<boolean>) {
  return useQuery(['family', familyId], () => getFamilyFn(familyId.value), { enabled })
}

export function useFamilyMemberQuery(familyMemberId: ComputedRef<string>, enabled?: Ref<boolean>) {
  return useQuery(['familyMember', familyMemberId], () => getFamilyMemberFn(familyMemberId.value), { enabled })
}
