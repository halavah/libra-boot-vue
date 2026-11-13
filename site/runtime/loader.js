import {appRoot,readCatalog,selectExample,allowedResource} from './catalog.js';
import {loadDependencies} from './dependencies.js';
const status=document.getElementById('preview-status'),host=document.getElementById('app');
async function start(){
 try{
  const item=selectExample(await readCatalog('sfc'),new URLSearchParams(location.search).get('example'));
  document.getElementById('preview-title').textContent=item.title;document.title=item.title+' · Libra Boot Vue';
  await loadDependencies([...item.dependencies,'loader']);
  const options={moduleCache:{vue:window.Vue,'element-plus':window.ElementPlus,'ant-design-vue':window.antd},async getFile(path){const url=allowedResource(path);const response=await fetch(url);if(!response.ok)throw new Error('组件或依赖文件缺失。');return response.text()},addStyle(css){const style=document.createElement('style');style.textContent=css;document.head.append(style)}};
  const component=await window['vue3-sfc-loader'].loadModule(new URL(item.entry,appRoot).pathname,options);
  const app=window.Vue.createApp(component);if(item.dependencies.includes('element'))app.use(window.ElementPlus);if(item.dependencies.includes('ant'))app.use(window.antd);
  app.config.errorHandler=(error)=>{console.error('Preview component failure:',error);status.textContent='组件运行失败，请检查本地文件与浏览器控制台。';status.classList.add('error');host.dataset.ready='error'};
  app.mount(host);host.dataset.ready='true';status.textContent='示例已就绪 · 所有数据为本地模拟数据。';
 }catch(error){status.textContent=error.message||'无法加载示例。';status.classList.add('error');host.dataset.ready='error';document.getElementById('preview-retry').hidden=false;console.error('Preview failed:',error)}
}
document.getElementById('preview-retry').addEventListener('click',()=>location.reload());start();
