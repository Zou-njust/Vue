<template>
  <div>
    <!--    面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>知识模型</el-breadcrumb-item>
      <el-breadcrumb-item>事理图谱</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图区域-->
    <el-card style="border:none;" body-style="margin:5px; padding:0; height:98vh;overflow: auto">
      <!--      <div slot="header" class="card-header">-->
      <!-- 搜索框 -->
      <div>
        <el-scrollbar>
          <el-form ref="form" :inline="true" :model="form" class="scrollbar-flex-content">
            <el-form-item label="查询类型" class="scrollbar-demo-item1" style="margin-left: 10px">
              <el-select v-model="chosenPlaneType" placeholder="请选择查询类型" style="width: 150px">
                <el-option v-for="(item, index) in form.searchType" :label="item" :value="item" :key="index"/>
              </el-select>
              <el-button v-show="form.searchTypeValue===''" type="primary" icon="el-icon-search" style="margin-left: 20px"
                         @click="search">查看事理图谱
              </el-button>
            </el-form-item>
            <el-form-item v-show="form.searchTypeValue === '按节点查询'" label="关键词" class="scrollbar-demo-item1">
              <el-input v-model="form.nodeInput" placeholder="请输入节点标签或属性" style="width: 350px"/>
            </el-form-item>
            <el-form-item v-show="form.searchTypeValue === '按节点查询'" class="scrollbar-demo-item3">
              <el-button style="margin-left:10px;" type="primary" icon="el-icon-search" @click="searchByProperty"/>
              <el-button type="primary" icon="el-icon-search" @click="search">查看事理图谱</el-button>
            </el-form-item>
            <el-form-item v-show="form.searchTypeValue === '按关系查询'" label="关系名" class="scrollbar-demo-item1">
              <!--            <el-input v-model="form.relInput" placeholder="请输入关系名称" style="width: 350px" />-->
              <el-select v-model="form.relInput" placeholder="请选择关系" style="width: 350px">
                <el-option
                  v-for="item in linkTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-show="form.searchTypeValue == '按关系查询'" class="scrollbar-demo-item3">
              <el-button style="margin-left:10px;" type="primary" icon="el-icon-search" @click="searchByRel"/>
              <el-button type="primary" icon="el-icon-search" @click="search">查看事理图谱</el-button>
            </el-form-item>
          </el-form>
        </el-scrollbar>
      </div>
      <div style="height: 100%">
        <div style="width:100%;float:left">
          <!-- 引入画布 -->
          <cvs
            ref="cvs"
            which-parent="0"
            domain="事理图谱"
            :is-chosen="panelInfo.id!==undefined"
            @clickNode="queryNodeInfo"
            @dbclickNode="queryNodeProp"
            @insertNodeInfo="insertNode"
            @insertRelInfo="insertRel"
            @deleteNodeInfo="deleteNode"
          >
            <detail-panel
              domain="事理图谱"
              :relation-ship="relations"
              class="detail-panel"
              :panel-info="panelInfo"
              which-parent="0"
              @getNewGraphSource="getNewGraphSource"
            />
            <el-dialog :visible.sync="insertRelVis" title="请输入添加关系的信息">
              <el-input v-model="insertRelValue" placeholder="请输入边名"/>
              <div slot="footer" class="dialog-footer">
                <el-button
                  @click="
                  insertRelVis = false
                "
                >取 消
                </el-button>
                <el-button type="primary" @click="insertRel">确 定</el-button>
              </div>
            </el-dialog>
          </cvs>
        </div>
        <div class="cvs-footer">
          <div v-show="currentLabel" style="display:flex;align-items:baseline;">
            <span>Size:</span>
            <ul class="size-ul">
              <li v-for="(size, i) in sizes" :key="'size-' + i" class="size-li">
                <a :style="`height:${size};width:${size};`" class="size-item" @click="selectSize(i)"/>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import DetailPanel from '../KG/DetailPanel'
