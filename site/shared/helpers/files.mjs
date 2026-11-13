export function inspectFile(file) {
  if (!file) throw new Error('请选择一个演示文件。');
  if (file.size > 1024*1024) throw new Error('演示文件不能超过 1 MiB。');
  if (!/\.(txt|csv|json)$/i.test(file.name)) throw new Error('仅接受 txt、csv 或 json 演示文件。');
  return {name:file.name,size:file.size,type:file.type || '未提供 MIME 类型'};
}
