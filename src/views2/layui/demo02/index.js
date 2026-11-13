var allTableList = null;

layui.use(function () {
  var laydate = layui.laydate;
  var form = layui.form;
  var year = new Date().getFullYear();

  laydate.render({
    elem: '#ID-laydate-range-year',
    type: 'year',
    range: true,
    value: year + ' - ' + year,
    done: function (value, date) {
      getAllFh(value.split(' - '));
    },
  });

  // 按钮触发
  form.on('radio(sexFilter)', function (data) {
    console.log('选中的性别是：', data.value);
  });

  // 初始化
  getAllFh($('#ID-laydate-range-year')[0].value.split(' - '));
});

function getAllFh(value) {
  let data = {
    'kssj': parseInt(value[0]),
    'jssj': parseInt(value[1]) + 1,
  }
  $.ajax({
    url: 'http://localhost:8080/lfa/precisionRateZYear',
    type: 'POST',
    data: JSON.stringify(data),
    ContentType: 'application/json;charset=UTF-8',
    dataType: 'json',
    success: function (res) {
      allTableList = res.data;
    },
  })
}
