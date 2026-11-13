import {createWorkbenchOptions} from '../../../../shared/demos/products.mjs';
import ContentArea from './components/SelectionPanel.vue';
import ChartPanel from '../../../../shared/components/StockChart.vue';
const options=createWorkbenchOptions();
options.components={};
options.components.ContentArea=ContentArea;
options.components.ChartPanel=ChartPanel;
export default options;
