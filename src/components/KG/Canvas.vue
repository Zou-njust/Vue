<template>
  <div
    v-loading="loading"
    class="container"
    element-loading-text="保存子图中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="canvas-container">
      <slot/>
      <div v-show="advanceSearch!=='1'" style="position: absolute;bottom: 10px;right: 10px">
        <!--        <el-button>{{ this.relationProNameTmp }}</el-button>-->
        <!--        {{ this.nodecount }}-->
        <el-button
          icon="el-icon-delete"
          circle
          class="deleteBtn"
          :disabled="deleteBtnDis"
          @click="deleteNodeFn"
        />
        <el-button class="addBtn" icon="el-icon-plus" circle @click="addNodeOrLinkBefore"/>
        <!-- <el-button type="text" class="addLinkBtn" @click="addNodeOrLinkBefore">创建节点和关系</el-button> -->
        <!--        <el-button class="saveBtn" circle @click="saveGraphFn" :disabled="graphId!==-1"><i class="iconfont icon-baocun"></i></el-button>-->
      </div>
      <el-dialog title="创建节点或关系" :visible.sync="dialogAddLinkVisible"
                 :modal-append-to-body="false" width="35%" :close-on-click-modal="false">
        <el-radio-group v-model="addNodeOrLink" style="margin-bottom:20px">
          <el-radio label="node">节点</el-radio>
          <el-radio label="link">关系</el-radio>
        </el-radio-group>
        <div v-show="addNodeOrLink==='node'" align="center">
          <el-form ref="addNodeFormRef" :model="addNodeForm" :rules="addNodeFormRules">
            <div align="left" style="margin-left: 5%">
              <el-form-item prop="name">
                <el-input v-model="addNodeForm.name" placeholder="请输入节点名称" style="width: 90%"/>
              </el-form-item>
              <el-form-item style="margin-top: 20px" prop="type">
                <el-select v-model="addNodeForm.type" placeholder="请选择节点类型" style="width: 90%">
                  <el-option
                    v-for="(item,itemKey) in nodeTypeOptions"
                    :key="itemKey"
                    :value="item.label"
                    :label="item.label">

                  </el-option>
                </el-select>
              </el-form-item>
              <!--              只有点击添加属性才显示-->
              <div v-show="addPropertyView == true">
                <el-table
                  :data="editProperty"
                  width="500px"
                  max-height="200px"
                >
                  <el-table-column
                    prop="key"
                    label="属性名"
                    width="170px"
                    align="left"
                  >
                    <template slot-scope="scope">
                      <el-input
                        v-model="scope.row[0]"
                        :placeholder="scope.row[0]"
                        clearable
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="属性值"
                    width="170px"
                    align="left"
                  >
                    <template slot-scope="scope">
                      <el-input
                        v-model="scope.row[1]"
                        :placeholder="scope.row[1]"
                        clearable
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="80px" align="left">
                    <template slot-scope="scope">
                      <el-button
                        size="mini"
                        type="danger"
                        @click="deletePropertyInput(scope.row,scope.$index)"
                      >删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <!--                <div style="display: flex">-->
                <!--                  <span style="flex: 2">属性名</span>-->
                <!--                  <span style="flex:2">属性值</span>-->
                <!--                  <span style="flex:1">操作</span>-->
                <!--                </div>-->
                <!--                <div v-for="(item,index) in editProperty" :key="item.id">-->
                <!--                  <el-input-->
                <!--                    v-model="item[0]"-->
                <!--                    type="input"-->
                <!--                    placeholder="请输入属性名"-->
                <!--                    style="width: 35%"-->
                <!--                  />-->
                <!--                  <el-input-->
                <!--                    v-model="item[1]"-->
                <!--                    type="input"-->
                <!--                    placeholder="请输入属性值"-->
                <!--                    style="width: 35%;margin-left: 20px"-->
                <!--                  />-->
                <!--                  <el-button style="margin-left: 20px" type="danger" size="small" @click="deletePropertyInput(item,index)">删除</el-button>-->
                <!--                </div>-->
              </div>
            </div>
            <div>
              <el-row style="margin-top: 20px">
                <el-button type="primary" plain style="margin-left: 5%;float: left" @click="addPropertyInput">添加属性
                </el-button>
                <el-button type="success" plain style="margin-left: 20%" @click="addNodeOrLinkFn">确 定</el-button>
                <el-button style="margin-right: 10%;float: right" @click="addNodeLinkCancel">取 消</el-button>
              </el-row>
            </div>
          </el-form>
        </div>
        <div v-show="addNodeOrLink==='link'">
          <el-form ref="addLinkFormRef" :model="addLinkForm" :rules="addLinkFormRules">
            <div align="left" style="margin-left: 5%">
              <el-form-item prop="sourceId">
                <el-select v-model="addLinkForm.sourceId" placeholder="请选择起始节点" style="width: 90%"
                           @visible-change="clearValueSource($event)">
                  <div class="el-input">
                    <input v-model="dropDownValueSource" type="text" placeholder="请输入" class="el-input__inner"
                           @keyup="dropDownSearchSource">
                  </div>
                  <el-option
                    v-for="item in kgNodesSourceShow"
                    :key="item.name"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item prop="targetId">
                <el-select v-model="addLinkForm.targetId" placeholder="请选择终止节点" style="width: 90%"
                           @visible-change="clearValueTarget($event)">
                  <div class="el-input">
                    <input v-model="dropDownValueTarget" type="text" placeholder="请输入" class="el-input__inner"
                           @keyup="dropDownSearchTarget">
                  </div>
                  <el-option
                    v-for="item in kgNodesTargetShow"
                    :key="item.name"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item prop="name">
                <el-select v-model="addLinkForm.name" placeholder="请选择关系名" style="width: 90%">
                  <el-option
                    v-for="item in linkTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>
            <div>
              <el-row style="margin-top: 20px">
                <el-button style="margin-right: 10%;float: right" @click="addNodeLinkCancel">取 消</el-button>
                <el-button type="success" plain style="margin-right: 5%;float: right" @click="addNodeOrLinkFn">确 定
                </el-button>
              </el-row>
            </div>
          </el-form>
        </div>
      </el-dialog>

      <el-dialog title="修改或删除关系" :visible.sync="dialogEditLinkVisible" width="30%">
        <el-select v-model="relationProNameTmp" placeholder="请选择关系">
          <el-option
            v-for="item in linkTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="deleteLink">删 除</el-button>
          <el-button type="primary" @click="editLink">确认修改</el-button>
          <el-button @click="dialogEditLinkVisible = false; relationProNameTmp = ''">取 消</el-button>

        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import {saveSvgAsPng} from 'save-svg-as-png'
