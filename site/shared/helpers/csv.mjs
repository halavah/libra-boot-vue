export function csvCell(value) {
  let text=String(value ?? '');
  if (/^[\s]*[=+\-@\t\r]/.test(text)) text="'"+text;
  return '"'+text.replaceAll('"','""')+'"';
}
export function toCsv(rows) {
  return '\uFEFF'+[['SKU','商品名称','品类','上架状态','库存（件）'],...rows.map(x=>[x.code,x.name,x.category,x.status,x.stock])].map(row=>row.map(csvCell).join(',')).join('\r\n');
}
