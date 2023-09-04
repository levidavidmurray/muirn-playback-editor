import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from 'vue-query'
import App from './App.vue'
import router from './router'
import { createHead } from '@vueuse/head'
import './index.css'

const head = createHead()
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin)
app.use(head)

app.mount('#app')
