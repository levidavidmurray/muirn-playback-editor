<template>
  <base-template title="Login">
    <section class="py-8 grid place-items-center">
      <div>
        <n-form
          ref="formRef"
          class="w-screen max-w-md mx-auto"
          @submit="onSubmit"
          :label-width="80"
          :model="formValue"
          :rules="rules"
        >
          <n-alert v-if="submissionError" class="mb-4" type="error" :title="submissionError.title">
            {{ submissionError.message }}
          </n-alert>
          <n-form-item label="Email" path="user.email" required>
            <n-input v-model:value="formValue.user.email" placeholder="Email" />
          </n-form-item>
          <n-form-item label="Password" path="user.password">
            <n-input v-model:value="formValue.user.password" type="password" placeholder="Password" />
          </n-form-item>
          <span class="block"
            >Don't have an account?
            <router-link to="/signup" class="text-primary-600">Sign Up Now!</router-link>
          </span>
          <n-button class="mt-4" :loading="isLoading" attr-type="submit">Sign Up</n-button>
        </n-form>
      </div>
    </section>
  </base-template>
</template>

<script setup lang="ts">
import BaseTemplate from './BaseTemplate.vue'
import { useMutation } from 'vue-query'
import { loginUserFn } from '@/api/authApi'
import type { ILoginInput } from '@/api/types'
import { FormInst, useMessage, NForm, NFormItem, NInput, NButton, NAlert } from 'naive-ui'
import { ref } from 'vue'

const formRef = ref<FormInst | null>(null)
const message = useMessage()
const submissionError = ref<{ title: string; message: string } | null>(null)

const formValue = ref({
  user: {
    email: '',
    password: '',
  },
})

const rules = {
  user: {
    email: {
      required: true,
      message: 'Please input your email',
      trigger: 'blur',
    },
    password: {
      required: true,
      message: 'Please input your password',
    },
  },
}

const { isLoading, mutate } = useMutation((credentials: ILoginInput) => loginUserFn(credentials), {
  onError: (error) => {
    if (!(error as any).response) {
      submissionError.value = { title: 'Something went wrong', message: 'Please try again later' }
      return
    }
    let message = (error as any).response.data
    if (typeof message === 'object') {
      message = message.message
    }
    submissionError.value = {
      title: 'Submission Error',
      message: message || 'Something went wrong',
    }
  },
  onSuccess: (data) => {
    message.success(data.status)
  },
})

const onSubmit = async (event: Event) => {
  event.preventDefault()
  try {
    await formRef.value?.validate()
  } catch (error) {
    console.log(error)
    return
  }
  mutate({ ...formValue.value.user })
}
</script>
