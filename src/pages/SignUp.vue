<template>
  <base-template title="Sign Up">
    <section class="py-8 grid place-items-center">
      <div>
        <h1 class="text-4xl xl:text-6xl text-center font-bold text-primary-500 mb-4">Welcome to Muirn!</h1>
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
          <n-form-item label="Confirm Password" path="user.passwordConfirm">
            <n-input v-model:value="formValue.user.passwordConfirm" type="password" placeholder="Confirm Password" />
          </n-form-item>
          <span class="block"
            >Already have an account?
            <router-link to="/login" class="text-primary-600">Login Here</router-link>
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
import { signUpUserFn } from '@/api/authApi'
import type { ISignUpInput } from '@/api/types'
import router from '@/router'
import { FormInst, useMessage, NForm, NFormItem, NInput, NButton, FormItemRule, NAlert } from 'naive-ui'
import { ref } from 'vue'

const formRef = ref<FormInst | null>(null)
const message = useMessage()
const submissionError = ref<{ title: string; message: string } | null>(null)

const formValue = ref({
  user: {
    email: '',
    password: '',
    passwordConfirm: '',
  },
})

function validatePasswordStartWith(rule: FormItemRule, value: string): boolean {
  return (
    !!formValue.value.user.password &&
    formValue.value.user.password.startsWith(value) &&
    formValue.value.user.password.length >= value.length
  )
}

function validatePasswordSame(rule: FormItemRule, value: string): boolean {
  return value === formValue.value.user.password
}

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
    passwordConfirm: [
      {
        required: true,
        message: 'Please re-type your password',
        trigger: ['blur', 'input'],
      },
      {
        validator: validatePasswordStartWith,
        message: 'Passwords must match',
        trigger: 'input',
      },
      {
        validator: validatePasswordSame,
        message: 'Passwords must match',
        trigger: ['blur', 'password-input'],
      },
    ],
  },
}

const { isLoading, mutate } = useMutation((credentials: ISignUpInput) => signUpUserFn(credentials), {
  onError: (error) => {
    if (!(error as any).response) {
      submissionError.value = { title: 'Something went wrong', message: 'Please try again later' }
      return
    }
    if ((error as any).response.data.status.message) {
      submissionError.value = {
        title: 'Submission Error',
        message: (error as any).response.data.status.message,
      }
    }
  },
  onSuccess: (data) => {
    router.push('/login')
    message.success(data.message)
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
  console.log('submit!')
  mutate({ ...formValue.value.user })
}
</script>
