(function(){var e,o,n,u,p,r,t,c,s,m,a,v,i,d,q,k,h,b;q=require("vue"),h=require("vue-router"),k=require("vue-async-data"),s=require("../vues/Navbar.vue"),v=require("../vues/SignIn.vue"),i=require("../vues/SignUp.vue"),u=require("../vues/DeletePopup.vue"),m=require("../vues/Popup.vue"),n=require("../vues/Dashboard.vue"),d=require("../vues/Tasks.vue"),t=require("../vues/Mockups.vue"),r=require("../vues/Mockup.vue"),o=require("../vues/Chat.vue"),q.config.debug=!1,q.use(h),q.use(k),e=q.extend({}),b=new h,c=q.component("navbar",s),v=q.component("signin-component",v),i=q.component("signup-component",i),p=q.component("delete-popup",u),a=q.component("popup",m),n=q.component("dashboard-component",n),d=q.component("tasks-component",d),t=q.component("mockups-component",t),r=q.component("mockup-component",r),o=q.component("chat-component",o),b.redirect({"/":"/dashboard"}),b.map({"/dashboard":{component:n},"/tasks":{component:d},"/mockups":{component:t},"/mockups/:id":{component:r},"/chat":{component:o}}),b.start(e,"#app")}).call(this);