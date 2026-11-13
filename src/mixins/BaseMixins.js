import { reactive } from 'vue';

export default {
  data() {
    return {
      selectPopupCom_type: null,
      selectPopupVisible: false,
      queryParam: {},
      tableSelectData: [],
      perBackUrl: '/hrms/user/list',
      autoLoadUser: false,
      allUserMap: {}
    };
  },
  created() {
    if (this.autoLoadUser) {
      this.fetchAllUserMap();
    }
  },
  methods: {
    resetForm(refName) {
      if (this.$refs[refName]) {
        this.$refs[refName].resetFields();
      }
    },
    fetchAllUserMap() {
      console.warn('fetchAllUserMap: getUserMapData API 在当前项目中不存在');
    },
    async initDictNew(dataName, strSn, callback) {
      console.warn('initDictNew: getAction API 在当前项目中不存在');
      let data = [];
      let res = { data: {} };
      for (let key in res.data) {
        data.push({
          label: res.data[key],
          value: key + ''
        });
      }
      if (typeof callback == 'function') {
        callback.bind(this)();
      }
      this[dataName] = data;
    },
    getDictLabel(arrDict, value) {
      for (let i in arrDict) {
        if (arrDict[i].value == value) {
          return arrDict[i].label;
        }
      }
    },
    async initDict(dataName, strSn, callback, dataType) {
      console.warn('initDict: getAction API 在当前项目中不存在');
      let data = [];
      Promise.resolve({ data: {} }).then(res => {
        for (let key in res.data) {
          if (dataType) {
            data.push({
              label: res.data[key],
              value: parseFloat(key)
            });
            continue;
          }
          data.push({
            label: res.data[key],
            value: key + ''
          });
        }
        if (typeof callback == 'function') {
          callback.bind(this)();
        }
      });
      const keys = dataName.split('.');
      let obj = this;
      for (let i = 0; i < keys.length; i++) {
        if (i == keys.length - 1) {
          obj[keys[i]] = reactive(data);
        } else {
          obj[keys[i]] = obj[keys[i]] || {};
        }
        obj = obj[keys[i]];
      }
      this[dataName] = reactive(data);
    },
  }
};
