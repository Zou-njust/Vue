<template>
  <div class="card-container">
    <!-- #####更改节点信息卡片样式 -->
    <el-card body-style="max-height:400px;overflow:auto" class="detailCard">
      <div slot="header" class="clearfix">
        <span>节点信息</span>
<!--        下面这个advanceSearch不知道干嘛的-->
        <el-button v-if="advanceSearch!=='1'" type="primary" icon="el-icon-edit" circle size="medium" style="margin-left:150px" @click="editNodeBefore" />
        <!--        <span>{{this.panelInfo.properties}}</span>-->
      </div>
      <!-- 修改节点信息 -->
      <el-dialog title="修改节点属性" :visible.sync="dialogEditNodeVisible">
        <!-- 内层dialog -->
        <el-dialog
          width="30%"
          title="添加属性"
          :visible.sync="innerVisible"
          append-to-body
        >
          <!-- 增加属性表单 -->
          <el-form label-width="80px" :model="addPropertyForm" :rules="addPropertyFormRules">
            <el-form-item label="属性名">
              <el-input v-model="addPropertyForm.key" />
            </el-form-item>
            <el-form-item label="属性值">
              <el-input v-model="addPropertyForm.value" />
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="innerVisible = false">取 消</el-button>
            <el-button type="primary" @click="addProperty">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 属性信息展示（table） -->
        <el-table
          :data="editNodeList"
          style="width:900px;overflow:auto"
          max-height="380px"
        >
          <el-table-column
            prop="key"
            label="属性名"
            width="200"
            align="center"
          >
            <template slot-scope="scope">
              {{ nameMap.get(scope.row.key)===undefined?scope.row.key:nameMap.get(scope.row.key) }}
            </template>
          </el-table-column>
          <el-table-column
            label="属性值"
            width="350"
            align="center"
          >
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.edit"
                style="width: 200px"
                :placeholder="scope.row.val"
                clearable
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="danger"
                @click="deleteProperty(scope.$index,scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--        <span slot="footer" class="dialog-footer">-->
        <!--          <el-button type="text" style="border-color:transparent" @click="innerVisible=true">新增属性</el-button>-->
        <!--          <el-button @click="dialogEditNodeVisible = false">取 消</el-button>-->
        <!--          <el-button type="primary" @click="editNode">确 定</el-button>-->
        <!--        </span>-->
        <el-row style="margin-top: 20px">
          <el-button type="primary" plain @click="innerVisible=true" style="margin-left: 5%;float: left">添加属性</el-button>
          <el-button @click="dialogEditNodeVisible = false" style="margin-right: 8%;float: right">取 消</el-button>
          <el-button type="success" plain @click="editNode" style="margin-right: 3%;float: right">确 定</el-button>
        </el-row>
      </el-dialog>
      <div class="panel-container">
        <ul class="info-list" :style="{ display: isDiaplayInfo }" style="margin-left: 20px">
          <li><span>节点名称: </span>{{ panelInfo.name }}</li>
          <li><span>标签: </span>{{ panelInfo.type }}</li>
          <span v-for="(item, i) in toEntries(panelInfo.properties)" :key="i">
<!--            <span v-for="(item, i) in Object.entries(panelInfo.properties)" :key="i">-->
<!--            上一行是原来的-->
            <!-- name和id不显示 -->
            <li v-if="item[0]!=='name'&& item[0]!=='id'&& item[0]!=='tablename'&& item[0]!=='es_index_id'">
              <span>{{ nameMap.get(item[0])===undefined?item[0]:nameMap.get(item[0]) }}: </span>
              <span v-if="item[1]==='[]'">无</span>
              <span v-else-if="item[1]==='true'">是</span>
              <span v-else>{{ item[1] }}</span>
            </li>
            <!-- <li v-if="item[0]==='ISOVERSEAS' && item[1]===true">
              <span style="color:#05FAFF">海外目标:</span> 是
            </li> -->
          </span>
        </ul>
      </div>
    </el-card>
    <el-dialog
      title="请选择您要查询的时间范围"
      :visible.sync="popover"
      :modal-append-to-body="false"
    >
      <el-date-picker
        v-model="dateValue"
        type="daterange"
        align="left"
        unlink-panels
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyyMMdd"
        format="yyyy-MM-dd"
        :picker-options="pickerOptions"
      />
      <div slot="footer" class="dialog-footer">
        <el-button
          @click="
            popover = false;
            value = '';
          "
        >取 消</el-button>
        <el-button type="primary" @click="findEventsByRelationship">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import global from '../Global.vue'
