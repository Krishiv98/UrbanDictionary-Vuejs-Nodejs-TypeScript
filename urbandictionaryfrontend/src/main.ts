import Vue from 'vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import GlobalMixin from '@/mixins/global-mixin';
import App from './App.vue';

import router from './router';
import store from './store';
import 'bootswatch/dist/yeti/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'particles-bg-vue';

Vue.config.productionTip = false;
// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
// optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);
Vue.mixin(GlobalMixin);
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
