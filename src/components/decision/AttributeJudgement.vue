<template>
  <div>
    <!--    面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>决策服务</el-breadcrumb-item>
      <el-breadcrumb-item>属性研判</el-breadcrumb-item>
    </el-breadcrumb>

    <el-row>
      <el-col :span="9">
        <el-card style="margin-top:20px;margin-left:40px;margin-right:10px">
          <div slot="header" class="clearfix">
            <span style="font-weight: 700">选择训练数据文件</span>
          </div>
          <div>
            <el-upload
              class="upload-demo"
              ref="upload"
              action=""
              :on-change="fileChange"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :before-remove="beforeRemove"
              :http-request="handleRequest"
              accept=".csv"
              :limit="1"
              :on-exceed="handleExceed"
              :file-list="fileList"
              :auto-upload="false"
              style="position: relative"
            >
              <el-button slot="trigger" size="small" type="primary" v-show="fileList.length!==1">点击上传</el-button>
              <el-button @click="submitUpload" size="small" type="primary"
                         style="position: absolute;right: 13px;top: -4px" v-show="fileList.length===1"
                         :disabled="isConfirmUpload">确定上传
              </el-button>
              <div slot="tip" class="el-upload__tip" v-show="fileList.length!==1">只能上传csv文件</div>
            </el-upload>
          </div>
        </el-card>
        <el-card style="margin-top:20px;margin-left:40px;margin-right:10px">
          <div slot="header" class="clearfix">
            <span style="font-weight: 700">选择模型保存路径</span>
          </div>
          <div>
            <el-select v-model="path" placeholder="请选择">
              <el-option
                v-for="item in pathOptions"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </div>
          <div style="text-align: center;margin-top: 20px">
            <el-button type="primary" @click="handleTrain" :disabled="this.isTraining">开始训练</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="2" style="margin-left:10px">
        <div style="height: 120px"/>
      </el-col>
      <el-col :span="10">
        <el-card style="margin-top:20px;height: 374px" :body-style="{ padding:'0px'}">
          <div slot="header" class="clearfix">
            <span style="font-weight: 700">已训练的pb模型</span>
          </div>
          <el-table :data="pbList" style="margin-top:0px">
            <el-table-column min-width="5%"></el-table-column>
            <el-table-column label="名称" prop="name" min-width="25%"></el-table-column>
            <el-table-column label="时间" prop="timeString" min-width="40"></el-table-column>
            <el-table-column label="选中" min-width="15%">
              <template slot-scope="scope">
                <el-switch v-model="scope.row.timeString===chosenTimeString"
                           @change="choosePb(scope.row)"></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="15%">
              <template slot-scope="scope">
                <el-button type="danger" icon="el-icon-delete" size="mini"
                           @click="removePbByName(scope.row)"></el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination @current-change="handleCurrentChange" style="text-align: center"
                         :current-page="queryInfo.pageNum" :page-size="4"
                         layout="total,prev,pager,next,jumper" :total=this.pbTotal></el-pagination>
        </el-card>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="9">
        <el-card style="margin-top: 10px;margin-left: 40px;margin-right: 10px">
          <div slot="header" class="clearfix" style="position: relative;height: 29px">
            <span style="font-weight: 700">目标属性研判输入</span>
            <!--            <el-button style="margin-left:200px" size="small" @click="handleConfig">配置参数</el-button>-->
            <el-button size="small" type="primary" @click="handleJudgement" style="position: absolute;right: 13px">
              开始研判
            </el-button>
          </div>
          <div>
            <el-form
              label-position="left"
              label-width="160px"
              :model="attributes"
              style="margin-right: 50px"
            >
              <el-form-item label="长度">
                <el-input v-model="attributes.length">
                  <template slot="append">m</template>
                </el-input>
              </el-form-item>
              <el-form-item label="高度">
                <el-input v-model="attributes.height">
                  <template slot="append">m</template>
                </el-input>
              </el-form-item>
              <el-form-item label="速度">
                <el-input v-model="attributes.speed">
                  <template slot="append">km/h</template>
                </el-input>
              </el-form-item>
              <el-form-item label="飞行距离">
                <el-input v-model="attributes.distance">
                  <template slot="append">km</template>
                </el-input>
              </el-form-item>
              <el-form-item label="发生事件">
                <el-input v-model="attributes.event"></el-input>
              </el-form-item>
              <!-- <el-form-item label="升降速度">
                <el-input v-model="attributes.zSpeed" />
              </el-form-item>
              <el-form-item label="加速度">
                <el-input v-model="attributes.acceleration" />
              </el-form-item>
              <el-form-item label="垂直加速度">
                <el-input v-model="attributes.zAcceleration" />
              </el-form-item> -->
            </el-form>
          </div>
        </el-card>
      </el-col>
      <el-col :span="2" style="margin-left:10px">
        <div style="height: 120px"/>
      </el-col>
      <el-col v-if="judgmentVis" :span="10">
        <el-card style="height: 419px;margin-top: 10px">
          <div slot="header" class="clearfix" style="height: 50px">
            <span style="font-weight: 700">目标属性研判输出</span>
          </div>
          <div style="height: 250px">
            <el-table :data="resultData" height="250" style="width:100%" :key="itemKey">
              <el-table-column type="expand" width="50">
                <template>
                  <el-form label-width="100px">
                    <el-row>
                      <el-col>
                        <el-form-item label="待发送事件">
                          <el-input v-model="this.eventProcess" style="flow:left" type="textarea"/>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-form>
                </template>
              </el-table-column>
              <el-table-column type="index" width="50"/>
              <el-table-column label="目标机型">
                <template slot-scope="scope">
                  <el-popover trigger="hover" placement="top">
                    <p>目标型号: {{ scope.row.targetModel }}</p>
                    <p>目标类别: {{ scope.row.targetType }}</p>
                    <p>国家地区: {{ scope.row.location }}</p>
                    <p>作战半径（千米）: {{ scope.row.radius }}</p>
                    <p>实用升限（米）: {{ scope.row.ceiling }}</p>
                    <p>最大飞行速度（千米/小时）: {{ scope.row.maxSpeed }}</p>
                    <!--                    <p>起飞机场: {{ scope.row.startPlace }}</p>-->
                    <!--                    <p>高度符合概率: {{ scope.row.heightProb }}</p>-->
                    <!--                    <p>速度符合概率: {{ scope.row.speedProb }}</p>-->
                    <!--                    <p>事件符合概率: {{ scope.row.eventProb }}</p>-->
                    <p>综合研判概率: {{ scope.row.probability }}</p>
                    <div slot="reference" class="model-wrapper">
                      <el-tag size="medium" @click="showTargetInfo(scope.$index, scope.row)">{{
                          scope.row.targetModel
                        }}
                      </el-tag>
                    </div>
                  </el-popover>
                </template>
              </el-table-column>
              <el-table-column label="综合研判概率">
                <template slot-scope="scope">
                  {{ scope.row.probability }}
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-row>
<!--                    <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">修改</el-button>-->
                    <el-button size="mini" @click="handleSend(scope.$index, scope.row)">发送</el-button>
                  </el-row>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-dialog :title="id" :visible.sync="isEdit" width="400px">
        <el-form ref="resultForm" model="result" label-width="100px">
          <el-form-item label="目标型号">
            <el-input v-model="result.targetModel" style="width:200px"/>
          </el-form-item>
          <el-form-item label="目标类别">
            <el-select v-model="result.targetType" style="width:200px">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />

            </el-select>
          </el-form-item>
          <el-form-item label="国家地区">
            <el-input v-model="result.countryCode" style="width:200px"/>
          </el-form-item>
          <el-form-item label="起飞机场">
            <el-input v-model="result.startPlace" style="width:200px"/>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" size="small" @click="handleResultSave">保存</el-button>
          <el-button size="small" @click="isEdit = false">取消</el-button>
        </span>
      </el-dialog>
    </el-row>
  </div>