import Canvas from '../KG/Canvas'
export default {
  name: "IntentionAtlas",
  components: {
    // eslint-disable-next-line vue/no-unused-components
    // cvs: Zscanvas,
    cvs: Canvas,
    DetailPanel: DetailPanel
    // DetailPanel: zsDetailPanel
  },
  props: {
    isShow: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      // 图谱
      domain: '事理图谱',
      // 搜索框表单
      chosenPlaneType:'战斗机',
      form: {
        labelType: [],
        labelSelect: '',
        propertySelect: '',
        propertyType: [],
        propertyInput: '',
        searchType: ['战斗机','轰炸机'],
        searchTypeValue: '',
        relInput: '',
        nodeInput: ''
      },
      // 查询节点id
      queryId: '',
      // 显示取消按钮
      cancleVis: false,
      // 边输入值
      insertRelValue: '',
      // 显示输入边名
      insertRelVis: false,
      // 删除的边
      delRelSource: '',
      // 边
      rel: {
        source: '',
        target: '',
        name: ''
      },
      // 编辑节点弹窗显示
      editVis: false,
      // 添加节点弹窗显示
      insertVis: false,
      // 通过canvas传给panel的关系数组
      btnVis: false,
      relations: [],
      // 传给信息面板的内容
      panelInfo: {properties: {}},
      // 查询内容
      options: [],
      // 传入画布上节点和边的数据源
      graphSource: {nodes: [], links: []},
      // 对数据源的一些统计结果
      graphInfo: {
        nodesInfo: [], // label:numbers
        linksInfo: [] // type:numbers
      },
      // 当前选中的节点标签
      currentLabel: '',
      // 型号列表
      sizes: ['12px', '14px', '16px', '18px', '20px'],
      // 搜索类型
      searchValue: [
        '轰炸机', '乘员'
      ],
      searchContent: '4',
      // 方便删除和避免重复添加 id 节点的id index 该节点对应的属性边和节点在数据源中的起始位置和个数
      idToIndexList: new Map(),
      linkTypeOptions: [],
    }
  },
  created() {
    // 获得页面基本信息，得到全部标签
    this.getSearchLabel()
    this.getRelName()
    // if (!(this.$route.params.id == '' || this.$route.params.id == null)) {
    //   this.searchById(this.$route.params.id)
    // }

    // if (!(localStorage.getItem('id') == null || localStorage.getItem('id') == '')) {
    //   this.queryId = localStorage.getItem('id')
    //   // this.search()
    //   this.searchById(this.queryId)
    //   localStorage.removeItem('id')
    //   // this.queryNodeInfo(this.queryData)
    // }

    if (!(window.sessionStorage.getItem('id') == null || window.sessionStorage.getItem('id') == '')) {
      this.queryId = window.sessionStorage.getItem('id')
      // this.search()
      this.searchById(this.queryId)
      window.sessionStorage.removeItem('id')
      // this.queryNodeInfo(this.queryData)
    }

    else if (!(this.$route.query.id == null || this.$route.query.id == '')) {
      this.queryId = this.$route.query.id
      this.searchById(this.queryId)
    }
    else{
      this.search()
    }
  },
  beforeDestroy() {
    // localStorage.clear()
    // window.sessionStorage.clear()
  },
  methods: {
    getRelName() {
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
    },
    getNewGraphSource(newGraphSource) {
      const out = JSON.parse(JSON.stringify(newGraphSource))
      // 处理新数据源中不同方向但同名的关系
      // if (Array.isArray(newGraphSource.links)){
      //   for (let i = newGraphSource.links.length - 1; i >= 0; i--) {
      //     for(let j = i-1; j >= 0; j--){
      //       if (
      //         newGraphSource.links[i].source ==
      //         newGraphSource.links[j].target &&
      //         newGraphSource.links[i].target == newGraphSource.links[j].source && newGraphSource.links[i].name == newGraphSource.links[j].name
      //       ) {
      //         newGraphSource.links.splice(i,1);
      //       }
      //     }
      //   }
      // }
      // 将新数据源合并到之前的数据源中
      // 根据id判断节点是否存在 防止重复添加
      const isExist = function (objArr, id) {
        // eslint-disable-next-line no-debugger
        // debugger;
        for (const obj of objArr) {
          if (obj.id === id) return true
        }
        return false
      }
      // 增量更新边和节点
      const {nodes, links} = newGraphSource
      for (const node of nodes) {
        if (!isExist(this.graphSource.nodes, node.id)) {
          this.graphSource.nodes.push(node)
        }
      }
      for (const link of links) {
        // 边不存在
        if (!isExist(this.graphSource.links, link.id)) {
          this.graphSource.links.push(link)
        }
      }
      this.$refs['cvs'].renderGraph(this.graphSource)
    },
    // 获得页面基本信息，得到全部标签
    getSearchLabel() {
      const self = this
      self.$http.get('KG/getLabel', {
        // self.axios.get('http://192.168.43.1:8082/KG/getLabel', {
        params: {
          domain: this.domain
        }
      }).then(response => {
        this.form.labelType = response.data.data
      })
    },
    getSearchLabelProperty() {
      this.form.propertySelect = ''
      const self = this
      self.$http.get('KG/getLabelProperty', {
        // self.axios.get('http://192.168.43.1:8082/KG/getLabelProperty', {
        params: {
          domain: this.domain,
          label: this.form.labelSelect
        }
      }).then(response => {
        this.form.propertyType = response.data.data
      })
    },
    cancle() {
      this.cancleVis = false
      this.rel.source = ''
      this.delRelSource = ''
    },
    deleteRelSource(id) {
      this.delRelSource = id
      this.$message.info('请选择删除关系的目标节点！')
      this.cancleVis = true
    },
    insertRelSource(id) {
      this.rel.source = id
      this.$message.info('请选择连线的目标节点！')
      this.cancleVis = true
    },
    searchByRel() {
      const self = this
      self.$http.get('KG/searchByRel', {
        params: {
          domain: self.domain,
          relName: self.form.relInput
        }
      }).then(response => {
        if (!(this.graphSource.nodes == '' || this.graphSource.nodes == null) || !(this.graphSource.links == '' || this.graphSource.links == null)) {
          this.graphSource.nodes = []
          this.graphSource.links = []
          this.panelInfo = {properties: {}}
        }
        const nodes = response.data.data.node
        var links = []
        for (var link of response.data.data.link) {
          links.push({
            id: link.id,
            index: 0,
            source: link.sourceId,
            target: link.targetId,
            name: link.name
          })
        }
        if (!nodes.length) {
          this.$message({
            showClose: true,
            message: '未查到相关数据'
          })
          return
        }
        this.$message({
          type: 'success',
          message: '共查询到' + nodes.length + '个节点'
        })

        this.graphSource = {nodes: nodes, links: links}
        // 调用画布的初始化方法，传入初始化数据源
        this.$refs['cvs'].renderGraph(this.graphSource)
      })
    },
    searchByProperty() {
      const self = this
      // if (this.form.labelType.includes(this.form.nodeInput)) {
      //   this.form.labelSelect = this.form.nodeInput
      // } else if (this.form.propertyType.includes(this.form.nodeInput)) {
      //   this.form.propertySelect = this.form.nodeInput
      // } else {
      //   this.form.propertyInput = this.form.nodeInput
      // }
      self.$http.get('KG/searchByKeyword', {
        params: {
          domain: this.domain,
          keyword: this.form.nodeInput
          // property: this.form.propertySelect,
          // propertyInput: this.form.propertyInput
        }
      }).then(response => {
        if (!(this.graphSource.nodes == '' || this.graphSource.nodes == null) || !(this.graphSource.links == '' || this.graphSource.links == null)) {
          this.graphSource.nodes = []
          this.graphSource.links = []
          this.panelInfo = {properties: {}}
        }
        // console.log(response);
        const nodes = response.data.data.nodes
        //上面一行之前是data.data 没有.nodes

        // 下面是新加的，不然按关键词查询，没有显示关系
        var links = []
        for (var link of response.data.data.links) {
          links.push({
            id: link.id,
            index: 0,
            source: link.sourceId,
            target: link.targetId,
            name: link.name
          })
        }
        if (!nodes.length) {
          this.$message({
            showClose: true,
            message: '未查到相关数据'
          })
          this.$refs['cvs'].renderGraph(this.graphSource)
          return
        }
        this.$message({
          type: 'success',
          message: '共查询到' + nodes.length + '个节点'
        })

        this.graphSource = {nodes: nodes, links: links}
        // 调用画布的初始化方法，传入初始化数据源
        this.$refs['cvs'].renderGraph(this.graphSource)
      })
    },
    search() {
      console.log(this.chosenPlaneType);
      const self = this
      self.$http.get('KG/searchByKeyword', {
        params: {
          domain: this.domain,
          keyword:this.chosenPlaneType
        }
      })
      // self.$http.get('KG/getGraph', {
      //   params: {
      //     domain: this.domain
      //   }
      // })
       //上面是原来的
        .then(response => {
          if (response.data.code === 200) {
            // 将节点直接放入,更新图谱数据源，这是初次查询
            //==改成了===，应该没有影响
            if (!(this.graphSource.nodes === '' || this.graphSource.nodes === null) || !(this.graphSource.links === '' || this.graphSource.links === null)) {
              this.graphSource.nodes = []
              this.graphSource.links = []
              this.panelInfo = {properties: {}}
            }
            // console.log(response.data.data.nodes);

            //这里有点妖，因为需要多查询一个标签属性，用了后台的关键词接口，这个接口返回的是nodes和links不是node和link，注意，后台懒得改了

            const nodes = response.data.data.nodes
            var links = []
            // console.log("查询到的link如下");
            // console.log(response.data.data.links);
            for (var link of response.data.data.links) {
              links.push({
                id: link.id,
                index: 0,
                source: link.sourceId,
                target: link.targetId,
                name: link.properties.property,
                // name: link.name,
                // property:link.properties.property
              })
            }
            if (!nodes.length) {
              this.$message({
                showClose: true,
                message: '未查到相关数据'
              })
              return
            }
            this.$message({
              type: 'success',
              message: '共查询到' + nodes.length + '个节点'
            })

            this.graphSource = {nodes: nodes, links: links}
            // 调用画布的初始化方法，传入初始化数据源
            this.$refs['cvs'].renderGraph(this.graphSource)
          }
        })
        .catch(error => console.log(error))
    },
    searchById(id) {
      const self = this
      self.$http.get('KG/searchNodeAndRel', {
        params: {
          id: id,
          domain: this.domain
        }
      })
        .then(response => {
          if (response.data.code == 200) {
            if (response.data.data) {
              const nodes = response.data.data.node
              var links = []
              for (var link of response.data.data.link) {
                links.push({
                  id: link.id,
                  index: 0,
                  source: link.sourceId,
                  target: link.targetId,
                  name: link.name
                })
              }
              this.graphSource = {nodes: nodes, links: links}
              self.$refs['cvs'].renderGraph(this.graphSource)
              // this.panelInfo = nodes[0]
              //本来想按id查之后自动显示节点信息，但不知道为什么删除键取不到这个节点
              if (!nodes.length) {
                this.$message({
                  showClose: true,
                  message: '未查到相关数据'
                })
                return
              }
              this.$message({
                type: 'success',
                message: '共查询到' + nodes.length + '个节点'
              })
            }
          }
        })
        .catch(error => console.log(error))
    },
    insertNode(node) {
      const self = this
      self.$http.post('KG/createNode',
        node.property, {
          params: {
            domain: this.domain,
            name: node.name,
            type: node.type
          }
        })
        .then(response => {
          if (response.data.code == 200) {
            self.graphSource.nodes.push(response.data.data)
            self.$refs['cvs'].renderGraph(this.graphSource)
            self.insertVis = false
            self.$message({
              type: 'success',
              message: '新增节点成功'
            })
          }
        })
    },
    deleteNode(nodeInfo) {
      const id = nodeInfo.id
      const self = this
      self.$http.delete('KG/node', {
        params: {
          id: id
        }
      }).then(response => {
        if (response.data.code == 200) {
          self.$message.success('删除节点成功')
          // 如果展开属性
          if (this.idToIndexList.has(id)) {
            const indexList = this.idToIndexList.get(id)
            // 删除属性
            this.graphSource.nodes.splice(indexList.nodeStart, indexList.number)
            this.graphSource.links.splice(indexList.linkStart, indexList.number)
            // 更新其他id对应的位置，因为可能出现之前删除之前的节点导致后续位置错乱
            for (const [k, v] of this.idToIndexList.entries()) {
              if (indexList.nodeStart < v.nodeStart) {
                this.idToIndexList.get(k).nodeStart -= indexList.number
                this.idToIndexList.get(k).linkStart -= indexList.number
              }
            }
            // 从数据源中删除之后还要删除本身的键
            this.idToIndexList.delete(id)
          }
          // 删除单个节点和关系
          this.graphSource.nodes.splice(nodeInfo.index, 1)
          for (let i = this.graphSource.links.length - 1; i >= 0; i--) {
            if (this.graphSource.links[i].source.id == id || this.graphSource.links[i].target.id == id) {
              this.graphSource.links.splice(i, 1)
            }
          }
          // 重新渲染
        }
      }).then(() => {
        self.$refs['cvs'].renderGraph(this.graphSource)
        self.panelInfo = {properties: {}}
      })
    },
    insertRel(relCanvas) {
      this.rel.source = relCanvas.sourceId
      this.rel.target = relCanvas.targetId
      this.rel.name = relCanvas.name
      // this.rel.name = this.insertRelValue
      const self = this
      self.$http.get('KG/createRel', {
        params: {
          source: this.rel.source,
          target: this.rel.target,
          name: this.rel.name,
          domain: this.domain
        }
      }).then(response => {
        if (response.data.code == 200) {
          self.$message({
            type: 'success',
            message: '新增关系成功'
          })
          // console.log(response);
          self.graphSource.links.push({
            id: response.data.data.id,
            index: 0,
            source: response.data.data.sourceId,
            target: response.data.data.targetId,
            name: response.data.data.name
          })
          self.$refs['cvs'].renderGraph(this.graphSource)
          this.insertRelVis = false
          this.insertRelValue = ''
          this.rel.source = ''
          this.cancleVis = false
        }
      })
    },
    queryNodeProp(data) {
      // 增加过滤条件，如果点击的是属性节点 就直接返回
      if (data.type === '属性' || data.type === '事件') return
      // 如果点击的是事件节点，就获取与事件相关的关系，然后返回，不展示事件的属性

      // 不仅要把信息展示在面板上，还要展示在图谱上
      // 让属性名作为边，属性值作为节点
      // 如果存在该节点对应的属性信息就执行删除
      if (this.idToIndexList.has(data.id)) {
        const indexList = this.idToIndexList.get(data.id)
        this.graphSource.nodes.splice(indexList.nodeStart, indexList.number)
        this.graphSource.links.splice(indexList.linkStart, indexList.number)
        // 更新其他id对应的位置，因为可能出现之前删除之前的节点导致后续位置错乱
        for (const [k, v] of this.idToIndexList.entries()) {
          if (indexList.nodeStart < v.nodeStart) {
            this.idToIndexList.get(k).nodeStart -= indexList.number
            this.idToIndexList.get(k).linkStart -= indexList.number
          }
        }
        // 从数据源中删除之后还要删除本身的键
        this.idToIndexList.delete(data.id)
      } else {
        // 存储属性节点和边在数据源数组中的起点和个数
        const nodeStart = this.graphSource.nodes.length
        const linkStart = this.graphSource.links.length
        let propertiesNumber = 0
        // 根据属性建立节点
        for (var [key, value] of Object.entries(data.properties)) {
          if (value === '无' || !value || value === data.name) continue

          this.graphSource.nodes.push({
            id: data.id + key, // 保证节点id的一致，否则会导致连线错误
            name: value,
            properties: {name: value},
            type: '属性'
          })
          this.graphSource.links.push({
            id: 0,
            source: data.id,
            target: data.id + key,
            properties: {},
            name: key
          })
          propertiesNumber++
        }
        this.idToIndexList.set(data.id, {
          nodeStart: nodeStart,
          linkStart: linkStart,
          number: propertiesNumber
        })
      }
      this.$refs['cvs'].renderGraph(this.graphSource)
    },
    queryNodeInfo(data) {
      if (this.delRelSource != '') {
        var source = this.delRelSource
        var target = data.id
        const self = this
        if ((this.graphSource.links.find(x => x.source.id == source && x.target.id == target)) ||
          (this.graphSource.links.find(x => x.source.id == target && x.target.id == source))) {
          var link = this.graphSource.links.find(x => x.source.id == source && x.target.id == target)
          if (this.graphSource.links.find(x => x.source.id == target && x.target.id == source)) {
            link = this.graphSource.links.find(x => x.source.id == target && x.target.id == source)
          }
          this.$confirm('此操作将永久删除该关系，是否继续？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              self.$http.delete('KG/rel', {
                params: {
                  id: link.id
                }
              }).then(response => {
                this.graphSource.links.splice(link.index, 1)
                this.$refs['cvs'].renderGraph(this.graphSource)
                self.delRelSource = ''
                this.cancleVis = false
              })
            })
            .catch(() => {
              this.$message({
                type: 'info',
                message: '已取消删除'
              })
            })
        } else {
          this.$message.error('不能删除不存在的关系！')
        }
      }
      // eslint-disable-next-line eqeqeq
      if (this.rel.source != '') {
        var source = this.rel.source
        var target = data.id
        if (source == target) {
          this.$message.error('不能连线自身节点！')
          this.rel.source = ''
          // eslint-disable-next-line eqeqeq
        } else if ((this.graphSource.links.find(x => x.source.id == source && x.target.id == target)) ||
          // eslint-disable-next-line eqeqeq
          (this.graphSource.links.find(x => x.source.id == target && x.target.id == source))) {
          this.$message.error('不能添加已有连线！')
          this.rel.source = ''
        } else {
          this.rel.target = data.id
          this.insertRelVis = true
        }
        return
      }
      // 显示操作按钮，删除修改连线共4个
      this.btnVis = true
      // 将节点信息的属性
      this.panelInfo = data
      console.log(Object.entries(this.panelInfo.properties));
      // 若点击节点为属性，则不查询关系
      if (data.type == '属性') {
        this.relations = []
        return
      }
      // 获得点击节点后，获得关系选择器中的关系
      // this.getRelations(data.id);
    }
  }
}
</script>

