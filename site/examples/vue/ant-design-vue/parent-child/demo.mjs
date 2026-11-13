import {createWorkbenchOptions} from '../../../../shared/demos/products.mjs';
import ContentArea from '../../../../shared/components/SelectionPanel.vue';
const options=createWorkbenchOptions();
options.components={};
options.components.ContentArea=ContentArea;
export default options;
