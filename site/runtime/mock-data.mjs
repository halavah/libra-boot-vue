export function seedRecords() {
  return Array.from({length:18}, (_,i) => ({id:i+1,code:`DEMO-${String(i+1).padStart(3,'0')}`,name:`演示条目 ${String(i+1).padStart(2,'0')}`,group:['A组','B组','C组'][i%3],status:i%2 ? '进行中':'已完成',value:(i+1)*7}));
}
export function filterRecords(rows, query = '', group = '') {
  const needle = String(query).trim().toLowerCase();
  return rows.filter(row => (!needle || `${row.code} ${row.name}`.toLowerCase().includes(needle)) && (!group || row.group === group));
}
export function paginate(rows, page, size) {
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(size) || size < 1) throw new Error('分页参数不合法。');
  return rows.slice((page-1)*size,page*size);
}
export function csvCell(value) {
  let text=String(value ?? '');
  if (/^[\s]*[=+\-@\t\r]/.test(text)) text="'"+text;
  return '"'+text.replaceAll('"','""')+'"';
}
export function toCsv(rows) {
  return '\uFEFF'+[['编号','名称','分组','状态','数值'],...rows.map(x=>[x.code,x.name,x.group,x.status,x.value])].map(row=>row.map(csvCell).join(',')).join('\r\n');
}
export function inspectFile(file) {
  if (!file) throw new Error('请选择一个演示文件。');
  if (file.size > 1024*1024) throw new Error('演示文件不能超过 1 MiB。');
  if (!/\.(txt|csv|json)$/i.test(file.name)) throw new Error('仅接受 txt、csv 或 json 演示文件。');
  return {name:file.name,size:file.size,type:file.type || '未提供 MIME 类型'};
}
