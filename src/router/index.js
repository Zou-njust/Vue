import Vue from 'vue'
import Router from 'vue-router'
import Login from "../components/Login";
import Home from "../components/Home";
import Welcome from "../components/Welcome";
import AttributeAtlas from "../components/model/AttributeAtlas";
import IntentionAtlas from "../components/model/IntentionAtlas";
import AttributeJudgement from "../components/decision/AttributeJudgement";
import IntentionJudgement from "../components/decision/IntentionJudgement";
import ThreatAssessment from "../components/threat/ThreatAssessment";

Vue.use(Router)

const router = new Router({
  routes: [
    {path:'/',redirect:'/login'},
    {path:'/login',component:Login},
    {
      path:'/home',
      component: Home,
      redirect: '/attributeAtlas',
      children:[{path:'/welcome',component: Welcome},
        {path:'/attributeAtlas',component: AttributeAtlas},
        {path:'/intentionAtlas',component: IntentionAtlas},
        {path:'/attributeJudgement',component: AttributeJudgement},
        {path:'/intentionJudgement',component: IntentionJudgement},
        {path:'/threatAssessment',component: ThreatAssessment},
      ]
    },
  ]
})

//挂载路由导航守卫
router.beforeEach((to,from,next)=>{
//  to:将要访问的路径
//  from:从哪个路径跳转而来
//  next:表示放行
//  next()放行  next('/login') 强制跳转
  if(to.path=='/login') return next();

//  获取tokon
//   const tokenStr = window.sessionStorage.getItem('token');
//   if(!tokenStr) return next('/login');
  next();
})


export default router
