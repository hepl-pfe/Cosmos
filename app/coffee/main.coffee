Vue = require "vue"
VueRouter = require "vue-router"
VueAsyncData = require "vue-async-data"

SignInView = require "../vues/SignIn.vue"
SignUpView = require "../vues/SignUp.vue"
Popup = require "../vues/Popup.vue"
TasksView = require "../vues/Tasks.vue"

Vue.config.debug = false

Vue.use VueRouter
Vue.use VueAsyncData

App = Vue.extend {}

router = new VueRouter()

SignInView  = Vue.component "signin-component", SignInView
SignUpView  = Vue.component "signup-component", SignUpView
PopupView    = Vue.component "popup", Popup
TasksView   = Vue.component "tasks-component", TasksView

router.redirect { "/": "/tasks" }

router.map {
    '/signin':
        component: SignInView
    '/signup':
        component: SignUpView
    '/tasks':
        component: TasksView
}

router.start App, "#app"
