<template>
  <el-container class="home-container">
<!--    头部区域-->
    <el-header>
      <div>
        <img src="../assets/head_icon.jpg" alt="" class="head_icon">
        <span>目标意图事理图谱构建与事件预测系统</span>
      </div>
      <el-button type="info" @click="logout">退出登录</el-button>
    </el-header>
<!--    页面主体区-->
    <el-container>
<!--      侧边栏-->
      <el-aside :width="isCollapse?'64px':'250px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
<!--        侧边栏菜单区-->
        <el-menu background-color="#333744" text-color="#fff"
          active-text-color="#409eff" unique-opened :collapse="isCollapse"
        :collapse-transition="false" router
        :default-active="$route.path">
<!--          上面原来是="activeMenu()"-->
<!--          一级菜单-->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
<!--            一级菜单的模板区域-->
            <template slot="title">
<!--              图标-->
              <i :class="iconsObj[item.id]"></i>
<!--              文本-->
              <span>{{ item.name }}</span>
            </template>
<!--              二级菜单-->
            <el-menu-item :index="subItem.path" v-for="subItem in item.children"
            :key="subItem.id">
              <template slot="title">
              <!--              图标-->
<!--              <i class="el-icon-menu"></i>-->
              <!--              文本-->
              <span>{{ subItem.name }}</span>
            </template></el-menu-item>
          </el-submenu>

        </el-menu>
      </el-aside>
<!--      右侧内容主体-->
      <el-main>
<!--        路由占位符-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "Home",
  data(){
    return{
      menulist:[
        {
          id:0,
          name:"空中目标情报知识模型",
          children:[
            {
              id:3,
              name:"目标属性特征知识图谱",
              path:"/attributeAtlas"
            },
            {
              id:4,
              name:"目标意图事理图谱",
              path:"/intentionAtlas"
            }
          ]
        },
        {
          id:1,
          name:"空中目标辅助决策服务",
          children:[
            {
              id:5,
              name:"目标属性研判",
              path:"/attributeJudgement"
            },
            {
              id:6,
              name:"目标意图分析",
              path:"/intentionJudgement"
            }
          ]
        },
        {
          id:2,
          name:"空中目标威胁评估服务",
          children:[
            {
              id:7,
              name:"目标威胁评估",
              path:"/threatAssessment"
            }
          ]
        }
      ],
      iconsObj:{
        '0':'el-icon-notebook-1',
        '1':'el-icon-data-analysis',
        '2':'el-icon-menu',
      },
    //  是否折叠
      isCollapse:false,
      //被激活的链接地址
      // activePath:'',
    }
  },
  // mounted(){
  //   this.activePathTest=window.location.pathname
  // },
  methods:{
    logout(){
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // async getMenuList(){
    //   const{data:res}=await this.$http.get('menus')
    //   if(res.meta.status!=200) return this.$message.error(res.meta.msg)
    //   this.menulist=res.data
    // },
    toggleCollapse(){
      this.isCollapse=!this.isCollapse
    },
  //  保存链接的激活状态
  //   saveNavState(activePath){
  //     window.sessionStorage.setItem('activePath',activePath)
  //     this.activePath=activePath
  //   },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      console.log(meta);
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
  },
  created(){
    // this.getMenuList()
    // this.activePath=window.sessionStorage.getItem('activePath')

  }
}
</script>

<style lang="less" scoped>
  .home-container{
    height: 100%;
  }
  .el-header{
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: white;
    font-size: 20px;
    >div{
      display: flex;
      align-items: center;
      span{
        margin-left: 15px;
      }
    }
  }
  .el-aside{
    background-color: #333744;
    .el-menu{
      border-right:none;
    }
  }
  .el-main{
    background-color: #eaedf1;
  }
  .head_icon{
    width: 60px;
    height: 60px;
  }
  .toggle-button{
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: white;
    text-align: center;
    letter-spacing: 0.2em;
    cursor:pointer;
  }

</style>