</template>

<script>
export default {
  inject: ['reload'],
  name: "AttributeJudgement",
  data() {
    return {
      domain: '知识图谱',
      typeList: ["B-1B", "MQ-9", "F-16", "C-130"],
      recog: 'basicRecog',
      targetId: '',
      status: false,
      autoProcess: 10,
      isTraining: false,
      isConfirmUpload: false,
      uploadedName: '',
      chosenName: '',
      chosenTimeString: '',
      itemKey:0,
      colors: [
        {
          color: '#f56c6c',
          percentage: 30
        },
        {
          color: '#5cb87a',
          percentage: 60
        },
        {
          color: '#6f7ad3',
          percentage: 100
        }
      ],
      typeMap: {
        1: '侦察机',
        2: '预警机',
        3: '战斗机',
        4: '轰炸机',
        5: '民航',
        255: '其他'
      },
      weights: {
        weight_basic: null,
        weight_rcs: null,
        weight_trackline: null,
        weight_tactics: null
      },
      isWeightsConfig: false,
      judgmentVis: false,
      isEdit: false,
      id: '',
      attributes: {
        length: 14.5,
        height: 14700,
        speed: 2075,
        distance: 2000,
        event: '7时00分，某目标飞机关岛安德森空军基地升空'
      },
      eventProcess:'安德森空军基地',
      basicRecogResult: [
        {
          targetModel: "b-52",
          probability: 0.8
        }
      ],
      rcsRecogResult: [],
      tracklineRecogResult: [],
      tacticsRecogResult: [],
      autoOutput: {
        targetModel: '',
        targetType: '',
        countryCode: '',
        startPlace: ''
      },
      probOutput: {
        speedProb: '0.91',
        heightProb: '0.87',
        eventProb: '0.68',
        probability: '0.53'
      },
      options: [
        {
          value: 1,
          label: '侦察机'
        },
        {
          value: 2,
          label: '预警机'
        },
        {
          value: 3,
          label: '战斗机'
        },
        {
          value: 4,
          label: '轰炸机'
        },
        {
          value: 5,
          label: '民航'
        },
        {
          value: 255,
          label: '其他'
        }
      ],
      result: {
        targetModel: '',
        targetType: '',
        countryCode: '',
        startPlace: ''
      },
      resultData: [
        {
          id: '',
          targetModel: '',
          targetType: '',
          location: '',
          radius: '',
          ceiling: '',
          maxSpeed: '',
          // startPlace: '关岛',
          // probability: 0.7,
          // speedProb: 0.8,
          // heightProb: 0.6,
          // eventProb: 0.8,
          // event: '2010年10月7日上午7时00分，经身份研判席研判：位于东经144°43′，北纬13°26′发现B-52目标，国别：美国，起飞机场：关岛安德森空军基地，研判概率：0.7'
        },
        {
          id: '',
          targetModel: '',
          targetType: '',
          location: '',
          radius: '',
          ceiling: '',
          maxSpeed: '',
          // startPlace: '嘉手那',
          // probability: 0.2,
          // speedProb: 0.1,
          // heightProb: 0.3,
          // eventProb: 0.12,
          // event: '2012年7月8日15时42分，经身份研判席研判：位于26°21′20″N 127°46′03″E发现RC-135目标，国别：美国，起飞机场：嘉手纳，研判概率：0.2'
        },
        {
          id: '',
          targetModel: '',
          targetType: '',
          location: '',
          radius: '',
          ceiling: '',
          maxSpeed: '',
          // StartPlace: '嘉手纳',
          // probability: 0.1,
          // speedProb: 0.1,
          // heightProb: 0.1,
          // eventProb: 0.08,
          // event: '2015年5月6日08时42分，经身份研判席研判：位于34°54′20″N 117°53′01″W发现F-15目标，国别：美国，起飞机场：嘉手纳，研判概率：0.1'
        }
      ],
      fileList: [],
      pathOptions: [
        {
          value: '选项1',
          label: '\\python_file\\pb'
        }
      ],
      path: '',
      queryInfo: {
        query: '',
        pageNum: 1,
        pageSize: 4
      },
      pbList: [],
      pbTotal: 0
    }
  },
  created() {
    this.isTraining = localStorage.getItem('isTraining') === 'true'
    this.getPbList()
    this.getTotal()
    console.log(this.pbTotal);
  },
  methods: {
    selectRecog(tab, event) {
      console.log(tab, event)
    },
    autoSwitch(value) {
      if (value === true) {
        this.open()
      } else {
        this.autoProcess = 0
      }
    },
    open() {
      // 设定定时请求
      const timer = setInterval(() => {
        this.recieve(timer)
      }, 5000)
    },
    recieve(timer) {
      // 发出请求
      setTimeout(() => {
        this.axios
          .get('http://localhost:8082/targetRecog/autoRecog', {
            headers: {'content-type': 'application/json'}
          }).then((r) => {
          console.log(r)
          this.$message({
            message: '自动处理完成',
            type: 'success'
          })
          this.autoProcess = 60
          this.autoOutput = r.data
          // 向地图平台发送udp数据
          this.autoProcess = 100
          // 接收到请求数据停止请求
          clearInterval(timer)
        }).catch((e) => {
          console.log(e)
          console.log('自动处理失败')
        })
      }, 0)
    },
    handleWeightsConfig() {
      this.isWeightsConfig = true
    },
    handleSaveWeights() {
      this.axios.post('http://localhost:8082/weights/insert', this.weights, {
        headers: {
          'content-type': 'application/json'
        }
      }).then((r) => {
        console.log(r)
        this.$message({
          message: '保存权值成功！',
          type: 'success'
        })
        this.isWeightsConfig = false
      })
    },
    handleConfig() {
      this.$router.push({path: '/decision/judgementModel'})
    },
    // showGraph() {
    //   // 跳转到目标节点页面
    //   const toLink = this.$router.resolve({
    //     path: 'attributeCharacteristicsAtlas',
    //     name: 'attributeCharacteristicsAtlas'
    //   })
    //   localStorage.setItem('id', 177)
    //   window.open(toLink.href, '_blank')
    // },


    // handleJudgement() {
    //   const that = this
    //   const name = this.chosenName + '-' + this.chosenTimeString
    //   if (this.chosenName === null || this.chosenName === '' || this.chosenTimeString === null || this.chosenTimeString === '') {
    //     return that.$message({
    //       type: 'warning',
    //       message: '请选择一个模型！'
    //     })
    //   }
    //   console.log(name);
    //   this.judgmentVis = true
    //   console.log(this.attributes)
    //   that.$http
    //     .get('targetRecog/judgeType', {
    //       params: {
    //         longitude: this.attributes.longitude,
    //         latitude: this.attributes.latitude,
    //         height: this.attributes.height,
    //         speed: this.attributes.speed,
    //         pbModel: name
    //       }
    //     })
    //     .then((response) => {
    //       if (response.data.code === 200) {
    //         console.log(response);
    //         let result = response.data.data
    //         this.resultData[0].targetModel = result.targetModel1
    //         this.resultData[1].targetModel = result.targetModel2
    //         this.resultData[2].targetModel = result.targetModel3
    //         this.resultData[0].probability = result.probability1
    //         this.resultData[1].probability = result.probability2
    //         this.resultData[2].probability = result.probability3
    //         for (let i = 0; i < 3; i++) {
    //           let name = this.resultData[i].targetModel
    //           that.$http.get('KG/searchNodeByName', {
    //             params: {
    //               domain: this.domain,
    //               name: name
    //             }
    //           }).then(response => {
    //             this.resultData[i].id = response.data.data.id
    //             if (response.data.code === 200) {
    //               console.log(response)
    //               let pros = response.data.data.properties
    //               this.resultData[i].targetType = pros['类别']
    //               this.resultData[i].location = pros['国家地区']
    //               this.resultData[i].radius = pros['作战半径（千米）']
    //               this.resultData[i].ceiling = pros['实用升限（米）']
    //               this.resultData[i].maxSpeed = pros['最大飞行速度（千米/小时）']
    //               console.log(this.resultData[i]);
    //             }
    //           })
    //         }
    //       }
    //     })
    // },

    async handleJudgement() {
      const that = this
      const name = this.chosenName + '-' + this.chosenTimeString
      if (this.chosenName === null || this.chosenName === '' || this.chosenTimeString === null || this.chosenTimeString === '') {
        return that.$message({
          type: 'warning',
          message: '请选择一个模型！'
        })
      }
      console.log(name);
      this.judgmentVis = true
      console.log(this.attributes)
      const {data:res} = await that.$http
        .get('targetRecog/judgeType', {
          params: {
            length: this.attributes.length,
            height: this.attributes.height,
            speed: this.attributes.speed,
            distance: this.attributes.distance,
            pbModel: name
          }
        })
      console.log(res);
      if(res.code!==200) return that.$message.error("获取结果异常！")
      else {
        let result = res.data
        this.resultData[0].targetModel = result.targetModel1
        this.resultData[1].targetModel = result.targetModel2
        this.resultData[2].targetModel = result.targetModel3
        this.resultData[0].probability = result.probability1
        this.resultData[1].probability = result.probability2
        this.resultData[2].probability = result.probability3
        this.itemKey=Math.random()
        for (let i = 0; i < 3; i++) {
          let name = this.resultData[i].targetModel
          that.$http.get('KG/searchNodeByName', {
            params: {
              domain: this.domain,
              name: name
            }
          }).then(response => {
            this.resultData[i].id = response.data.data.id
            if (response.data.code === 200) {
              console.log(response)
              let pros = response.data.data.properties
              this.resultData[i].targetType = pros['类别']
              this.resultData[i].location = pros['国家地区']
              this.resultData[i].radius = pros['作战半径（千米）']
              this.resultData[i].ceiling = pros['实用升限（米）']
              this.resultData[i].maxSpeed = pros['最大飞行速度（千米/小时）']
              console.log(this.resultData[i]);
            }
          })
        }
      }
    },


    showTargetInfo(index, row) {
      // if (row.targetModel === 'B-52') {
      //   this.targetId = '177'
      // } else if (row.targetModel === 'U-2') {
      //   this.targetId = '406'
      // } else {
      //   this.targetId = '23'
      // }
      this.targetId = row.id
      const toLink = this.$router.resolve({
        path: 'attributeAtlas',
        // name: 'AttributeAtlas',
      })
      // localStorage.clear()
      // localStorage.setItem('id', this.targetId)
      window.sessionStorage.setItem('id', this.targetId)
      // window.sessionStorage.setItem('activePath', '/attributeAtlas')
      window.open(toLink.href, '_blank')
    },
    handleEdit(index, row) {
      this.id = index + 1
      this.result = Object.assign({}, row)
      this.isEdit = true
    },
    handleResultSave() {
      // 修改结果并保存
      this.isEdit = false
    },
    handleSend(index, row) {
      this.$router.push({
        name: 'intentionJudgment',
        params: {
          result: row
        }
      })
    },
    handleSubmit() {
      const self = this
      this.$router.push({
        name: 'intentionJudgment'
        // params: {
        //   result: self.result,
        // },
      })
    },
    handleRemove(file, fileList) {
      this.fileList = []
      this.isConfirmUpload = false
      console.log(file, fileList)
    },
    handlePreview(file) {
      console.log(file)
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    handleRequest(param) {
      const file = param.file
      // this.fileList.push({
      //   name:file.name,
      //   file:file
      // })
      const formdata = new FormData()
      formdata.append('lbf-file-upload', file)
      formdata.append('name', 'lbf-file-upload')
      this.$http.post('TargetModel/upload', formdata).then(response => {
        console.log(response);
        if (response.data.code === 200) {
          this.$message.success(response.data.message)
          this.isConfirmUpload = true
          this.uploadedName = file.name
        } else {
          this.$message.error(response.data.message || '文件上传失败')
        }
      })
    },
    submitUpload() {
      this.$refs.upload.submit()
    },
    fileChange(file, fileList) {
      this.fileList = fileList
      console.log(this.fileList);
    },
    handleTrain() {
      // var name="zou_try.csv"
      var name = this.uploadedName
      if (name === '' || name === null) {
        this.$message({
          type: 'warning',
          message: '请先上传数据文件'
        })
        return
      }
      if (this.path === '' || this.path === null) {
        this.$message({
          type: 'warning',
          message: '请选择保存路径'
        })
        return
      }
      var datasetPath = "C:\\Users\\70213\\Desktop\\学习文件\\毕业设计\\从头开始\\python_file\\dataset\\"
      this.isTraining = true
      localStorage.setItem('isTraining', 'true')
      this.$message({
        type: 'success',
        message: '已开始训练！'
      })
      this.$http.get('TargetModel/train', {
        params: {
          csvName: name
        }
      }).then(response => {
        console.log(response);
        this.isTraining = false
        localStorage.setItem('isTraining', 'false')
        this.$message({
          type: 'success',
          message: '模型已训练完成！'
        })
        this.getPbList()
        this.getTotal()
        this.reload()
      })
    },
    handleExceed(files) {
      // const name=files[0].name
      // const file=files[0]
      // this.fileList.splice(0,1,{name,file})
      // console.log(this.fileList);
    },
    getPbList() {
      // const {data: res} = this.$http.get('targetRecog/getPbList', {
      //   params:
      //     {pageNum:this.queryInfo.pageNum}
      // })
      this.$http.get('targetRecog/getPbList', {
        params: {
          pageNum: this.queryInfo.pageNum
        }
      }).then(response => {
        console.log(response)
        if (response.data.code !== 200) {
          return this.$message({
            type: 'error',
            message: '获取模型数据失败'
          })
        } else {
          this.pbList = response.data.data
          // this.chosenName=this.pbList[0].name
          // this.chosenTimeString=this.pbList[0].timeString
          console.log(this.pbList)
        }
      })
    },
    getTotal() {
      this.$http.get('targetRecog/getTotal').then(response => {
        this.pbTotal = response.data.data
        console.log(response);
      })
    },
    choosePb(row) {
      this.chosenName = row.name
      this.chosenTimeString = row.timeString
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage
      this.getPbList()
    },
    async removePbByName(row) {
      const confirmResult = await this.$confirm('此操作将永久删除该模型文件，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(confirmResult);
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！');
      }
      const {data: res} = await this.$http.delete('TargetModel/delete', {
        params: {
          name: row.name + '-' + row.timeString
        }
      })
      console.log(res);
      if (res.code === !200) {
        return this.$message.error('删除失败！')
      }
      this.$message.success('删除成功！')
      if (this.chosenTimeString === row.timeString) {
        this.chosenName = ''
        this.chosenTimeString = ''
      }
      const mPage = Math.ceil(this.pbTotal / 4)
      if (this.pbTotal === 1) {
        this.getPbList()
        this.getTotal()
      } else if (this.queryInfo.pageNum === mPage && this.pbTotal === mPage * 4 - 3) {
        this.queryInfo.pageNum--
        this.getPbList()
        this.getTotal()
        console.log("最后一个只有一个需要回到前一页")
      } else {
        this.getPbList()
        this.getTotal()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
