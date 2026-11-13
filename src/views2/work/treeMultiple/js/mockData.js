// 模拟数据文件 - 用于替代后端 API 调用
// 展示组件如何使用模拟数据进行开发和测试

// 行政组织数据 - 模拟 /performance/prfOrg/tree 接口返回
export const administrativeData = [
  {
    id: '1',
    deptName: '演示团队046',
    children: [
      {
        id: '11',
        deptName: '演示团队047',
        children: [
          {
            id: '111',
            deptName: '演示团队049',
            children: []
          },
          {
            id: '112',
            deptName: '演示团队050',
            children: []
          }
        ]
      },
      {
        id: '12',
        deptName: '演示团队051',
        children: [
          {
            id: '121',
            deptName: '演示团队052',
            children: []
          }
        ]
      }
    ]
  },
  {
    id: '2',
    deptName: '演示团队053',
    children: [
      {
        id: '21',
        deptName: '演示团队054',
        children: []
      }
    ]
  }
];

// 虚拟组织数据 - 模拟 /performance/prfOrgParty/listAll 接口返回
export const prfOrgPartyData = [
  {
    id: 'v1',
    name: '演示团队048',
    deptName: '演示团队048', // 转换后的字段名，与行政组织保持一致
    orgType: 2,
    children: []
  },
  {
    id: 'v2',
    name: '演示团队055',
    deptName: '演示团队055', // 转换后的字段名，与行政组织保持一致
    orgType: 2,
    children: []
  },
  {
    id: 'v3',
    name: '演示团队056',
    deptName: '演示团队056', // 转换后的字段名，与行政组织保持一致
    orgType: 2,
    children: []
  }
];

// 模拟 API 调用函数
export const mockApi = {
  // 获取行政组织树
  getAdministrative: () => {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        resolve({
          code: 2000,
          data: administrativeData
        });
      }, 300);
    });
  },

  // 获取虚拟组织列表
  getPrfOrgPartyList: () => {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        resolve({
          code: 2000,
          data: prfOrgPartyData
        });
      }, 300);
    });
  }
};
