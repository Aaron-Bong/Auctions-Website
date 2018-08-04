<template>
  <img src="./assets/loading.gif" v-if="showLoading">
  <div v-else>
    <input class="form-control mx-auto" type="search" placeholder="Search" aria-label="Search" style="width: 20%; margin-bottom: 5pt" v-model="searchQ">
    <label>Auction Status: </label>
    <select v-model="statusSelected">
      <option v-for="status in statusTitles">{{status}}</option>
    </select>
    <label> Auction Category: </label>
    <select v-model="categoryTitle">
      <option >All Categories</option>
      <option v-for="category in categories">{{category.categoryTitle}}</option>
    </select>
    <button class="btn btn-outline-primary" v-on:click="getAuctions('search')">Search</button>
      <div class="row mx-auto" style="padding-left: 18%">
        <div class="card col-xs-12 col-sm-6 col-md-3 gap" style="margin: 5pt; padding: 5pt" v-for="auction in auctions">
          <img class="card-img-top" v-bind:src="getPicture(auction.id)" alt="Card image cap" width="350" height="220">
          <div class="card-body">
            <h5 class="card-title">{{auction.title}}</h5>
            <p class="card-text"><strong>category:</strong> {{auction.categoryTitle}}</p>
            <p class="card-text text-left"><strong>Start Date:</strong> {{auction.startDateTime | formatDate}}</p>
            <p class="card-text text-left"><strong>End Date:</strong> {{auction.endDateTime | formatDate}}</p>
            <p class="card-text text-left"><strong>Current Bid:</strong> {{auction.currentBid}}</p>
            <router-link class="btn btn-primary" :to="{name: 'singleAuction', params: {auctionId: auction.id}}">View</router-link>
          </div>
        </div>
      </div>
    <nav aria-label="Page navigation">
      <h4 style="color: red; margin: 10pt" v-if="isEnd">End of Page</h4>
      <ul class="pagination mx-auto" style=" width: 80pt">
        <li class="page-item" v-if="!noPrevious">
          <a class="page-link pagination-enable" href="#" aria-label="Previous" v-on:click="getAuctions('previous')">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        <li class="page-item disabled" v-else>
          <a class="page-link" style="background-color: gray; color: white" href="#"aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        <li class="page-item" v-if="!noNext">
          <a class="page-link pagination-enable" href="#" aria-label="Next" v-on:click="getAuctions('next')">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
        <li class="page-item disabled" v-else>
          <a class="page-link" href="#" style="background-color: gray; color: white" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
    export default {
      data () {
        return {
          showLoading: false,
          run: false,
          auctions: [],
          auction: {},
          editable: false,
          searchQ: "",
          categoryTitle: "All Categories",
          categories: [],
          startIndex: 0,
          count: 6,
          noNext: false,
          noPrevious: true,
          statusSelected: "all",
          statusTitles: ["all", "active", "expired", "won", "upcoming"],
          isEnd: false,
          pictureURL: ''
        }
      },
      mounted:  function () { //gets all auction
        this.showLoading = true;
        this.$http.get('http://127.0.0.1:4941/api/v1/auctions?startIndex='+this.startIndex+'&count='+this.count)
            .then(function (response) {
              this.showLoading = false;
              this.auctions = response.data;

              if(this.auctions.length < this.count) {
                this.noNext = true;
              }

            }, function (error) {
              this.showLoading = false;
              this.error = error.data;
              this.errorFlag = true;
            });
          this.$http.get('http://127.0.0.1:4941/api/v1/categories')
            .then(function (response) {
              this.categories = response.data;

            }, function (error) {
              this.error = error.data;
              this.errorFlag = true;
              if(this.error.length <=0 ){
                alert('Server not found!');
              }
            });
        // }
      },
      methods: {
        getAuctions: function (pagination) { //gets auctions based on query param
          this.isEnd = false;
          this.showLoading = true;
          if(pagination === 'next'){
            this.noPrevious = false;
            this.startIndex += this.count;
          }

          if(pagination === 'previous'){
            this.noNext = false;
            this.startIndex -= this.count;
          }

          if(pagination === 'search'){
            this.startIndex = 0;
            this.noNext = false;
            this.noPrevious = true;
          }

          let categoryId = 0;
          let categoryStr = '';
          for(let i = 0; i < this.categories.length; i++){ //process category id
            if(this.categoryTitle === this.categories[i].categoryTitle){
              categoryId = this.categories[i].categoryId;
              break;
            }
          }

          if(categoryId !== 0){
            categoryStr = '&category-id='+categoryId;
          }

          this.$http.get('http://127.0.0.1:4941/api/v1/auctions?startIndex='+this.startIndex+'&count='+this.count+'&q='+this.searchQ+'&status='+this.statusSelected+categoryStr)
            .then(function (response) {
              this.showLoading = false;
              this.auctions = response.data;
              if ((pagination === 'next' || pagination === 'search') && response.data.length < this.count) {
                this.noNext = true;
              }

              if(pagination==='previous' && this.startIndex <= 0){
                this.noPrevious = true;
              }

              // if(pagination === 'search' && response.data.length < 6){
              //   this.noPrevious = true;
              //   this.noNext = true;
              // }

              if(response.data.length === 0){
                this.isEnd = true;
              }

              console.log('startIndex='+this.startIndex+'&count='+this.count+'&q='+this.searchQ+'&status='+this.statusSelected+categoryStr);

            }, function (error) {
              this.showLoading = false;
              this.error = error.data;
              this.errorFlag = true;
            });
        },
        getPicture: function (auctionId) {
          return 'http://127.0.0.1:4941/api/v1/auctions/'+auctionId+'/photos';
        }
      }
    }
</script>

<style scoped>

</style>
