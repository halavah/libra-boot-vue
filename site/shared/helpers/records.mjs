export function filterRecords(rows, query = '', category = '') {
  const needle = String(query).trim().toLowerCase();
  return rows.filter(row => (!needle || `${row.code} ${row.name}`.toLowerCase().includes(needle)) && (!category || row.category === category));
}
export function paginate(rows, page, size) {
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(size) || size < 1) throw new Error('分页参数不合法。');
  return rows.slice((page-1)*size,page*size);
}
