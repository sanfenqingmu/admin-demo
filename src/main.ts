import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import * as Icons from '@ant-design/icons-vue'
import App from './App.vue'
import router from './router'
import './mock'
import './styles/global.scss'
import { permission, role } from './directives/permission'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)

app.directive('permission', permission)
app.directive('role', role)

for (const [key, component] of Object.entries(Icons)) {
  app.component(key, component as any)
}

app.mount('#app')
