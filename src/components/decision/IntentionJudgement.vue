<template>
  <div>
    <!--    面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>决策服务</el-breadcrumb-item>
      <el-breadcrumb-item>意图识别</el-breadcrumb-item>
    </el-breadcrumb>
    <el-row>
      <el-col :span="9">
        <el-card style="margin-top:20px;margin-left:40px;margin-right:10px">
          <div slot="header" class="clearfix">
            <span style="font-weight: 700">目标意图识别输入</span>
          </div>
          <div style="width: 500px;margin-top: 50px">
            <span>飞机类型</span>
            <el-select v-model="planeType" placeholder="请选择飞机类型" style="width: 300px">
              <el-option
                v-for="item in planeOption"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </div>
          <div style="width: 500px;margin-top: 50px">
            <span>飞机型号</span>
            <el-input v-model="planeName" style="width: 300px"></el-input>
          </div>
          <div class="action">
            <span>t1时刻：</span>
            <el-select v-model="chosenAction.t1Action" placeholder="请选择目标t1时刻的战术动作" class="actionSelect">
              <el-option
                v-for="item in setAction"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </div>
          <div class="action">
            <span>t2时刻：</span>
            <el-select v-model="chosenAction.t2Action" placeholder="请选择目标t2时刻的战术动作" class="actionSelect">
              <el-option
                v-for="item in setAction"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </div>
          <div class="action">
            <span>t3时刻：</span>
            <el-select v-model="chosenAction.t3Action" placeholder="请选择目标t3时刻的战术动作" class="actionSelect">
              <el-option
                v-for="item in setAction"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </div>
          <div class="action">
            <span>t4时刻：</span>
            <el-select v-model="chosenAction.t4Action" placeholder="请选择目标t4时刻的战术动作" class="actionSelect">
              <el-option
                v-for="item in setAction"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </div>
          <div class="action">
            <span>t5时刻：</span>
            <el-select v-model="chosenAction.t5Action" placeholder="请选择目标t5时刻的战术动作" class="actionSelect">
              <el-option
                v-for="item in setAction"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </div>
          <div style="text-align: center;margin-top: 20px">
            <el-button type="primary" @click="handleRecog" style="margin-top:30px">开始识别</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="2" style="margin-left:10px">
        <div style="height: 120px"/>
      </el-col>
      <el-col :span="10">
        <el-card style="margin-top:20px;height: 500px" v-show="recogVisible">
          <div slot="header" class="clearfix">
            <span style="font-weight: 700">目标意图识别输出</span>
          </div>
          <div
            ref="myChart"
            style="
                width: 300px;
                height: 300px;
                margin: 50px auto 0;">
          </div>
          <span style="display: block;text-align: center">意图识别结果</span>
        </el-card>
        <el-card style="margin-top:20px;height: 295px" v-show="recogVisible">
          <div slot="header" class="clearfix">
            <span style="font-weight: 700">威胁评估</span>
          </div>
          <div style="text-align: justify;margin-left: 50px">
            <el-row style="margin-top: 20px">
              属性威胁量化值：{{threatResult.propertyThreat}}
            </el-row>
            <el-row style="margin-top: 20px">
              动作威胁量化值：{{threatResult.actionThreat}}
            </el-row>
            <el-row style="margin-top: 20px">
              综合威胁程度量化值：{{threatResult.threat}}
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "IntentionJudgement",
  data(){
    return {
      chart: '',
      planeType: '',
      planeName:'',
      recogVisible:false,
      chosenAction:{
        t1Action:'',
        t2Action:'',
        t3Action:'',
        t4Action:'',
        t5Action:''
      },
      planeOption:[
        {
          value:'选项一',
          label:'战斗机'
        },
        {
          value:'选项二',
          label:'轰炸机'
        },
        {
          value:'选项三',
          label:'攻击机'
        },
      ],
      setAction:[
        {
          value:'选项一',
          label:'爬升'
        },
        {
          value:'选项二',
          label:'俯冲'
        },
        {
          value:'选项三',
          label:'低空巡航'
        },
        {
          value:'选项四',
          label:'中空巡航'
        },
        {
          value:'选项五',
          label:'高空电磁盘旋'
        },
      ],
      option: {
        title: {
          text: "",
        },
        tooltip: {},
        legend: {
          data: ["概率值"],
        },
        xAxis: {
          data: ["演训", "作战", "转场"],
        },
        yAxis: {},
        series: [
          {
            name: "概率值",
            type: "bar",
            data: [0, 0, 0],
          },
        ],
      },
      threatResult:{
        propertyThreat:0.8,
        actionThreat:0.7,
        threat:0.7
      }
    }
  },
  created(){

  },
  methods:{
    handleRecog(){
      this.option.series[0].data[0] = 0.99
      this.option.series[0].data[1] = 0.12
      this.option.series[0].data[2] = 0.54
      this.drawChart()
    },
    drawChart() {
      this.chart = this.$echarts.init(this.$refs.myChart)
      this.chart.setOption(this.option)
      this.recogVisible=true
    },
  }
}
</script>

<style lang="less" scoped>
  .action{
    width: 500px;
    margin-top:50px;
  }
  .actionSelect{
    width: 300px;
  }
</style>
