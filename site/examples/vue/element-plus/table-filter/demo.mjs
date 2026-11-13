import {createWorkbenchOptions} from '../../../../shared/demos/products.mjs';
import ChartPanel from '../../../../shared/components/StockChart.vue';
const options=createWorkbenchOptions();
options.components={};
options.components.ChartPanel=ChartPanel;
options.mounted=async function(){try{const url=new URL('../examples/vue/element-plus/table-filter/products.json',window.location.href);const response=await fetch(url);if(!response.ok)throw new Error('missing data');this.rows=await response.json()}catch{this.notice='模拟 JSON 加载失败，可重置使用内置数据。'}};
export default options;
