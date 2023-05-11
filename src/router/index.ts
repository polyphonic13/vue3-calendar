import { createRouter, createWebHistory } from 'vue-router'
import Calendar from '../views/Calendar.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'calendar',
            component: Calendar
        },
    ]
})

export default router
