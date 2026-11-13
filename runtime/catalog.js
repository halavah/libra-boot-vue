export const appRoot = new URL('../', import.meta.url);
export function assertCatalog(value, kind) {
  if (!value || value.schemaVersion !== 1 || !Array.isArray(value.examples)) throw new Error('示例清单格式不正确。');
  const seen = new Set();
  for (const item of value.examples) {
    if (!item || !/^[a-z0-9-]+\/[a-z0-9-]+$/.test(item.id) || seen.has(item.id)) throw new Error('示例标识非法或重复。');
    seen.add(item.id);
    const extension = kind === 'sfc' ? 'vue' : 'html';
    if (item.kind !== kind || item.entry !== `examples/${kind}/${item.id}/index.${extension}` || !Array.isArray(item.dependencies) || typeof item.title !== 'string') throw new Error('示例入口不符合目录约定。');
  }
  return value.examples;
}
export async function readCatalog(kind) {
  if (!['sfc','html'].includes(kind)) throw new Error('未知示例类型。');
  const response = await fetch(new URL(`catalog/${kind}.json`, appRoot), {cache:'no-store'});
  if (!response.ok) throw new Error('示例目录加载失败，请检查静态服务根目录。');
  return assertCatalog(await response.json(), kind);
}
export function selectExample(examples, id) {
  if (typeof id !== 'string' || !/^[a-z0-9-]+\/[a-z0-9-]+$/.test(id)) throw new Error('示例标识不合法。请从目录选择。');
  const item = examples.find(x => x.id === id);
  if (!item) throw new Error('示例未登记。请返回目录选择。');
  return item;
}
export function allowedResource(path, root = appRoot) {
  const url = new URL(path, root);
  if (url.origin !== root.origin || url.search || url.hash || /%2f|%5c|%2e/i.test(url.pathname)) throw new Error('依赖地址不合法。');
  const relative = url.pathname.slice(root.pathname.length);
  if (!url.pathname.startsWith(root.pathname) || !(relative.startsWith('examples/sfc/') || ['runtime/mock-data.mjs','runtime/workbench.mjs'].includes(relative))) throw new Error('依赖超出允许的目录：'+url.pathname);
  return url;
}
