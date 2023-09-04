<template>
  <n-dropdown trigger="click" :options="options" @select="handleSelect">
    <n-button quaternary class="py-2 box-content">
      <avatar size="32px" src="/levi-avatar.jpg" />
      <span class="ml-2 font-medium">{{ fullName }}</span>
    </n-button>
  </n-dropdown>
</template>

<script setup lang="ts">
import { logoutUserFn } from '@/api/authApi';
import { useFamilyMemberQuery, useMeQuery } from '@/stores/query';
import { NDropdown, NButton } from 'naive-ui'
import { computed } from 'vue';
import Avatar from './Avatar.vue'

const { data: user } = useMeQuery()

const enabled = computed(() => !!user.value)

const familyMemberId = computed(() => {
  return user.value?.data.relationships?.familyMember.data.id || ''
})

const { data: familyMember } = useFamilyMemberQuery(familyMemberId, enabled)

const fullName = computed(() => {
  if (!familyMember.value) return 'Loading'
  const { firstName, lastName } = familyMember.value.data.attributes!
  return `${firstName} ${lastName}`
})

const options = [
  {
    label: 'Logout',
    key: 'logout'
  }
]

const optionFns = {
  logout: async () => {
    await logoutUserFn()
    document.location.href = '/login'
  }
}

function handleSelect(key: string) {
  optionFns[key as keyof typeof optionFns]?.()
}
</script>
