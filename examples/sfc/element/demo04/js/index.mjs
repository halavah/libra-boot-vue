import {createWorkbenchOptions} from '../../../../../runtime/workbench.mjs';
import ContentArea from '../components/ContentArea.vue';
import ChartPanel from '../components/ChartPanel.vue';
const options=createWorkbenchOptions();
options.components={};
options.components.ContentArea=ContentArea;
options.components.ChartPanel=ChartPanel;
export default options;
