import Vue from 'vue'
import App from './App.vue'
import Auction from './Auction.vue';
import User from './User.vue';
import myAuction from './myAuction.vue';
import singleAuction from './singleAuction.vue';
import VueResource from 'vue-resource'
import VueRouter from 'vue-router';
import { routerHistory, writeHistory } from 'vue-router-back-button'

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(routerHistory);

//Vue.http.options.emulateJSON = true;

const routes = [
  {
    path: "/",
    name: "Auction",
    component: Auction
  },
  {
    path: "/user/:userId",
    name: "user",
    component: User
  },
  {
    path: "/myAuction",
    name: "myAuction",
    component: myAuction
  },
  {
    path: "/auction/:auctionId",
    name: "singleAuction",
    component: singleAuction
  }
];

const router = new VueRouter({
  routes: routes,
  mode: 'history'
});

router.afterEach(writeHistory);

Vue.filter('formatDate', function(value) {
  if (value) {
    let d = new Date();
    d.setTime(value);
    return d.toLocaleDateString() +" "+ d.toLocaleTimeString();
  }
});

Vue.filter('moneyFormat', function(value) {
  if (value || value === 0) {
    return parseFloat(value).toFixed(2);
  }
});

new Vue({
  el: '#app',
  router: router,
  render: h => h(App)
});

