layui.use('table', function () {
  var table = layui.table;

  // 模拟数据
  var mockData = [
    { id: 1, name: 'John Doe', age: 25, nf: '2023-01-01' },
    { id: 2, name: 'Jane Doe', age: 30, nf: '2023-01-01' },
    { id: 3, name: 'Bob Smith', age: 28, nf: '2023-01-01' },
  ];

  // 定义表格
  table.render({
    elem: '#demo',
    data: mockData,
    cols: [[
      { field: 'id', title: '序号' },
      {
        field: 'nf', title: '年份', templet: function (d) {
          return layui.laytpl('{{d.nf.substring(0,4)}}').render(d);
        }
      },
      { field: 'name', title: '姓名', edit: 'text' },
      { field: 'age', title: '年龄', edit: 'text' },
    ]],
    edit: true
  });

  // 监听单元格编辑
  table.on('edit(test)', function (obj) {
    var value = obj.value; // 得到修改后的值
    var data = obj.data; // 得到修改后的数据对象
    var field = obj.field; // 得到被修改的字段
    layer.msg('字段更改值为：' + value);
  });
});

/*************************************************************************************************/

// //加载遮罩层--- 可以放在点击事件方法体内最上面
// var loading;
// layui.use('layer',function() {
//   var layer = layui.layer;
//   loading = layer.msg('正在加载', {icon: 16, shade: 0.3, time: 0});
// });
//
// //关闭遮罩层---放到指定需要关闭的位置如：方法调用成功之后
// layer.close(loading);

