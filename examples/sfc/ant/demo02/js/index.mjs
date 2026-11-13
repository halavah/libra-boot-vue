import {createWorkbenchOptions} from '../../../../../runtime/workbench.mjs';
import ContentArea from '../components/ContentArea.vue';
const options=createWorkbenchOptions();
options.components={};
options.components.ContentArea=ContentArea;
export default options;