// import global from '../Global.vue'
// import { parse } from 'qs'
// import { login } from '@/api/user'
export default {
  name: 'Cvs',
  props: {
    isChosen: {type: Boolean, default: false},
    analysisType: String,
    domain: String,
    whichParent: String, // 判断当前子组件被哪个父组件调用 0代表KG，1代表KgEdit
    advanceSearch: String // 判断是否是从搜索详情页面来的
    // linksChoosed: Array
  },
  data() {
    return {
      // 用于更新画布
      nodes: [],
      links: [],
      // 用于修改并保存子图
      kgNodes: [],
      kgNodesSourceShow: [],
      kgNodesTargetShow: [],
      kgLinks: [],
      nodeText: [],
      linksName: [],
      simulation: null,
      width: 1100,
      height: 700,
      // 用于判断是更新还是初始化
      initialized: false,
      nodeSizeList: new Map(), // 类型与半径的对应关系
      nodeTextLengthList: new Map(), // 类型与节点文本个数的对应关系
      // scale: d3.scaleOrdinal(d3.schemeCategory10), // 用于随机展示节点颜色
      scale: d3.scaleOrdinal().range(['#FFC454', '#8DCC93', '#02A7F1', '#f79767', '#a496ff', '#00933db3', '#57C7E3']), // 用于随机展示节点颜色 展示设置好的颜色
      dialogAddLinkVisible: false,
      dialogEditLinkVisible: false,
      addLinkForm: {
        sourceId: '',
        targetId: '',
        name: ''
      },
      addNodeForm: {
        name: '',
        type: '',
        property: {}
      },
      // 添加节点表单验证规则
      addNodeFormRules: {
        type: [{required: true, message: '请选择一个节点类型', trigger: 'change'}],
        name: [{required: true, message: '请填写节点名称', trigger: 'blur'}]
      },
      // 添加关系表单验证规则
      addLinkFormRules: {
        sourceId: [{required: true, message: '请选择起始节点', trigger: 'change'}],
        targetId: [{required: true, message: '请选择终止节点', trigger: 'change'}],
        name: [{required: true, message: '请选择关系名称', trigger: 'change'}]
      },


      addNodeOrLink: 'node',
      // 图数据库所有关系类型
      linkTypeOptions: [],
      // 删除节点是否禁用
      deleteBtnDis: false,
      // 节点信息
      panelInfo: {},
      // 正在进行操作的关系
      relationPro: -1,
      relationProNameTmp: '',
      // 保存子图加载
      loading: false,
      nodecount: '',
      nodeTypeOptions: [
        // {
        //   value: '选项1',
        //   label: '侦察机'
        // }, {
        //   value: '选项2',
        //   label: '加油机'
        // }, {
        //   value: '选项3',
        //   label: '战斗机'
        // }
      ],
      SLOption: [
        {
          value: '选项1',
          label: '事件'
        }, {
          value: '选项2',
          label: '节点'
        }],
      editProperty: [],
      node: {
        name: '',
        type: '',
        property: {}
      },
      dropDownValueSource: '',
      dropDownValueTarget: '',
      addPropertyView: false
    }
  },
  computed: {
    // 子图id
    graphId: function () {
      return this.$store.getters.getChildGraphId
    }
  },
  created() {
    // 获取图数据库关系类型
    this.getRelTypeAndNodeTypeFromNeo4j()
    this.getNodeCount()
  },
  methods: {
    addNodeLinkCancel() {
      this.dialogAddLinkVisible = false
      // this.addPropertyView = false
      // this.addNodeForm.name = ''
      // this.addNodeForm.type = ''
      this.addNodeForm.property = {}
      this.editProperty = []
      this.addPropertyView = false
      this.dropDownValueSource = ''
      this.dropDownValueTarget = ''
      this.kgNodesSourceShow = this.kgNodes
      this.kgNodesTargetShow = this.kgNodes
      // this.addLinkForm.sourceId = ''
      // this.addLinkForm.targetId = ''
      // this.addLinkForm.name = ''
      this.$refs.addNodeFormRef.resetFields()
      this.$refs.addLinkFormRef.resetFields()
    },
    dropDownSearchSource() {
      this.addLinkForm.sourceId = []
      this.kgNodesSourceShow = this.kgNodes.filter(this.filterSearch)
    },
    dropDownSearchTarget() {
      this.addLinkForm.targetId = []
      this.kgNodesTargetShow = this.kgNodes.filter(this.filterSearch2)
    },
    clearValueSource(callback) {
      if (!callback) {
        this.dropDownValueSource = ''
        this.kgNodesSourceShow = this.kgNodes
      }
    },
    clearValueTarget(callback) {
      if (!callback) {
        this.dropDownValueTarget = ''
        this.kgNodesTargetShow = this.kgNodes
      }
    },
    filterSearch(item) {
      return item.name.includes(this.dropDownValueSource)
    },
    filterSearch2(item) {
      return item.name.includes(this.dropDownValueTarget)
    },

    addPropertyInput() {
      this.addPropertyView = true
      this.editProperty.push(// 增加就push进数组一个新值
        {
          0: '',
          1: ''
        }
      )
    },
    deletePropertyInput(item, index) {
      this.editProperty.splice(index, 1)// 删除了数组中对应的数据也就将这个位置的输入框删除
      if (this.editProperty.length == 0) {
        this.addPropertyView = false
      }
    },
    // 获取图谱总节点数
    getNodeCount() {
      this.$http.get('KG/getGraph', {
        params: {
          domain: this.domain
        }
      }).then(res => {
        this.nodecount = res.data.data.node.length
      })
    },
    // 图谱渲染完成后调用此方法获取直接关系推理结果
    getRelationReason() {
      const relMap = new Map()
      for (const link of this.kgLinks) {
        if (relMap.has(link.name)) {
          relMap.get(link.name).push({
            sourceName: link.source.name,
            targetName: link.target.name
          })
        } else {
          relMap.set(link.name, new Array({
            sourceName: link.source.name,
            targetName: link.target.name
          }))
        }
      }
      this.$emit('getRelationReason', relMap)
    },
    // 根据whichParent判断删除操作
    deleteNodeFn() {
      if (this.isChosen) {
        if (this.whichParent === '0') {
          // this.deleteMysqlNode()
          this.deleteNeo4jNode()
        } else {
          this.deleteNeo4jNode()
        }
      } else {
        return this.$message.warning('请先选中节点')
      }
    },
    // 双击删除或修改关系，显示Dialog,读取的“d”为link全部信息，包括id，index，name，size
    deleteOrEditLink(d) {
      // console.log(this.domain);
      if (this.domain === '事理图谱') return
      if (this.graphId === -1 && this.whichParent === '0') {
        this.$message.warning('请先选择或保存子图')
        return
      }
      this.dialogEditLinkVisible = true
      // 设置修改的关系id
      this.relationPro = d
      this.relationProNameTmp = d.name
    },
    // 删除关系
    deleteLink() {
      this.relationPro.name = this.relationProNameTmp
      const relationProTmp = this.relationPro
      const source_name = this.relationPro.source.name
      const target_name = this.relationPro.target.name
      const rel_name = this.relationPro.name
      this.$confirm('是否确定删除\"' + source_name + '\"与\"' + target_name + '\"之间的\"' + rel_name + '\"关系', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 发送请求删除关系
        this.$http.delete('KG/rel', {
          params: {
            id: relationProTmp.id
          }
        }).then(response => {
          if (response.data.code === 200) {
            this.$message.success('删除关系成功')
            this.kgLinks.splice(relationProTmp.index, 1)
            this.renderGraph({
              nodes: this.kgNodes,
              links: this.kgLinks
            })
          } else {
            // 删除失败处理
            this.$message.error('删除失败，请刷新重试')
          }
          // 关闭对话框
          this.dialogEditLinkVisible = false
        })
      })
        .catch(action => {
          this.$message('取消删除')
          // 关闭对话框
          this.dialogEditLinkVisible = false
        })
      this.relationPro = -1
    },
    // 修改关系类型
    editLink() {
      // this.relationPro.name = this.relationProNameTmp
      this.$http.get('KG/editRel', {
        params: {
          source: this.relationPro.source.id,
          target: this.relationPro.target.id,
          id: this.relationPro.id,
          name: this.relationPro.name
        }
      }).then(res => {
        if (res.data.code === 200) {
          this.$message.success('修改关系成功')
          for (var i = 0; i < this.kgLinks.length; i++) {
            if (this.kgLinks[i].id === this.relationPro.id) {
              this.kgLinks[i].name = this.relationPro.name
              break
            }
          }
          // const nodesTmp = JSON.parse(JSON.stringify(this.kgNodes))
          // const linksTmp = JSON.parse(JSON.stringify(this.kgLinks))
          // this.renderGraph({
          //   nodes: [],
          //   links: []
          // })
          // this.renderGraph({
          //   nodes: nodesTmp,
          //   links: linksTmp
          // })
          // 重新渲染
          this.renderGraph({
            nodes: this.kgNodes,
            links: this.kgLinks
          })
        } else {
          // 删除失败处理
          this.$message.error('修改关系失败，请刷新重试')
        }
        // 关闭对话框
        this.dialogEditLinkVisible = false
        this.relationProNameTmp = ''
      })
    },
    // 根据whichParent判断保存子图/下载图谱
    saveGraphFn() {
      if (this.whichParent === '0') {
        this.saveChildGraph()
      } else if (this.whichParent === '1') {
        this.downLoadGraph()
      } else {
        return
      }
    },
    // 获取图数据库关系类型和节点类型
    getRelTypeAndNodeTypeFromNeo4j() {
      this.linkTypeOptions = []
      this.nodeTypeOptions = []
      // 上面是新注释掉的，不然选项显示不出来
      this.$http.get('KG/getRelLabel', {
        params: {
          domain: this.domain
        }
      }).then(res => {
        const resDataRel = res.data.data
        if (res.data.code === 200) {
          for (const rel of resDataRel) {
            this.linkTypeOptions.push({
              label: rel,
              value: rel
            })
          }
        }
      })
      this.$http.get('KG/getLabel', {
        params: {
          domain: this.domain
        }
      })
        .then(res => {
          const resData = res.data.data
          for (const item of resData) {
            // eslint-disable-next-line eqeqeq
            if (item != 'NULL' && item != this.domain) {
              this.nodeTypeOptions.push({
                label: item,
                value: item
              })
            }
          }
        })
    },
    // 根据whichParent判断添加操作
    addNodeOrLinkFn() {
      if (this.whichParent === '0') {
        // 创建节点
        if (this.addNodeOrLink === 'node') {
          this.$refs.addNodeFormRef.validate(valid => {
            if (!valid) return
            this.dialogAddLinkVisible = false
            var tempNodeForm = {
              name: this.addNodeForm.name,
              type: this.addNodeForm.type,
              property: this.addNodeForm.property
            }
            for (var ppt of this.editProperty) {
              // eslint-disable-next-line eqeqeq
              if (!(ppt[0] == '' || ppt[0] == null || ppt[1] == '' || ppt[1] == null)) {
                tempNodeForm.property[ppt[0]] = ppt[1]
              }
            }
            this.addNodeForm.name = ''
            this.addNodeForm.type = ''
            this.addNodeForm.property = {}
            this.editProperty = []
            this.addPropertyView = false
            this.$emit('insertNodeInfo', tempNodeForm)
          })
        } else if (this.addNodeOrLink === 'link') {
          this.$refs.addLinkFormRef.validate((valid) => {
            if (!valid) return
            const {sourceId, targetId, name} = this.addLinkForm
            if (sourceId === targetId) {
              return this.$message.warning('请选择不同的起始节点和终止节点')
            }
            this.dialogAddLinkVisible = false
            // this.addReletion('ga/addRelation_zy?sourceId=' + sourceId + '&targetId=' + targetId + '&type=' + name)
            this.$emit('insertRelInfo', this.addLinkForm)
            this.addLinkForm.sourceId = ''
            this.addLinkForm.targetId = ''
            this.addLinkForm.name = ''
          })
        }
        // 重新渲染
        // this.getNodeCount()
        this.renderGraph({
          nodes: this.kgNodes,
          links: this.kgLinks
        })
      } else if (this.whichParent === '1') {
        if (this.addNodeOrLink === 'node') {
          this.$refs.addNodeFormRef.validate((valid) => {
            if (valid) {
              const {name, type} = this.addNodeForm

              // 验证图谱中是否已存在该类节点
              for (const node of this.kgNodes) {
                if (name === node.name && type === node.type[0]) {
                  return this.$message.warning('当前图谱中已显示该节点')
                }
              }
              this.addNode(`graph/${type}/${name}`)
            }
          })
        } else if (this.addNodeOrLink === 'link') {
          this.$refs.addLinkFormRef.validate((valid) => {
            if (valid) {
              const {sourceId, targetId, name} = this.addLinkForm
              if (sourceId === targetId) {
                return this.$message.warning('请选择不同的起始节点和终止节点')
              }
              this.addReletion(`graph/createrel/${sourceId}/${targetId}/${name}`)
            }
          })
        }
      } else {
        return
      }
    },
    // 删除neo4j节点
    deleteNeo4jNode() {
      // // 是否选中
      // if (this.panelInfo === {}) {
      //   return
      // }
      // if (this.panelInfo.id === undefined) {
      //   return this.$message.warning('请先选中节点')
      // }
      this.$confirm('此操作将永久删除节点 \"' + this.panelInfo.name + ' \"，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$emit('deleteNodeInfo', this.panelInfo)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 删除mysql节点
    deleteMysqlNode() {
      // 先保存子图
      if (this.graphId === -1 && this.whichParent === '0') {
        this.$message({
          type: 'warning',
          message: '请先选择或保存子图'
        })
        return
      }
      // 是否选中
      if (this.panelInfo === {}) {
        return
      }
      this.$confirm('此操作将永久删除节点' + this.panelInfo.name + '，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const id = this.panelInfo.id
          this.$http.delete('ga//deleteNodeInNeo4jID?id=' + id).then(response => {
            if (response.data.code == 200) {
              // 删除单个节点和关系
              this.kgNodes.splice(this.panelInfo.index, 1)
              // this.kgNodes.splice(this.panelInfo.index, 1)
              for (let i = this.kgLinks.length - 1; i >= 0; i--) {
                if (this.kgLinks[i].source.id == id || this.kgLinks[i].target.id == id) {
                  this.kgLinks.splice(i, 1)
                }
              }
              // 重新渲染
              this.renderGraph({
                nodes: this.kgNodes,
                links: this.kgLinks
              })
              this.panelInfo = {}
              this.getNodeCount()
              return this.$message.success('删除成功')
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 根据url创建mysql/neo4j节点或者关系
    addNode(url) {
      this.$http
        .post(url)
        .then(res => {
          if (res.data.code === 200) {
            let nodeId
            if (this.whichParent === '0') {
              // nodeId = res.data.data.nodeId
              nodeId = res.data.data
            } else {
              // nodeId = res.data.data.nodeId
              nodeId = res.data.data
            }
            this.kgNodes.push({
              id: nodeId,
              name: this.addNodeForm.name,
              type: [this.addNodeForm.type],
              properties: {
                name: this.addNodeForm.name
              }
            })
            // 更新图谱
            const data = {
              nodes: this.kgNodes,
              links: this.kgLinks
            }
            this.renderGraph(data)
            // 创建成功提示
            if (res.data.data.isEntity === true) {
              this.$message.warning('该节点已存在')
            } else {
              this.$message({
                type: 'success',
                message: '创建成功'
              })
            }
            this.dialogAddLinkVisible = false
            // 清空输入框
            this.addNodeForm.name = ''
            this.addNodeForm.type = ''
            this.getNodeCount()
          }
        })
    },
    addReletion(url) {
      this.$http
        .post(url)
        .then(res => {
          if (res.data.code === 200) {
            this.kgLinks.push({
              id: res.data.data,
              name: this.addLinkForm.name,
              source: this.addLinkForm.sourceId,
              target: this.addLinkForm.targetId,
              properties: {}
            })
            // 更新图谱
            const data = {
              nodes: this.kgNodes,
              links: this.kgLinks
            }
            this.renderGraph(data)
            // 创建成功提示
            this.$message({
              type: 'success',
              message: '创建成功'
            })
            // 清除输入
            this.addLinkForm.name = ''
            this.addLinkForm.sourceId = ''
            this.addLinkForm.targetId = ''
            this.dialogAddLinkVisible = false
          }
        })
    },
    addNodeOrLinkBefore() {
      // 如果当前画布为空
      if (this.graphId === -1 && this.whichParent === '0') {
        this.$message({
          type: 'warning',
          message: '请先选择或保存子图'
        })
        return
      }

      this.dialogAddLinkVisible = true
    },
    // 渲染图谱
    renderGraph(data) {
      this.dealRealtions(data.links)
      this.kgNodes = data.nodes
      this.kgNodesSourceShow = this.kgNodes
      this.kgNodesTargetShow = this.kgNodes
      this.kgLinks = data.links
      // console.log("下面是关系");
      // console.log(this.kgLinks);
      if (this.initialized) {
        // this.updategraph({nodes:[],links:[]})
        this.updategraph(data)
      } else {
        this.initGraph(data)
        this.initialized = true
        this.updategraph(data)
      }
      this.$nextTick(() => {
        if (this.whichParent === '0') {
          this.getRelationReason()
        }
      })
      // console.log(this.links);
    },
    // 第一次渲染图谱
    initGraph(data) {
      const self = this
      // 将json转化为对象
      const links = data.links // .map(d => Object.create(d));
      const nodes = data.nodes // .map(d => Object.create(d));
      // 初始化力导向
      self.simulation = d3
        .forceSimulation(nodes)
        .force(
          'link',
          d3
            .forceLink(links)
            .id(d => d.id)
            .distance(200) // 连线的长度
        )
        .force(
          'charge',
          d3
            .forceManyBody()
            .strength(-1000)
            .distanceMin(10)
            .distanceMax(800)
        ) // 以电荷的方式 开始的力#####z
        // 设置碰撞半径 就是两个节点最近的距离
        .force('collision', d3.forceCollide(1).strength(0.1))
        .force('center', d3.forceCenter(self.width / 2, self.height / 2)) // 力导向图的中心位置
      // 创造容器
      // const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
      const svg = d3
        .select('.canvas-container')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '82vh')
      // .attr('viewBox', [0, 0, self.width, self.height])
      // 设置一个背景层，对这个背景层缩放效果好
      const bg = svg.append('g')
      // 为了解决因方向改变而导致的箭头位置问题设置两个箭头样式
      // 思路就是双箭头，分别指向source节点和target节点，然后根据方向的不同控制不同箭头的显示
      // svg
      //   .append('marker') // 让连线和箭头关联
      //   .attr('id', 'positiveMarker')
      //   .attr('orient', 'auto')
      //   .attr('stroke-width', 2)
      //   .attr('markerUnits', 'strokeWidth')
      //   .attr('markerUnits', 'userSpaceOnUse')
      //   .attr('viewBox', '0 -5 10 10') // 箭头所在的合适范围
      //   // refX 标记位置在路径开始处的点
      //   .attr('refX', 50) // 箭头在方向上的偏移 让箭头露出
      //   .attr('refY', 0) // 离左右连线偏移
      //   .attr('markerWidth', 12)
      //   .attr('markerHeight', 12)
      //   .append('path') // 增加路径类型标签 注意不是属性
      //   .attr('d', 'M 0 -5 L 10 0 L 0 5') // 设置路径
      //   .attr('fill', '#999') // 填充和不可见度
      //   .attr('stroke-opacity', 0.6)

      svg
        .append('marker') // 让连线和箭头关联
        .attr('id', 'positiveMarker')
        .attr('orient', 'auto')
        .attr('stroke-width', 2)
        .attr('markerUnits', 'strokeWidth')
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('viewBox', '0 -5 10 10') // 箭头所在的合适范围
        // refX 标记位置在路径开始处的点
        .attr('refX', 11) // 箭头在方向上的偏移 让箭头露出
        .attr('refY', 0) // 离左右连线偏移
        .attr('markerWidth', 12)
        .attr('markerHeight', 12)
        .append('path') // 增加路径类型标签 注意不是属性
        .attr('d', 'M 0 -5 L 10 0 L 0 5') // 设置路径
        .attr('fill', '#999') // 填充和不可见度
        .attr('stroke-opacity', 0.6)
      // svg
      //   .append('marker') // 让连线和箭头关联
      //   .attr('id', 'negativeMarker')
      //   .attr('orient', 'auto')
      //   .attr('stroke-width', 2)
      //   .attr('markerUnits', 'strokeWidth')
      //   .attr('markerUnits', 'userSpaceOnUse')
      //   .attr('viewBox', '0 -5 10 10') // 箭头所在的合适范围
      //   .attr('refX', 0) // 箭头在方向上的偏移 让箭头露出
      //   .attr('refY', 0) // 离左右连线偏移
      //   .attr('markerWidth', 12)
      //   .attr('markerHeight', 12)
      //   .append('path') // 增加路径类型标签 注意不是属性
      //   .attr('d', 'M 0 0 L 10 5 L 10 -5') // 设置路径
      //   .attr('fill', '#999') // 填充和不可见度
      //   .attr('stroke-opacity', 0.6)
      svg
        .append('marker') // 让连线和箭头关联
        .attr('id', 'negativeMarker')
        .attr('orient', 'auto')
        .attr('stroke-width', 2)
        .attr('markerUnits', 'strokeWidth')
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('viewBox', '0 -5 10 10') // 箭头所在的合适范围
        .attr('refX', 0) // 箭头在方向上的偏移 让箭头露出
        .attr('refY', 0) // 离左右连线偏移
        .attr('markerWidth', 12)
        .attr('markerHeight', 12)
        .append('path') // 增加路径类型标签 注意不是属性
        .attr('d', 'M 0 0 L 10 5 L 10 -5') // 设置路径
        .attr('fill', '#999') // 填充和不可见度
        .attr('stroke-opacity', 0.6)
      // 绑定缩放事件
      svg
        .call(
          d3
            .zoom()
            .scaleExtent([0.1, 2]) // 增加缩放范围
            .on('zoom', function () {
              bg.attr('transform', d3.event.transform)
            })
        )
        .on('dblclick.zoom', () => {
        }) // 取消双击缩放
      // 构建连接线样式
      self.links = bg
        .append('g')
        .selectAll('path') // 用path 比line更灵活
        .data(links, function (d) {
          if (typeof d.source === 'object') {
            return d.source.id + '_' + d.name + '_' + d.target.id
          } else {
            return d.source + '_' + d.name + '_' + d.target
          }
        })
        .join('path')
        .attr('class', 'link')
        .attr('fill', 'transparent')//透明，解决了和其他线重叠时覆盖的问题
        //上面是新加的
        // .attr('stroke', d => self.displayLinks(d))
        .attr('id', function (d) {
          if (typeof d.source === 'object') {
            return d.source.id + '_' + d.name + '_' + d.target.id
          } else {
            return d.source + '_' + d.name + '_' + d.target
          }
        }) // 作为连线的id,让连线上的文字可以找到相应连线
      // 构建连接线的文本层
      self.linksName = bg
        .append('g')
        .selectAll('text')
        .data(links)
        .join('text')
        .attr('class', 'linksName')
        // 单击修改属性，双击删除

        .on('dblclick', self.deleteOrEditLink)
        // .attr("fill", d => {
        //   return self.displayLinks(d)
        // })
        .append('textPath')
        .attr('xlink:href', function (d) {
          // 因为更新后d.source会变为一个对象，所以判断是否是对象然后取对象的id作为BM链接
          if (typeof d.source === 'object') {
            return '#' + d.source.id + '_' + d.name + '_' + d.target.id
          } else {
            return '#' + d.source + '_' + d.name + '_' + d.target
          }
        })
        .attr('startOffset', '50%') // 属性名写错导致不会生效
        .text(function (d) {
          return d.name
        })

      // 构建节点样式
      self.nodes = bg
        .append('g')
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('class', 'node') // 设置在前面，样式就会应用于所有节点
        .attr('r', 30)
        .attr('fill', self.color())
        // .on("dblclick", self.queryProp) //双击事件获得属性
        .on('click', self.queryTest) // 单击事件获得信息面板的关系
        .call(self.drag(self.simulation))
      // 增加节点的名字
      self.nodes.append('title').text(d => d.name)
      // 节点文本层
      self.nodeText = bg
        .append('g')
        .selectAll('text') // 选择所有的text元素
        .data(nodes) // 绑定源数据
        .join('text') // 连接起来
        .text(d => {
          const name = d.name
          const len = this.nodeTextLengthList.has(d.type)
            ? this.nodeTextLengthList.get(d.type)
            : 6
          if (name.length > len) return name.slice(0, len) + '...'
          return d.name
        })
        .attr('dy', 2)
        .style('pointer-events', 'none')
        .attr('class', 'node-text')
      // 将层与仿真关联起来
      self.simulation.on('tick', () => {
        // 设置连接线的跟随
        // 根据源节点与BM节点的相对关系设置 路径方向
        self.links
          .attr('d', function (d) { // 连接线
            var linePadding = 0 // 给连线到节点间的距离
            var deltaX = d.target.x - d.source.x
            var deltaY = d.target.y - d.source.y
            var dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
            var normX = deltaX / dist
            var normY = deltaY / dist
            var sourceX = d.source.x + (linePadding * normX)
            var sourceY = d.source.y + (linePadding * normY)
            var targetX = d.target.x - (linePadding * normX)
            var targetY = d.target.y - (linePadding * normY)
            if (d.target === d.source) {
              dr = 38 / d.linknum
              return 'M' + sourceX + ',' + sourceY + 'A' + dr + ',' + dr + ' 0 1,1 ' + targetX + ',' + (targetY + 1)
            } else if (d.size % 2 !== 0 && d.linknum === 1) {
              return 'M' + sourceX + ' ' + sourceY + ' L ' + targetX + ' ' + targetY
            }
            var curve = 1.5
            var homogeneous = 1.2
            var dr = Math.sqrt(deltaX * deltaX + deltaY * deltaY) * (d.linknum + homogeneous) / (curve * homogeneous)
            // 当节点编号为负数时，对弧形进行反向凹凸，达到对称效果
            if (d.linknum < 0) {
              dr = Math.sqrt(deltaX * deltaX + deltaY * deltaY) * (-1 * d.linknum + homogeneous) / (curve * homogeneous)
              return 'M' + sourceX + ',' + sourceY + 'A' + dr + ',' + dr + ' 0 0,0 ' + targetX + ',' + targetY
            }
            // console.log('M' + sourceX + ' ' + sourceY + ' A' + dr + ' ' + dr + ' 0 0 1 ' + targetX + ' ' + targetY);
            return 'M' + sourceX + ' ' + sourceY + ' A' + dr + ' ' + dr + ' 0 0 1 ' + targetX + ' ' + targetY
            // return 'M' + sourceX + ',' + sourceY + 'A' + dr + ',' + dr + ' 0 0,1 ' + targetX + ',' + targetY
          //  上一行注释里是原来的，好像没区别，弯曲效果的问题好像是因为被下面覆盖了
          })


          .attr('d', function (d) {

            var deltaX = d.target.x - d.source.x
            var deltaY = d.target.y - d.source.y
            var curve = 1.5
            var homogeneous = 1.2
            var v1=d.linknum<0?-1:1
            var dr = Math.sqrt(deltaX * deltaX + deltaY * deltaY) * (v1 * d.linknum + homogeneous) / (curve * homogeneous)

            // 这个是为了解决文字方向的问题
            if (d.target === d.source) {
              dr = 38 / d.linknum
              return 'M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr + ' 0 1,1 ' + d.target.x + ',' + (d.target.y + 1)
            } else if (d.size % 2 !== 0 && d.linknum === 1) { //这里大概是设置单条连接的线？还有点问题，比如3条的时候，不过大概没有3条的情况
              // return 'M' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y
              if (d.source.x < d.target.x) {
                return (
                  'M ' +
                  self.getCoord(d.target, d.source) +
                  ' L ' +
                  self.getCoord(d.source, d.target)
                )
              } else {
                return (
                  'M ' +
                  self.getCoord(d.source, d.target) +
                  ' L ' +
                  self.getCoord(d.target, d.source)
                )
              }
            }
            //下面大概是a指向b一条，b指向a一条的情况，对称曲线
            if (d.source.x < d.target.x) {
              return (
                // 'M ' +
                // self.getCoord(d.target, d.source) +
                // ' L ' +
                // self.getCoord(d.source, d.target)
                'M ' +
                self.getCoord(d.target, d.source) +
                ' A ' + dr + ' ' + dr + ' 0 0 0' + ' ' +
                self.getCoord(d.source, d.target)
              )
            } else {
              return (
                // 'M ' +
                // self.getCoord(d.source, d.target) +
                // ' L ' +
                // self.getCoord(d.target, d.source)
                'M ' +
                self.getCoord(d.source, d.target) +
                ' A ' + dr + ' ' + dr + ' 0 0 1' + ' ' +
                self.getCoord(d.target, d.source)
              )
            }
          })
          //  上面这里改过了，注释里是原来的，现在这样所有线都弯，还是不对
          // 根据方向不同选择显示不同的marker
          // 这是由于解决文字方向而引起的附加问题
          // 对于尾端，如果是源节点指向目的节点的时候要在尾部加箭头
          .attr('marker-end', function (d) {
            if (d.source.x < d.target.x) {
              return 'url(#positiveMarker)'
            } else {
              return null
            }
          })
          .attr('marker-start', function (d) {
            if (d.source.x > d.target.x) {
              // 如果源节点比目的节点大的时候，就认为是目的节点是源节点
              return 'url(#negativeMarker)'
            } else {
              return null
            }
          })
        self.nodes.attr('cx', d => d.x).attr('cy', d => d.y)
        // 这个x,y是由什么决定的 是由 text的属性决定的 svg中text标签的属性
        self.nodeText.attr('x', d => d.x).attr('y', d => d.y)
      })
    },
    // 给出源节点和BM节点，返回BM节点的边上距离源节点最近的点的坐标
    getCoord(source, target) {
      // 根据BM节点的类型，计算路径的长度，让路径指向BM节点的边，而不是圆心
      let r = 30
      if (this.nodeSizeList.has(target.type)) {
        r = this.nodeSizeList.get(target.type)
      }
      const scale =
        r /
        Math.sqrt(
          Math.pow(target.y - source.y, 2) + Math.pow(target.x - source.x, 2)
        )
      const targetX = target.x - scale * (target.x - source.x)
      const targetY = target.y - scale * (target.y - source.y)
      return targetX + ' ' + targetY
    },
    color() {
      return d => this.scale(d.type)
    },
    // 显示选择的边
    displayLinks(d) {
      return this.scale(d.name)
    },
    drag(simulation) {
      function dragstarted(d) {
        if (!d.active) simulation.alphaTarget(0.3).restart()
        // 不知道为什么网页上的例子变成了这种写法 event.subject.x; 可能是版本不同，写法不i一样了
        d.fx = d.x
        d.fy = d.y
      }

      function dragged(d) {
        d.fx = d3.event.x // d3事件获得鼠标拖动BM的位置然后付给BM
        d.fy = d3.event.y
      }

      function dragended(d) {
        if (!d.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      }

      return d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    },
    // 单击节点获取信息面板信息
    queryTest(d) {
      this.panelInfo = d
      // 直接获得点击节点及其数据
      this.$emit('clickNode', d)
    },
    // 双击节点查询属性
    // queryProp(d) {
    //   this.$emit("dbclickNode", d);
    // },
    // 更新图谱
    updategraph(data) {
      const self = this
      // 解决重复点击线条残留问题
      const links = data.links
      const nodes = data.nodes
      // 更新连线
      self.links = self.links
        .data(links, function (d) {
          if (typeof d.source === 'object') {
            return d.source.id + '_' + d.name + '_' + d.target.id
          } else {
            return d.source + '_' + d.name + '_' + d.target
          }
        })
        .join('path') // 设置对象
        .merge(self.links)
        .attr('class', 'link')
        .attr('fill', 'transparent')
        .attr('stroke', d => self.displayLinks(d))
        .attr('id', function (d) {
          // 为了解决再次点击之后 source变为节点而导致的获取不到id的情况
          if (typeof d.source === 'object') {
            return d.source.id + '_' + d.name + '_' + d.target.id
          } else {
            return d.source + '_' + d.name + '_' + d.target
          }
        })
      // 更新连线上的文字
      // 构建连接线的文本层
      self.linksName = self.linksName
        .data(links, function (d) {
          if (typeof d.source === 'object') {
            return d.source.id + '_' + d.name + '_' + d.target.id
          } else {
            return d.source + '_' + d.name + '_' + d.target
          }
        })
        //下面这一行逆天了，找了我一天的bug，看不懂代码一行一行试
        //去掉之后，按名称/类别查找没问题，但添加关系会有问题，name不能马上显示
        .join('text')
        //下面这行原来linksName是空格，改成现在这样之后好了
        .attr('class', 'linksName')
        .on('dblclick', self.deleteOrEditLink)
        // .attr('fill', d => {
        //   return self.displayLinks(d)
        // })
        //去掉下面这行后文字不重叠了，但出现了位置不对的问题
        .append('textPath')
        .attr(
          'xlink:href',
          function (d) {
            if (typeof d.source === 'object') {
              return '#' + d.source.id + '_' + d.name + '_' + d.target.id
            } else {
              return '#' + d.source + '_' + d.name + '_' + d.target
            }
          }
          // d => "#" + d.source + "_" + d.name + "_" + d.target
        )
        .attr('startOffset', '50%')
        .text(function (d) {
          return d.name
        })
        .merge(self.linksName)
        // .append('text')
        //下面这行很卡
        // .selectAll('text')
        //加了下面这行可以对 比原来增加关系的 查找正确操作，但有文字重叠的新问题
        .enter()
      // 更新节点
      self.nodes = self.nodes
        .data(nodes)
        .join('circle') // 会自动处理增加减少的节点
        .merge(self.nodes)
        // .on("dblclick", self.queryProp) //双击事件获得属性
        .on('click', self.queryTest) // 单击事件获得信息面板的关系
        .call(self.drag(self.simulation))
        .attr('class', 'node') // 设置在前面，样式就会应用于所有节点
        .attr('r', function (d) {
          if (self.nodeSizeList.has(d.type)) {
            return self.nodeSizeList.get(d.type)
          }
          return 30
        })
        .attr('fill', self.color())
      // 增加节点的名字
      self.nodes.append('title').text(d => d.name)
      // 字没跟着走 ,因为文字层没更新
      // 节点文本层
      self.nodeText = self.nodeText
        .data(nodes) // 绑定源数据
        .join('text') // 连接起来
        .merge(self.nodeText)
        .text(d => {
          const name = d.name
          const len = this.nodeTextLengthList.has(d.type)
            ? this.nodeTextLengthList.get(d.type)
            : 6
          if (name.length > len) return name.slice(0, len) + '...'
          return d.name
        })
        .attr('dy', 2)
        .style('pointer-events', 'none')
        .attr('class', 'node-text')
      // 更新力
      self.simulation.nodes(nodes)
      self.simulation
        .force('link')
        // .id(d => d.index)
        .links(links)
      self.simulation.alpha(1).restart()
    },
    // 保存子图
    saveChildGraph() {
      if (this.kgNodes.length === 0) {
        return this.$message.warning('当前图谱为空')
      }
      this.$prompt('请输入该子图名称', '保存子图', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '名称不能为空'
      }).then(({value}) => {
        // 将source改为sourceId
        this.loading = true
        const newLinks = []
        for (const item of this.kgLinks) {
          newLinks.push({
            id: item.id,
            sourceId: item.source.id,
            targetId: item.target.id,
            properties: {},
            name: item.name
          })
        }
        const params = {
          graph: {
            nodes: this.kgNodes,
            links: newLinks
          }
        }
        this.$http
          .post('/ga/saveGraph?name=' + value + '&type=' + this.analysisType, params)
          .then(res => {
            this.loading = false
            if (res.data.code == 200) {
              this.$message({
                type: 'success',
                message: '保存成功'
              })
              // 保存成功后重新获取子图列表，选择框显示当前子图
              const data = {
                name: value,
                graphList: res.data.data.graphList
              }
              this.$emit('getGraphList', data)
              // 获取子图id之后添加节点或边用
              this.$store.commit('setChildGraphId', res.data.data.id)
            }
          })
          .catch(error => {
            this.loading = false
            this.$message({
              type: 'warning',
              message: '操作超时，请重试'
            })
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      })
    },
    // 下载子图
    downLoadGraph() {
      if (
        !d3
          .select('.canvas-container')
          .select('svg')
          .node()
      ) {
        this.$message({
          showClose: true,
          message: '没有要下载的图谱'
        })
        return
      }
      const date = new Date()
      const pictureName = 'BM图谱_' + date.toLocaleString() + '.png'
      saveSvgAsPng(
        d3
          .select('.canvas-container')
          .select('svg')
          .node(),
        pictureName,
        {
          scale: 10
        }
      )
    },
    dealRealtions(links) {
      var linkGroup = {} // 用来分组，将两点之间的连线进行归类
      var linkMap = {} // 对连接线的计数
      for (var i = 0; i < links.length; i++) {
        if (typeof links[i].source === 'object') {
          var key = links[i].source.id < links[i].target.id ? links[i].source.id + ':' + links[i].target.id : links[i].target.id + ':' + links[i].source.id
        } else {
          var key = links[i].source < links[i].target ? links[i].source + ':' + links[i].target : links[i].target + ':' + links[i].source
        }
        if (!linkMap.hasOwnProperty(key)) {
          linkMap[key] = 0
        }
        linkMap[key] += 1
        if (!linkGroup.hasOwnProperty(key)) {
          linkGroup[key] = []
        }
        linkGroup[key].push(links[i])
      }
      // 为每一条连接线分配size属性，同时对每一组连接线进行编号
      for (var i = 0; i < links.length; i++) {
        if (typeof links[i].source === 'object') {
          var key = links[i].source.id < links[i].target.id ? links[i].source.id + ':' + links[i].target.id : links[i].target.id + ':' + links[i].source.id
        } else {
          var key = links[i].source < links[i].target ? links[i].source + ':' + links[i].target : links[i].target + ':' + links[i].source
        }
        links[i].size = linkMap[key]
        // 同一组的关系进行编号
        var group = linkGroup[key]
        var keyPair = key.split(':')
        var type = 'noself'
        if (keyPair[0] == keyPair[1]) { // 指向两个不同实体还是同一个实体
          type = 'self'
        }
        this.setLinkNumber(group, type) // 给关系编号
      }
    },
    setLinkNumber(group, type) {
      if (group.length === 0) return
      // 对该分组内的关系按照方向进行分类，此处根据连接的实体ASCII值大小分成两部分
      var linksA = [];
      var linksB = []
      for (var i = 0; i < group.length; i++) {
        var link = group[i]
        if (typeof link.source === 'object') {
          if (link.source.id < link.target.id) {
            linksA.push(link)
          } else {
            linksB.push(link)
          }
        } else {
          if (link.source < link.target) {
            linksA.push(link)
          } else {
            linksB.push(link)
          }
        }
      }
      // 确定关系最大编号。为了使得连接两个实体的关系曲线呈现对称，根据关系数量奇偶性进行平分。
      // 特殊情况：当关系都是连接到同一个实体时，不平分
      var maxLinkNumber = 1
      if (type === 'self') {
        maxLinkNumber = group.length
      } else {
        maxLinkNumber = group.length % 2 === 0 ? group.length / 2 : (group.length + 1) / 2
      }
      // 如果两个方向的关系数量一样多，直接分别设置编号即可
      if (linksA.length === linksB.length) {
        var startLinkNumber = 1
        for (var i = 0; i < linksA.length; i++) {
          linksA[i].linknum = startLinkNumber++
          // console.log("linksAnum=");
          // console.log(linksA[i]);
        }
        startLinkNumber = 1
        for (var i = 0; i < linksB.length; i++) {
          linksB[i].linknum = startLinkNumber++
          // console.log("linksBnum=");
          // console.log(linksB[i]);
        }
      }
      else { // 当两个方向的关系数量不对等时，先对数量少的那组关系从最大编号值进行逆序编号，然后在对另一组数量多的关系从编号1一直编号到最大编号，再对剩余关系进行负编号
        // 如果抛开负号，可以发现，最终所有关系的编号序列一定是对称的（对称是为了保证后续绘图时曲线的弯曲程度也是对称的）
        var biggerLinks, smallerLinks
        if (linksA.length > linksB.length) {
          biggerLinks = linksA
          smallerLinks = linksB
        } else {
          biggerLinks = linksB
          smallerLinks = linksA
        }

        var startLinkNumber = maxLinkNumber
        for (var i = 0; i < smallerLinks.length; i++) {
          smallerLinks[i].linknum = startLinkNumber--
        }
        var tmpNumber = startLinkNumber

        startLinkNumber = 1
        var p = 0
        while (startLinkNumber <= maxLinkNumber) {
          biggerLinks[p++].linknum = startLinkNumber++
        }
        // 开始负编号
        startLinkNumber = 0 - tmpNumber
        for (var i = p; i < biggerLinks.length; i++) {
          biggerLinks[i].linknum = startLinkNumber++
        }
      }
    },
  }
}
</script>

<style>
/* 调整按钮颜色 */
.deleteBtn {
  background-color: #D9001B !important;
  border-color: #D9001B !important;
}

.addBtn {
  background-color: #05FAFF !important;
  border-color: #05FAFF !important;
}

.saveBtn {
  background-color: #FF9500 !important;
  border-color: #FF9500 !important;
}

.container {
  display: flex;
}

.canvas-container {
  background: #e4e4e4;
  border: 1px solid #ffffff;
  border-radius: 4px;
  width: 32vh;
  height: 82vh;
  flex: 1 1 auto;
  position: relative;
}

.node {
  stroke: #cfebfe;
  stroke-width: 1;
  cursor: pointer;
}

.node:hover {
  stroke-width: 5px;
}

.node-text {
  fill: #ffffff;
  text-anchor: middle;
  font-size: 12px;
  user-select: none;
}

.link {
  /* stroke: rgb(175, 175, 175); */
  stroke-opacity: 0.6;
  stroke-width: 1.85;
}

.linksName {
  text-anchor: middle;
  cursor: pointer;
  /* fill: #4a5a6a; */
  font-size: 12px;
  /* font-weight: bold; */
}

.saveChildGraphBtn {
  position: absolute;
  bottom: 10px;
  right: 20px;
}

.addLinkBtn {
  position: absolute;
  bottom: 10px;
  right: 100px;
}
</style>
