/**
 * 标准化混入 - 从源项目迁移，仅供学习参考
 * 包含表格高度自适应、图片预览等功能
 * 注意：tableImgPreviewHandle 方法依赖 hevue-img-preview 插件
 */
export default {
  data() {
    return {
      queryFormFold: false, //  搜索表单  收缩展开
      queryFormResizeObserver: null, //  搜索表单的宽高监听对象
      maxTableHeight: 200, // 表格自适应默认高度
      selectHandleForm: {}, // 选中的行 数据
      highLightedIndex: null //  当前表格图片查看，高亮的指定行
    };
  },
  mounted() {
    this.getMaxTableHeight();
    this.screenChange();
    this.queryParamListener();
  },
  methods: {
    // 获取表格最高高度
    getMaxTableHeight() {
      // 屏幕可视高度
      const windowInnerHeight = window.innerHeight - 84;
      // 搜索盒子的高度
      let queryFormRefHeight = 0;
      if (this.$refs.queryForm) {
        queryFormRefHeight = this.$refs.queryForm.$el.offsetHeight;
      } else {
        queryFormRefHeight = 0;
      }
      // 按钮盒子的高度
      let queryBtnEl = document.querySelectorAll('.app-container .body-toolbar');
      let queryBtnHeight = 0;
      if (queryBtnEl.length > 0) {
        queryBtnHeight = queryBtnEl[0].offsetHeight;
      } else {
        queryBtnHeight = 0;
      }
      const paginationRefHeight = 28 + 12; //分页的高度，  12为margin-top
      const otherPaddingMarging = 24 + 24 + 12 + 12; // 搜索的margin24  + 内容盒子的padding24  + 按钮盒子的margin-bottom 12  + 12空隙
      this.$nextTick(() => {
        this.maxTableHeight =
          windowInnerHeight - queryFormRefHeight - queryBtnHeight - paginationRefHeight - otherPaddingMarging;
      });
    },

    // 屏幕resize监听
    screenChange() {
      // 屏幕resize监听事件：一旦屏幕宽高发生变化，就会执行resize
      window.addEventListener('resize', this.getMaxTableHeight, true);
    },
    // 监听搜索栏  折叠 展开------------------------------------------------------------------------------
    queryParamListener() {
      if (this.$refs.queryForm) {
        // 获取要监听的 div 元素
        const resizeTarget = this.$refs.queryForm.$el;
        // 创建 ResizeObserver 实例
        this.queryFormResizeObserver = new ResizeObserver(entries => {
          // entries 是一个 ResizeObserverEntry 对象数组，包含目标元素的大小信息
          for (const entry of entries) {
            // 获取宽度和高度
            const { width, height } = entry.contentRect;
            // 在这里触发自定义的处理逻辑
            this.queryParamHandleResize(width, height);
          }
        });
        // // 开始监听目标元素的大小变化
        this.queryFormResizeObserver.observe(resizeTarget);
      }
    },
    queryParamHandleResize(width, height) {
      this.getMaxTableHeight(width, height);
    },
    // ----------------------------------------------------------------------------------
    // 表格内的所有的图片预览方法
    tableImgPreviewHandle(event) {
      // 获取el-table的DOM元素
      const tableElement = this.$refs.multipleTableRef.$el;
      //  遍历DOM元素
      const imgElements = tableElement.querySelectorAll('img:not([include="0"])');
      // 过滤include为0的指定img
      let imgElementsWithoutAttribute = Array.from(imgElements).filter(function (element) {
        return element.dataset.include !== '0';
      });
      // 获取图片地址
      const imageUrls = Array.from(imgElementsWithoutAttribute).map(imgElement => {
        return imgElement.src;
      });
      // 获取当前点击的地址
      let clickUrl = event.target.src;
      // 获取当前地址对应的索引值
      const nowIndex = imageUrls.indexOf(clickUrl);
      // 清空，显示，索引赋值，所有地址赋值，展示
      this.$hevueImgPreview({
        multiple: true, // 开启多图预览模式
        nowImgIndex: nowIndex, // 多图预览，默认展示第二张图片
        imgList: imageUrls, // 需要预览的多图数组
        mainBackground: 'rgba(0, 0, 0, .5)', // 整体背景颜色
        // 切换图片回调
        changeFn: data => {
          // data => { type: 'next', fromImgIndex: 0, fromImgUrl: 'http://api.example.invalid', toImgIndex: 1, toImgUrl: 'http://api.example.invalid', way: 'key-d' }
          let rowIndex = this.findRowByImageUrl(data.toImgUrl);
          this.$refs.multipleTableRef.setCurrentRow();
          this.highLightedIndex = rowIndex;
        }
      });
    },
    findRowByImageUrl(imageUrl) {
      const tableElement = this.$refs.multipleTableRef.$el;
      const tableRows = tableElement.getElementsByClassName('el-table__row');
      for (let i = 0; i < tableRows.length; i++) {
        let imgAll = tableRows[i].querySelectorAll('img');
        for (let j = 0; j < imgAll.length; j++) {
          if (imgAll[j] && imgAll[j].src === imageUrl) {
            return i;
          }
        }
      }
      return -1;
    },
    tableHighlightRow({ rowIndex }) {
      return rowIndex === this.highLightedIndex ? 'current-row' : '';
    },
    // 行点击选中，高亮效果，以及选中的数据
    async handleRowClick(row) {
      this.highLightedIndex = null;
      if (this.selectHandleForm == row) {
        this.$refs.multipleTableRef.setCurrentRow();
        this.selectHandleForm = {};
      } else {
        this.selectHandleForm = row;
      }
    }
  },
  beforeDestroy() {
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', this.getMaxTableHeight, true);
    });
    this.$once('hook:beforeDestroy', () => {
      this.queryFormResizeObserver.disconnect();
    });
  }
};
