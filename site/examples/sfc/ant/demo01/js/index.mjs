import {createWorkbenchOptions} from '../../../../../runtime/workbench.mjs';
import ChartPanel from '../components/ChartPanel.vue';
const options=createWorkbenchOptions();
options.components={};
options.components.ChartPanel=ChartPanel;
options.mounted=async function(){try{const url=new URL('../examples/sfc/ant/demo01/json/records.json',window.location.href);const response=await fetch(url);if(!response.ok)throw new Error('missing data');this.rows=await response.json()}catch{this.notice='模拟 JSON 加载失败，可重置使用内置数据。'}};
export default options;
