<template>
  <h4 style="color: red" v-if="!isLoggedIn">Please login to view My Auction Page!</h4>
  <img src="./assets/loading.gif" v-else-if="showLoading">
  <div v-else>
    <div class="dropdown">
      <button class="btn btn-outline-primary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        My Auction Status
      </button>
      <button class="btn btn-outline-success" data-target="#createAuctionModel" data-toggle="modal">+ Add Auction</button>
      <h4 style="margin-top: 10pt">{{auctionMode}}</h4>
      <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <a class="dropdown-item" v-on:click="getAuction('&seller='+userId, 0, null)">Auctions I created</a>
        <a class="dropdown-item" v-on:click="getAuction('&bidder='+userId+'&status=active', 1, null)">Auctions I bid on</a>
        <a class="dropdown-item" v-on:click="getWinningAuction()">Auctions that I won</a>
        <a class="dropdown-item" v-on:click="getAuction('&seller='+userId+'&status=active', 3, null)">Auctions I created and currently in progress</a>
        <a class="dropdown-item" v-on:click="getAuction('&seller='+userId+'&status=won', 4, null)">Auctions I created and has a winner</a>
        <a class="dropdown-item" v-on:click="getAuction('&seller='+userId+'&status=expired', 5, null)">Auctions I created and has no winner</a>
      </div>
    </div>

    <div class="row mx-auto" style="padding-left: 18%">
      <div class="card col-xs-12 col-sm-6 col-md-3 gap" style="margin: 5pt; padding: 5pt" v-for="auction in auctions">
        <img class="card-img-top" v-bind:src="getPicture(auction.id)" alt="Card image cap" width="350" height="220">
        <div class="card-body">
          <h5 class="card-title">{{auction.title}}</h5>
          <p class="card-text">category: {{auction.categoryTitle}}</p>
          <p class="card-text">Start Date: {{auction.startDateTime | formatDate}}</p>
          <p class="card-text">End Date: {{auction.endDateTime | formatDate}}</p>
          <p class="card-text">Current Bid: {{auction.currentBid}}</p>
          <router-link class="btn btn-primary" :to="{name: 'singleAuction', params: {auctionId: auction.id}}">View</router-link>
        </div>
      </div>
    </div>

    <div class="modal fade" id="createAuctionModel" tabindex="-1" role="dialog" data-backdrop="static" data-keyboard="false"
         aria-labelledby="createAuctionModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="createAuctionModalLabel">Create new auction</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form v-on:submit.prevent="createAuction()" v-if="!isAuctionCreated">
              <div class="form-group">
                <label>Auction Title:</label>
                <input v-model = "title" placeholder ="Title" required/>
              </div>
              <div class="form-group">
                <label>Category:</label>
                <select v-model="categoryTitle">
                  <option v-for="category in categories">{{category.categoryTitle}}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Start Date Time:</label>
                <input v-model = "startDateTime" placeholder ="Start Date Time" type="datetime-local" style="width: auto"required/>
              </div>
              <div class="form-group">
                <label>End Date Time:</label>
                <input v-model = "endDateTime" placeholder ="End Date Time" type="datetime-local" style="width: auto" required/>
              </div>
              <div class="form-group">
                <label>Description:</label> <br>
                <textarea v-model = "description" placeholder ="Description" required></textarea>
              </div>
              <div class="form-group">
                <label>Reserve Price:</label>
                <input v-model = "reservePrice" type="number" step="1" min="0" required/>
              </div>
              <div class="form-group">
                <label>Starting Bid:</label>
                <input v-model = "startingBid" type="number" step="1" min="0" required/>
              </div>
              <div class="form-group">
                <label>Upload Image:</label>
                <input type="file" @change="onFileChanged">
              </div>
              <p v-if="errorFlag" style="color: red">{{error}}</p>
              <div class="modal-footer">
                <button type="submit" class="btn btn-outline-success">Create</button>
                <button type="button" class="btn btn-outline-primary" data-dismiss="modal">Close</button>
              </div>
            </form>
            <p data-dismiss="modal" v-if="isAuctionCreated" v-on:click="resetModal()">New Auction Created!</p>
          </div>
          <div class="modal-footer" v-if="isAuctionCreated">
            <button type="button" class="btn btn-outline-primary" data-dismiss="modal" v-on:click="resetModal()">Close</button>
          </div>
        </div>
      </div>
    </div>
    <nav aria-label="Page navigation">
      <h4 style="color: red; margin: 10pt" v-if="isEnd">End of Page</h4>
      <ul class="pagination mx-auto" style=" width: 80pt">
        <li class="page-item" v-if="!noPrevious">
          <a class="page-link pagination-enable" href="#" aria-label="Previous" v-on:click="getAuction(getAuctionParam, getAuctionMode, 'previous')">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        <li class="page-item disabled" v-else>
          <a class="page-link" href="#" style="background-color: gray; color: white" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        <li class="page-item" v-if="!noNext">
          <a class="page-link pagination-enable" href="#" aria-label="Next" v-on:click="getAuction(getAuctionParam, getAuctionMode, 'next')">
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
      data(){
        return {
          auctions: [],
          startIndex: 0,
          count: 6,
          title: '',
          categories: [],
          description: '',
          startDateTime: '',
          endDateTime: '',
          reservePrice: 0,
          startingBid: 0,
          categoryTitle: '',
          userId : null,
          auctionSelections: ['Auctions I created', 'Auctions I bid on', 'Auctions that I won', 'Auctions I created and currently in progress', 'Auctions I created and has a winner', 'Auctions I created and has no winner'],
          auctionMode: '',
          noNext: false,
          noPrevious: true,
          isEnd: false,
          getAuctionParam: null,
          getAuctionMode: null,
          isAuctionCreated: false,
          error: "",
          errorFlag: false,
          showLoading: false,
          isLoggedIn: true,
          selectedFile: null,
          selectedFileType: null
        }
      }
      ,
    mounted:  function () { //gets all auction belonging to owner
      if(localStorage.getItem("token") === null){
        this.isLoggedIn = false;
        return;
      } else {
        this.isLoggedIn = true;
      }

      this.showLoading = true;
      this.userId = localStorage.getItem("userId");

      this.auctionMode = this.auctionSelections[0];

      this.$http.get('http://127.0.0.1:4941/api/v1/categories')
        .then(function (response) {
          this.categories = response.data;
          this.categoryTitle = response.data[0].categoryTitle;
        }, function (error) {
          this.error = error;
          this.errorFlag = true;
        });

      this.$http.get('http://127.0.0.1:4941/api/v1/auctions?startIndex='+this.startIndex+'&count='+this.count+'&seller='+localStorage.getItem("userId"))
        .then(function (response) {
          this.auctions = response.data;
          if(this.auctions.length === 0){
            this.isEnd = true;
          }
          if(this.auctions.length < this.count) {
            this.noNext = true;
          }

          let today = new Date();
          let dd = today.getDate();
          let mm = today.getMonth()+1; //January is 0!
          let yyyy = today.getFullYear();
          let hhStart = today.getHours()+1;
          let hhEnd = today.getHours()+2;
          let m = today.getMinutes();

          if(dd<10) {
            dd = '0'+dd
          }

          if(mm<10) {
            mm = '0'+mm
          }

          if(hhStart<10) {
            hhStart = '0'+hhStart
          } else if(hhStart>23){
            hhStart = '0'+(today.getHours()+1)%24;
          }

          if(hhEnd<10) {
            hhEnd = '0'+hhEnd
          } else if(hhEnd>23){
            hhEnd = '0'+(today.getHours()+2)%24;
          }

          if(m<10) {
            m = '0'+m
          }

          this.startDateTime = yyyy+'-'+mm+'-'+dd+'T'+hhStart+':'+m;
          this.endDateTime = yyyy+'-'+mm+'-'+dd+'T'+hhEnd+':'+m;
          this.getAuctionParam = '&seller='+this.userId;
          this.showLoading = false
        }, function (error) {
          this.error = error.data;
          this.errorFlag = true;
          this.showLoading = false;
        });
    },
      methods: {
        resetModal: function () {
          this.isAuctionCreated = false;
          this.errorFlag = false;
        },
        onFileChanged (event) {
          this.selectedFile = event.target.files[0];
          this.selectedFileType= event.target.files[0].type;
        },
        onUpload: function (auctionId) {
          if(this.selectedFile === null){
            this.getPicture(this.auctionId);
            this.getAuction('&seller='+this.userId, null, 0);
            return;
          }
          this.$http.post('http://127.0.0.1:4941/api/v1/auctions/'+auctionId+'/photos', this.selectedFile, {
            headers: {
              'Content-Type': this.selectedFileType,
              'X-Authorization': localStorage.getItem("token")
            }
          })
            .then(function (response) {
              this.getPicture(this.auctionId);
              this.getAuction('&seller='+this.userId, null, 0);

            }, function (error) {
              this.error = error;
              this.errorFlag = true;
            });
        },
        createAuction: function () {
          let categoryId = null;

          let startDateTimeUnix = new Date(this.startDateTime).getTime();
          let endDateTimeUnix = new Date(this.endDateTime).getTime();
          let currentTimeUnix = new Date().getTime();

          if(currentTimeUnix > startDateTimeUnix){
            this.error = "Error, Start Date Time is after Current Date Time";
            this.errorFlag = true;
            return;
          }
          if(currentTimeUnix > endDateTimeUnix){
            this.error = "Error, End Date Time is before Current Date Time";
            this.errorFlag = true;
            return;
          }
          if(startDateTimeUnix >= endDateTimeUnix){
            this.error = "Error, Start Date Time is after or same as End Date Time";
            this.errorFlag = true;
            return;
          }

          for(let i = 0; i < this.categories.length; i++){ //process category id
            if(this.categoryTitle === this.categories[i].categoryTitle){
              categoryId = this.categories[i].categoryId;
              break;
            }
          }

          let req = {
            "categoryId": parseInt(categoryId),
            "title": this.title,
            "description": this.description,
            "startDateTime": startDateTimeUnix,
            "endDateTime": endDateTimeUnix,
            "reservePrice": parseInt(this.reservePrice),
            "startingBid": parseInt(this.startingBid)
          };

          this.$http.post('http://127.0.0.1:4941/api/v1/auctions', JSON.stringify(req), {
            headers: {
              'X-Authorization': localStorage.getItem("token")
            }
          })
            .then(function (response) {
              this.onUpload(response.data.id);
              this.isAuctionCreated = true;
              this.errorFlag = false;

              }, function (error) {
              this.error = error.data;
              this.errorFlag = true;
            });
        },
        getPicture: function (auctionId) {
          return 'http://127.0.0.1:4941/api/v1/auctions/'+auctionId+'/photos';
        },
        getAuction: function (param, mode, pagination) {
          this.isEnd = false;
          this.noNext = false;
          if(pagination === 'next'){
            this.noPrevious = false;
            this.startIndex += this.count;

          } else if(pagination === 'previous'){
            this.noNext = false;
            this.startIndex -= this.count;

          } else {
            this.startIndex = 0;
          }

          this.getAuctionParam = param;
          this.getAuctionMode = mode;

          this.$http.get('http://127.0.0.1:4941/api/v1/auctions?startIndex='+this.startIndex+'&count='+this.count+param)
            .then(function (response) {
              this.auctions = response.data;
              this.auctionMode = this.auctionSelections[mode];

              if (response.data.length < this.count) {
                this.noNext = true;

              } else {
                this.noNext = false;
              }

              if(this.startIndex <= 0){
                this.noPrevious = true;

              } else {
                this.noPrevious = false;
              }

              if(response.data.length === 0){
                this.isEnd = true;
              }

            }, function (error) {
              this.error = error;
              this.errorFlag = true;
            });
        },
        getWinningAuction: function () {
          this.$http.get('http://127.0.0.1:4941/api/v1/my_won_auctions', {
            headers: {
              'X-Authorization': localStorage.getItem("token")
            }
          })
            .then(function(response){
              this.auctions = response.data;
              this.auctionMode = this.auctionSelections[2];

              if(response.data.length === 0){
                this.isEnd = true;
              }

            }, function(error){
              this.error = error;
              this.errorFlag = true;
            });
        }
      }
    }
</script>

<style scoped>

</style>