<style lang="less" scoped>
#kg_container {
  height: 100vh;
  width: 100%;
  justify-content: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
}

.detail-panel {
  position: absolute;
  padding: 0;
  left: 0;
}

.size-ul {
  padding-left: 0px;
  list-style: none;
  word-break: break-word;
  display: inline-block;
}

.size-li {
  display: inline-block;
  padding-right: 5px;
  padding-left: 5px;
}

.size-item {
  background-color: rgb(170, 170, 170);
  display: inline-block;
  height: 12px;
  width: 12px;
  margin-top: 1px;
  line-height: 0;
  cursor: pointer;
  opacity: 0.4;
  border-radius: 50%;
}

a {
  color: #4183c4;
  text-decoration: none;
}

.custom-hr {
  background-color: #ebeef5;
  //height: scale(0.1);
  border-top: none;
  width: 100%;
}

.cvs-footer {
  height: 5vh;
  display: flex;
  align-items: center;
  padding: 0 30px;
}

.scrollbar-flex-content {
  display: flex;
  width: 100%;
  white-space: nowrap;
}

.scrollbar-demo-item3 {
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 550px;
  height: 50px;
  text-align: center;
  border-radius: 4px;
}

.scrollbar-demo-item1 {
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 210px;
  height: 50px;
  text-align: center;
  border-radius: 4px;
}

.scrollbar-demo-item2 {
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 50px;
  text-align: left;
  border-radius: 4px;
}
</style>