// import canvas from '@/components/KG/Canvas'
// 属性名映射
const nameMap = new Map([
  ['ISOVERSEAS', '是否海外目标'],
  ['basicInfo', '基本信息'],
  ['birthDate', '出生日期'],
  ['career', '职业'],
  ['count', '关系数量'],
  ['country', '国家'],
  ['crawlerSource', '爬虫来源'],
  ['detailInfo', '详细信息'],
  ['dsad', 'dsad'],
  ['event', '事件'],
  ['facebookAccount', 'facebook账户'],
  ['foreignName', '英文名'],
  ['gender', '性别'],
  ['graduatedSchool', '毕业学校'],
  ['guid', '唯一标识'],
  ['guidHBase', 'guidHBase标识'],
  ['id', '编号'],
  ['lastModifiedDate', '最后修改时间'],
  ['localCrawlerFlag', '本地爬虫'],
  ['ming', 'ming'],
  ['name', '名称'],
  ['nationality', '民族'],
  ['p1', 'p1'],
  ['p2', 'p2'],
  ['pageType', '来源类型'],
  ['pageUrl', '来源地址'],
  ['picUrl', '图片地址'],
  ['poster', '发布者'],
  ['ptmc', 'ptmc'],
  ['publishTime', '发布时间'],
  ['relationList', '关系列表'],
  ['rwId', '人物编号'],
  ['rwName', '人物姓名'],
  ['rwTags', '人物标签'],
  ['siteName', '网站名称'],
  ['summary', '摘要'],
  ['test', '测试'],
  ['time', '时间'],
  ['twitterAccount', '推特账户'],
  ['twitterzh', '推特转发'],
  ['type', '类型'],
  ['url', '网页地址']
])
export default {
  name: 'DetailPanel',
  props: {
    domain:String,
    panelInfo: Object,
    relationShip: Array,
    whichParent: String, // 判断当前子组件被哪个父组件调用 "0"代表KG，"1"代表KgEdit
    advanceSearch: String // 判断是否是从搜索详情页面来的
  },
  data() {
    return {
      // 添加关联查询的节点
      new_item: {
        label: '',
        nodes: []
      },

      // 添加属性的内层嵌套对话框
      innerVisible: false,
      // 添加属性的表单
      addPropertyForm: {
        key: '',
        value: ''
      },
      addPropertyFormRules: {
        key: [{ required: true, message: '请填写属性名', trigger: 'blur' }],
        value: [{ required: true, message: '请填写属性值', trigger: 'blur' }]
      },
      // 删除节点按钮是否禁用
      deleteBtnDis: false,
      // 关系选择器的值
      value: '',
      // 时间选择器的默认值
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近六个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 180)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一年',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      dateValue: '', // 时间选择值
      popover: false, // 时间选择对话框是否展示
      dialogEditNodeVisible: false,
      editNodeList: [],
      deleteNodeList: [],
      formLabelWidth: '120px',
      // 是否显示节点信息
      isDiaplayInfo: 'none',
      // 是否禁用选择框和编辑按钮
      disabled: false,
      // 属性名映射
      nameMap: {}

    } // return 结束
  },
  computed: {
    graphId: function() {
      return this.$store.getters.getChildGraphId
    }
  },
  watch: {
    panelInfo: function() {
      // 信息面板上的信息如果发生改变就更新选择器
      this.value = ''
      if (this.panelInfo.name) {
        this.isDiaplayInfo = ''
      } else {
        this.isDiaplayInfo = 'none'
      }
    },
    popover: function() {
      // 只要时间选择弹出框不在就将关系选择器置空
      if (!this.popover) this.value = ''
    },
    // 根据子图状态决定是否禁用下拉列表与编辑按钮
    graphId: function() {
      if (this.graphId !== -1) {
        this.disabled = true
      } else {
        this.disabled = false
      }
    }
  },

  created() {
    this.nameMap = nameMap
  }, // data 结束
  methods: {
    // 跳转到关联查询
    toKG(type, name) {
      this.$router.push({
        name: '关联查询',
        params: {
          type: type,
          name: name
        }
      })
    },

    // 跳转到详情页面
    toSearchResultDetails(properties, neo4j_id) {
      const id = properties.es_index_id
      const es_table_name = properties.tablename
      this.$router.push({
        name: '搜索结果',
        params: {
          id: id,
          es_table_name: es_table_name,
          neo4j_id: neo4j_id
        }
      })
    },

    // 将图谱中选中的节点 添加到待关联查询节点中
    editChooseNodes(types, node) {
      let itemNum = 0
      for (const item of global.globalSentChooseNodes) {
        itemNum += item.nodes.length
      }
      if (itemNum >= 4) {
        this.$message.warning('选择的节点不能多于4个')
        return
      }

      // type现在为数组 一个节点可能为多个类别

      if (node != null) {
        if (global.globalChooseNodes.includes(node)) {
          global.globalChooseNodes.splice(global.globalChooseNodes.indexOf(node), 1)
        } else {
          global.globalChooseNodes.push(node)
        }
        // 先判断选中的节点的类型数组中 是否有目前已有的，防止造成多类型指向同一个节点    0表示目前没有，1表示目前有
        let flag = 0
        for (const type of types) {
          for (const item of global.globalSentChooseNodes) {
            if (item.label === type) {
              flag = 1
              // 已存在则取消选择
              if (item.nodes.includes(node)) {
                item.nodes.splice(item.nodes.indexOf(node), 1)
              } else {
                // 否则添加目标
                item.nodes.push(node)
              }
              return
            }
          }
        }

        // 如果目前没有 则将当前的加入 只加入第一个类型，第一遍循环便return
        if (flag == 0) {
          for (const type of types) {
            this.new_item.label = type
            this.new_item.nodes.push(node)
            const item = { label: type, nodes: [node] }
            global.globalSentChooseNodes.push(item)
            return
          }
        }
      }

      // for(let type of types){
      //   if (type !== null && node != null) {
      //     if (global.globalChooseNodes.includes(node)) {
      //       global.globalChooseNodes.splice(global.globalChooseNodes.indexOf(node), 1)
      //     } else {
      //       global.globalChooseNodes.push(node)
      //     }
      //     let flag = 0
      //     //  for(let item of this.sentChooseNodes){
      //     for (const item of global.globalSentChooseNodes) {
      //       if (item.label === type) {
      //         flag = 1
      //         // 已存在则取消选择
      //         if (item.nodes.includes(node)) {
      //           item.nodes.splice(item.nodes.indexOf(node), 1)
      //         } else {
      //           // 否则添加目标
      //           item.nodes.push(node)
      //         }
      //       }
      //     }
      //     if (flag === 0) {
      //       this.new_item.label = type
      //       this.new_item.nodes.push(node)
      //       const item = { label: type, nodes: [node] }
      //       global.globalSentChooseNodes.push(item)
      //     }
      //     return
      //   }
      // }
    },

    deleteProperty(index, row) {
      this.$confirm('是否确定删除属性 ' + row.key, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.editNodeList.splice(index,1)
        this.deleteNodeList.push(row.key)
        console.log(this.deleteNodeList)
        // const params = {
        //   label: this.panelInfo.type,
        //   id: this.panelInfo.id,
        //   list: [row.key]
        // }
        // let url = ''
        // switch (this.whichParent) {
        //   case '0':
        //     url = '/ga/deleteProp'
        //     break
        //   case '1':
        //     url = '/ga/deletePropInNeo4j'
        // }
        // 发送请求
        // this.$http.post(url, params).then(res => {
        //   if (res.data.code === 200) {
        //     this.$message.success('删除成功')
        //     this.editNodeList.splice(index, 1)
        //   } else {
        //     // 删除失败处理
        //   }
        // })
      })
    },
    // 添加属性
    addProperty() {
      console.log(this.editNodeList)
      for(let property of this.editNodeList){
        console.log(property.key)
        console.log(this.addPropertyForm.key)
        if(property.key===this.addPropertyForm.key){
          return this.$message.warning('不能添加重复的属性！')
        }
      }
      this.editNodeList.push({
        key: this.addPropertyForm.key,
        val: this.addPropertyForm.value,
        edit: ''
      })
      // 关闭添加属性表单
      this.innerVisible = false
    },
    // 弹出修改节点属性对话框
    editNodeBefore() {
      if(this.panelInfo.id === undefined){
        return this.$message.warning('请先选中节点')
      }
      if (this.graphId === -1 && this.whichParent === '0') {
        this.$message.warning('请先选择或保存子图')
        return
      }
      // 处理属性，增加edit字段
      this.editNodeList = []
      this.deleteNodeList = []
      for (const item of Object.entries(this.panelInfo.properties)) {
        // 过滤name和id不可修改
        if (item[0] !== 'name' && item[0] !== 'id') {
          this.editNodeList.push({
            key: item[0],
            val: item[1],
            edit: ''
          })
        }
      }
      this.dialogEditNodeVisible = true
    },
    // 点击确定重置属性（增加和修改）
    editNode() {
      // 更新节点信息面板
      // editNode是json数组，{'key':属性名称, 'val': 属性值, 'edit': ''}最后一个属性表示是否允许编辑
      // tmp中是map形式
      const tmp = {}
      for (const item of this.editNodeList) {
        if (item.edit && item.editMap != '') {
          if (item.key === 'name') {
            this.panelInfo.name = item.edit
          }
          item.val = item.edit
        }
        tmp[item.key] = item.val
      }
      this.panelInfo.properties = tmp
      this.$http.post('KG/deleteProperties',this.deleteNodeList,{
        params: {
          id: this.panelInfo.id
        }
        })
      // 将修改之后的属性发送给后台
      this.$http.post('KG/editNode',
        this.panelInfo.properties,
        {
          params: {
            id: this.panelInfo.id
          }
        }).then(res => {
        if (res.data.code === 200) {
          this.dialogEditNodeVisible = false
          this.$message.success('修改节点成功')
        } else {
          this.dialogEditNodeVisible = false
          this.$message({
            type: 'error',
            message: res.data.message
          })
          // 修改失败处理
        }
      })
    },
    // 根据关系找事件
    findEventsByRelationship() {
      if (this.dateValue === '') {
        return this.$message.error('请选择正确的时间范围！')
      }

      const params = {
        endTime: this.dateValue[1],
        startTime: this.dateValue[0]
      }
      this.getDataSource(
        `/graph/neighbour/event/${this.panelInfo.id}/${this.value.split(',')[0]}`,
        {
          params: params
        }
      ).then(() => {
        // 关闭对话框
        this.popover = false
      })
    },
    findNodesByRelationship(e) {
      // 获取数据源的时候用逗号分隔
      const [relationName, nodeType] = e.split(',')
      // 这个d 是点击事件传进来的一个参数，代表了当前点击的对象
      // 如果是节点类型是事件，就调用需要时间的接口
      if (nodeType === '事件') {
        // 展示时间控件
        this.popover = true
        // 查询由对话框的确认时间发起
      } else {
        this.getDataSource(`/graph/neighbour/${this.panelInfo.id}/${relationName}`)
      }
    },
    getDataSource(queryURL, params = {}) {
      return this.$http
        .get(queryURL, params)
        .then((response) => {
          if (response.data.code === 200) {
            // 因为d3.js对于边的要求需要 source target ,所以在此转换一下
            const newGraphSource = response.data.data
            if (!newGraphSource.nodes.length) {
              return this.$message({
                showClose: true,
                type: 'info',
                message: '未查到相关数据'
              })
            }

            if (newGraphSource.links !== undefined) {
              newGraphSource.links.map(function(obj) {
                obj['source'] = obj['sourceId'] // 分配新键
                delete obj['sourceId'] // 删除旧键
                obj['target'] = obj['targetId']
                delete obj['targetId']
                return obj
              })
            }
            // 将新的数据源返回
            this.$emit('getNewGraphSource', newGraphSource)
          }
        })
        .catch((e) => console.log(e))
    },
    toEntries(properties){
      var pairs=Object.entries(properties)
      if(this.domain==='事理图谱') {
        var intentionOrder = ['高度-高空', '高度-中空', '高度-低空', '速度-高速', '速度-中速', '速度-低速',
          '电磁-有', '电磁-无', '爬升率-正', '爬升率-零', '爬升率-负']
        return pairs.sort((a, b) => intentionOrder.indexOf(a[0]) - intentionOrder.indexOf(b[0]))
      }
      if(this.domain==='知识图谱') {
        var attributeOrder = ['类别', '国家地区', '长度（米）','宽度（米）', '翼展（米）','旋翼直径（米）', '高度（米）',
          '空重（千克）', '载重（千克）', '最大起飞重量（千克）', '最大载油量（吨）', '最大飞行速度（千米/小时）', '航程（千米）', '作战半径（千米）', '实用升限（米）', '爬升率（米/秒）']
        return pairs.sort((a, b) => attributeOrder.indexOf(a[0]) - attributeOrder.indexOf(b[0]))
      }
    }
  }
}
</script>

<style>
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}

.card-container {
  margin-top: 10px;
  margin-left: 15px;
}

.panel-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-list {
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.info-list li {
  list-style-type: none;
  position: relative;
  padding-left: 0px;
  line-height: 20px;
  margin-top: 4px;
  margin-left: -30px;
  text-align: left;
}

/*// .info-list li:before {*/
/*//   content: " ";*/
/*//   display: block;*/
/*//   right: 1.25rem;*/
/*//   width: 5px;*/
/*//   height: 5px;*/
/*//   background: rgb(58, 58, 58);*/
/*//   border: solid 1px #aaa;*/
/*//   position: absolute;*/
/*//   top: 3px;*/
/*//   left: -15px;*/
/*// }*/
.deleteBtn {
  margin-left: 10px;
}
/*// .detailCard {*/
/*//   background: #2a4268c0;*/
/*//   border: solid 1px #2a4268c0;*/
/*//   color: #fff;*/
/*// }*/
</style>
