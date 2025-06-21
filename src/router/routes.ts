import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/views/LoginView.vue')
  },

  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    redirect: '/welcome',
    children: [
      {
        path: 'mapping',
        component: () => import('@/views/MappingView.vue')
      },
      {
        path: 'mapping-mark',
        component: () => import('@/views/MappingMarkView.vue')
      },
      {
        path: 'robotmode',
        component: () => import('@/views/RobotModeView.vue')
      },
      {
        path: 'staff',
        component: () => import('@/views/StaffView.vue')
      },
      {
        path: 'log',
        component: () => import('@/views/LogView.vue')
      },
      {
        path: 'welcome',
        component: () => import('@/pages/Welcome.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/ErrorNotFound.vue')
  }
]

export default routes
