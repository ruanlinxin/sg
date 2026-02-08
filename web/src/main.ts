import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import 'virtual:uno.css'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ArcoVue)

app.mount('#app')
