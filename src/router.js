import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Rankings from './views/Rankings.vue'
import Login from './views/Login.vue'
import Live from './views/Live.vue'
import Profile from './views/Profile.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/',
      name: 'live',
      component: Live
    },
    {
      path: '/rankings',
      name: 'rankings',
      component: Rankings
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    }

  ]
})
