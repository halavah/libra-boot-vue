const productNames = ['便携充电器','收纳盒','横线笔记本','编织数据线','陶瓷杯','中性笔套装','手机支架','棉质毛巾','文件夹','无线鼠标','桌面收纳盘','便签纸','读卡器','厨房清洁刷','长尾夹','蓝牙键盘','防滑杯垫','书写垫板'];
export function seedRecords() {
  return Array.from({length:18}, (_,i) => ({id:i+1,code:`SKU-${String(i+1).padStart(3,'0')}`,name:productNames[i],category:['数码配件','家居用品','办公文具'][i%3],status:i%2 ? '在售':'下架',stock:(i+1)*7}));
}
