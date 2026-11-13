import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {seedRecords} from '../../site/shared/data/products.mjs';
import {toCsv} from '../../site/shared/helpers/csv.mjs';
import {createWorkbenchOptions} from '../../site/shared/demos/products.mjs';

test('JSON-backed and generated product examples share the same domain data', async () => {
  const expected = seedRecords();
  for (const library of ['element-plus','ant-design-vue']) {
    const rows = JSON.parse(await readFile(new URL(`../../site/examples/vue/${library}/table-filter/products.json`, import.meta.url), 'utf8'));
    assert.deepEqual(rows, expected);
  }
  assert.equal(new Set(expected.map(row => row.code)).size, expected.length);
  assert.ok(expected.every(row => Number.isInteger(row.stock) && row.stock >= 0));
});

test('invalid inventory and category cannot change the product collection', () => {
  const options = createWorkbenchOptions();
  for (const patch of [{stock:-1},{stock:1.5},{stock:1000000},{stock:NaN},{category:'unknown'},{status:'unknown'}]) {
    const context = {...options.data(), $nextTick:()=>{}};
    const before = structuredClone(context.rows);
    context.editing = {id:null,name:'演示键盘',category:'数码配件',status:'在售',stock:10,...patch};
    options.methods.save.call(context);
    assert.deepEqual(context.rows, before);
    assert.ok(context.editing);
  }
});

test('product save preserves integer inventory and exports the ecommerce schema', () => {
  const options = createWorkbenchOptions();
  const context = {...options.data(), $nextTick:()=>{}};
  context.editing = {id:null,name:'  演示键盘  ',category:'数码配件',status:'在售',stock:12};
  options.methods.save.call(context);
  const saved = context.rows.at(-1);
  assert.equal(saved.code, 'SKU-019');
  assert.equal(saved.name, '演示键盘');
  assert.equal(saved.stock, 12);
  assert.equal(context.editing, null);
  const csv = toCsv([saved]);
  assert.ok(csv.includes('"SKU","商品名称","品类","上架状态","库存（件）"'));
  assert.ok(csv.includes('"SKU-019","演示键盘","数码配件","在售","12"'));
});
