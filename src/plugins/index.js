import cache from './cache.js';
import { VueInstanceModal } from './modal.js';

export default function installPlugins(app) {
  app.config.globalProperties.$cache = cache;

  const modal = new VueInstanceModal();
  app.config.globalProperties.$modal = modal;

  app.config.globalProperties.msgSuccess = modal.msgSuccess;
  app.config.globalProperties.msgWarning = modal.msgWarning;
  app.config.globalProperties.msgError = modal.msgError;
}
