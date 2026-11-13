import {createStaticServer} from '../scripts/serve.mjs';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import path from 'node:path';
const {chromium}=await import(process.env.LIBRA_PLAYWRIGHT_MODULE||'playwright');
const out=process.env.LIBRA_TEST_OUTPUT||fileURLToPath(new URL('../artifacts/',import.meta.url));await mkdir(out,{recursive:true});
const server=createStaticServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
let browser;const results=[];let externalRequests=0;
try{
 browser=await chromium.launch({headless:true,downloadsPath:path.join(out,'downloads'),...(process.env.LIBRA_CHROMIUM_EXECUTABLE?{executablePath:process.env.LIBRA_CHROMIUM_EXECUTABLE}:{}),args:['--disable-gpu','--js-flags=--max-old-space-size=256']});
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
 await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin!==origin){externalRequests++;return route.abort()}return route.continue()});
 context.setDefaultTimeout(7000);
 const catalogues=await Promise.all(['sfc','html'].map(async k=>JSON.parse(await readFile(new URL('../site/catalog/'+k+'.json',import.meta.url),'utf8')).examples));
 const home=await context.newPage();await home.goto(origin);await home.waitForFunction(()=>document.querySelectorAll('.card').length===25);await home.getByLabel('搜索示例').fill('ECharts');await home.getByRole('button',{name:'筛选',exact:true}).click();assert.equal(await home.locator('.card').count(),3);await home.getByRole('button',{name:/^重\s*置$/}).click();assert.equal(await home.locator('.card').count(),25);await home.close();
 for(const item of catalogues.flat().filter(item=>!process.env.LIBRA_TEST_EXAMPLE||item.kind+'/'+item.id===process.env.LIBRA_TEST_EXAMPLE)){
  const page=await context.newPage();const errors=[],httpErrors=[];page.on('pageerror',error=>errors.push(error.message));page.on('response',response=>{if(response.status()>=400)httpErrors.push({url:new URL(response.url()).pathname,status:response.status()})});
  const url=item.kind==='sfc'?origin+'/runtime/preview.html?example='+encodeURIComponent(item.id):origin+'/'+item.entry;const record={id:item.id,kind:item.kind,actions:[],errors,httpErrors};
  try{
   await page.goto(url);await page.waitForSelector('#app[data-ready]',{timeout:20000});const state=await page.locator('#app').getAttribute('data-ready');assert.equal(state,'true',await page.locator('#preview-status,#page-status').textContent());record.actions.push('load');
   if(item.checks.includes('filter')){
    const input=page.getByLabel('名称或编号');await input.fill('DEMO-001');await page.getByRole('button',{name:/^查\s*询$/}).click();await page.waitForFunction(()=>document.querySelector('#app [role=status].summary')?.textContent.includes('找到 1 条'));record.actions.push('filter');
    await page.getByRole('button',{name:/^重\s*置$/}).click();await page.getByRole('button',{name:'下一页',exact:true}).click();await page.getByRole('button',{name:'编辑 DEMO-006',exact:true}).waitFor();record.actions.push('pagination');await page.getByRole('button',{name:/^重\s*置$/}).click();
   }
   if(item.checks.includes('create')){
    await page.getByRole('button',{name:'新增条目',exact:true}).click();await page.getByLabel('名称',{exact:true}).fill('公开演示新增');await page.getByRole('button',{name:'保存条目',exact:true}).click();await page.getByLabel('名称或编号').fill('DEMO-019');await page.getByRole('button',{name:/^查\s*询$/}).click();await page.getByRole('button',{name:'编辑 DEMO-019',exact:true}).click();await page.getByLabel('名称',{exact:true}).fill('公开演示修改');await page.getByRole('button',{name:'保存条目',exact:true}).click();await page.getByLabel('名称或编号').fill('DEMO-019');await page.getByRole('button',{name:/^查\s*询$/}).click();await page.getByRole('button',{name:'删除 DEMO-019',exact:true}).click();record.actions.push('create','edit','delete');await page.getByRole('button',{name:/^重\s*置$/}).click();
   }
   if(item.checks.includes('child-event')){await page.getByRole('button',{name:'从子组件选择首条',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#app [role=status].summary')?.textContent.includes('已选择 DEMO-001'));record.actions.push('child-event')}
   if(item.checks.includes('csv-download')){const pending=page.waitForEvent('download');await page.getByRole('button',{name:'导出 CSV',exact:true}).click();const download=await pending;const dest=path.join(out,'demo-records.csv');await download.saveAs(dest);assert.ok((await readFile(dest,'utf8')).includes('DEMO-001'));record.actions.push('csv-download')}
   if(item.checks.includes('file-empty')){
    const name=page.locator('#document-name');if(await name.count())await name.fill('演示文件');await page.getByRole('button',{name:'校验文件',exact:true}).click();await page.getByText('请选择一个演示文件。',{exact:true}).waitFor();await page.locator('#demo-file').setInputFiles({name:'demo.txt',mimeType:'text/plain',buffer:Buffer.from('Synthetic file preview')});await page.getByText('Synthetic file preview',{exact:true}).waitFor();await page.getByRole('button',{name:'校验文件',exact:true}).click();await page.getByRole('button',{name:'清空文件',exact:true}).click();assert.equal(await page.locator('.output').count(),0);await page.locator('#demo-file').setInputFiles({name:'large.txt',mimeType:'text/plain',buffer:Buffer.alloc(1048577)});await page.getByText('演示文件不能超过 1 MiB。',{exact:true}).waitFor();await page.locator('#demo-file').setInputFiles({name:'demo.exe',mimeType:'application/octet-stream',buffer:Buffer.from('demo')});await page.getByText('仅接受 txt、csv 或 json 演示文件。',{exact:true}).waitFor();record.actions.push('file-empty','file-preview','file-clear','file-size','file-type');
   }
   if(item.checks.includes('chart-render')){assert.ok(await page.locator('canvas').count()>0);await page.locator('#chart-group').selectOption('A组');await page.getByRole('button',{name:'更新图表',exact:true}).click();await page.getByText('图表已更新，6 条模拟数据。',{exact:true}).waitFor();await page.getByRole('button',{name:'重置图表',exact:true}).click();record.actions.push('chart-render','chart-filter','chart-reset')}
   if(item.checks.includes('layui-render')){if(item.id.endsWith('demo03')){await page.getByLabel('演示名称',{exact:true}).fill('演示表单');await page.getByRole('button',{name:'提交演示',exact:true}).click();await page.locator('#layui-result').filter({hasText:'已校验演示表单'}).waitFor();record.actions.push('layui-form')}else assert.ok(await page.locator('.layui-table-view').count()>0);record.actions.push('layui-render')}
   await page.setViewportSize({width:390,height:844});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'whole-page horizontal overflow');record.actions.push('narrow-layout');
   if(['element/demo02','office/upload-file','echarts/demo01'].includes(item.id))await page.screenshot({path:path.join(out,item.kind+'-'+item.id.replace('/','-')+'.png'),fullPage:true});
   assert.deepEqual(errors,[]);assert.deepEqual(httpErrors,[]);record.pass=true;
  }catch(error){record.pass=false;record.failure=error.message;await page.screenshot({path:path.join(out,'failure-'+item.kind+'-'+item.id.replace('/','-')+'.png'),fullPage:true}).catch(()=>{})}
  results.push(record);console.log(JSON.stringify({id:item.kind+'/'+item.id,pass:record.pass,failure:record.failure}));await page.close();
 }
 const bad=await context.newPage();await bad.goto(origin+'/runtime/preview.html?example=..%2Fprivate');await bad.waitForSelector('#app[data-ready=error]');assert.ok((await bad.locator('#preview-status').textContent()).includes('不合法'));await bad.close();
 assert.equal(externalRequests,0);const receipt={browser:'Chromium',examples:results,externalRequests,invalidIdentityRejected:true};await writeFile(path.join(out,'browser-receipt.json'),JSON.stringify(receipt,null,2));assert.ok(results.every(x=>x.pass),'Some examples failed browser acceptance');console.log(`PASS ${results.length} examples, interactions, narrow layouts, invalid identity and zero external requests.`);
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
