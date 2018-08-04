<template>
  <img src="./assets/loading.gif" v-if="showLoading">
    <div v-else>
      <button class="btn btn-primary" v-on:click="verifyLogin()" style="margin-bottom: 10pt">Refresh</button>
      <div class="card" style="margin-left: 5%; margin-right: 5%; padding: 5pt; margin-bottom: 20%">
        <div class="row">
          <div class="col-md-4">
            <img class="card-img-top" v-bind:src="pictureURL" alt="Card image cap" style="max-width: 500px; max-height: 500px">
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <h4 class="card-title">{{auction.title}}</h4>
              <p class="card-text"><strong>category:</strong> {{auction.categoryTitle}}</p>
              <router-link class="card-text" :to="{name: 'user', params: {userId: auction.seller.id}}" v-if="isLoggedIn"><strong>Seller:</strong> {{auction.seller.username}}</router-link>
              <a href="#" class="card-text" v-on:click=notLoggedIn() v-if="!isLoggedIn"><strong>Seller:</strong> {{auction.seller.username}}</a>
              <p class="card-text" style="margin-top: 10pt"><strong>Start Date:</strong> {{auction.startDateTime | formatDate}}</p>
              <p class="card-text"><strong>End Date:</strong> {{auction.endDateTime | formatDate}}</p>
              <p class="card-text"><strong>Description:</strong> {{auction.description}}</p>
              <p class="card-text" v-if="isOwner"><strong>Reserve Price:</strong> ${{auction.reservePrice | moneyFormat}}</p>
              <p class="card-text"><strong>Starting Price:</strong> ${{auction.startingBid | moneyFormat}}</p>
              <router-link class="card-text" style="color: green" :to="{name: 'user', params: {userId: winning.buyerId}}" v-if="!noBids && isLoggedIn && isReservedMet"><strong>{{bidStatusMsg}}</strong> {{winning.buyerUsername}}</router-link>
              <a href="#" class="card-text" style="color: green" v-on:click=notLoggedIn() v-if="!noBids && !isLoggedIn && isReservedMet"><strong>{{bidStatusMsg}}</strong> {{winning.buyerUsername}}</a>
              <strong v-if="!isReservedMet" style="color: orange">Reserve not met</strong>
              <p class="card-text" style="margin-top: 10pt"><strong>Current Bid:</strong> ${{auction.currentBid | moneyFormat}}</p>
              <label>Next minimum bid:</label>
              <input v-model = "bidAmount"  type="number" step="1" min="1"  style="width: 15%" v-if="bidable">
              <input v-model = "bidAmount" style="width: 15%" v-else disabled>
              <button class="btn btn-primary" v-on:click=makeBid($route.params.auctionId) v-if="bidable && isLoggedIn">Place Bid!</button>
              <button class="btn btn-primary" v-on:click=notLoggedIn() v-if="!isLoggedIn && bidable">Bid</button>
              <button class="btn btn-primary" v-if="!bidable" disabled>Bid</button>

              <button class="btn btn-primary" v-on:click="viewBids = !viewBids">Bid History</button>
              <button class="btn btn-primary" v-if="editable" data-target="#updateAuctionModel" data-toggle="modal">Edit</button>
              <button class="btn btn-primary" v-if="!editable && isOwner" disabled>Edit</button>

              <ol class="list-group list-group-flush" v-if="viewBids" style="margin-top: 10px">
                <li class="list-group-item" v-if="noBids">
                  No Bid History
                </li>
                <li class="list-group-item" v-else v-for="bid in bids">
                  <div class="row">
                    <div class="col-md-4" style="text-align: left">Date: {{bid.datetime | formatDate}}</div>
                    <div class="col-md-4" style="text-align: left" v-if="isLoggedIn"><router-link :to="{name: 'user', params: {userId: bid.buyerId}}">Buyer: {{bid.buyerUsername}}</router-link></div>
                    <div class="col-md-4" style="text-align: left" v-if="!isLoggedIn"><a href="#" v-on:click=notLoggedIn()>Buyer: {{bid.buyerUsername}}</a></div>
                    <div class="col-md-4" style="text-align: left">Bid Amount: ${{bid.amount | moneyFormat}}</div>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      <div class="modal fade" id="updateAuctionModel" tabindex="-1" role="dialog" data-backdrop="static" data-keyboard="false"
           aria-labelledby="updateAuctionModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="updateAuctionModalLabel">Update Auction Model</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <form v-on:submit.prevent="updateAuction($route.params.auctionId)" v-if="!isUpdated">
                <div class="form-group">
                  <label>Auction Title:</label>
                  <input v-model = "auctionUpdate.title" required/>
                </div>
                <div class="form-group">
                  <label>Category:</label>
                  <select v-model="categoryTitle">
                    <option v-for="category in categories">{{category.categoryTitle}}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Start Date Time:</label>
                  <input v-model = "startDateTimeReadable" placeholder ="Start Date Time" type="datetime-local" style="width: auto" required/>
                </div>
                <div class="form-group">
                  <label>End Date Time:</label>
                  <input v-model = "endDateTimeReadable" placeholder ="End Date Time" type="datetime-local" style="width: auto" required/>
                </div>
                <div class="form-group">
                  <label>Description:</label> <br>
                  <textarea v-model = "auctionUpdate.description" required></textarea>
                </div>
                <div class="form-group">
                  <label>Reserve Price:</label>
                  <input v-model = "auctionUpdate.reservePrice"  type="number" step="1" min="0" required/>
                </div>
                <div class="form-group">
                  <label>Starting Bid:</label>
                  <input v-model = "auctionUpdate.startingBid"  type="number" step="1" min="0" required/>
                </div>
                <div class="form-group">
                <label>Would you like to update your picture?</label> <br>
              <label class="radio-inline"><input type="radio" style="width: auto" value="noAction" v-model="picked" v-on:click="updatable=true"> No Thanks</label>
              <br>
              <label class="radio-inline"><input type="radio" style="width: auto" value="delete" v-model="picked" v-on:click="updatable=true"> Delete Current Picture</label>
                <br>
              <label class="radio-inline"><input type="radio" style="width: auto" value="upload" v-model="picked" v-on:click="isPhotoUploaded()"> Upload New Picture & Replace Current One</label>
                </div>
                <div class="form-group">
                  <label>Upload Image:</label>
                  <input type="file" @change="onFileChanged" v-if="picked === 'upload'">
                  <input type="file" v-if="picked !== 'upload'" disabled>
                </div>
                <p v-if="errorFlag" style="color: red">{{error}}</p>
              <div class="modal-footer">
                <button type="submit" class="btn btn-outline-success">Update</button>
                <button type="button" class="btn btn-outline-primary" data-dismiss="modal">Close</button>
              </div>
              </form>
              <p data-dismiss="modal" v-if="isUpdated" v-on:click="resetModal()">Update Success!</p>
            </div>
            <div class="modal-footer" v-if="isUpdated">
              <button type="button" class="btn btn-outline-primary" data-dismiss="modal" v-on:click="resetModal()">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
  // import App from './App.vue';
    export default {
        data(){
          return{
            editable: false,
            showLoading: false,
            auction: {
              title: "",
              seller: {
                username: "",
                id: "",
              },
              startDateTimeUnix: "",
              endDateTime: "",
              description: "",
              currentBid: ""
            },
            auctionUpdate: {
              title: "",
              seller: {
                username: "",
                id: "",
              },
              startDateTimeUnix: "",
              endDateTime: "",
              description: "",
              currentBid: ""
            },
            error: "",
            errorFlag: false,
            auctionId: 0,
            selectedFile: null,
            selectedFileType: null,
            viewBids: false,
            bidAmount: 0,
            bidable: true,
            startDateTimeReadable: '',
            endDateTimeReadable: '',
            categoryTitle: '',
            pictureURL: '',
            picked: 'noAction',
            updatable: true,
            isLoggedIn: false,
            categories: [],
            isOwner: false,
            isUpdated: false,
            noBids: false,
            bids: [],
            winning: {
              buyerId: '',
              buyerUsername: ''
            },
            bidStatusMsg: 'Winning:',
            isReservedMet: false
          }
        },
      mounted: function() {
        this.showLoading = true;
        this.editable = false;
        this.auctionId = this.$route.params.auctionId;
        this.getPicture(this.auctionId);

        if(localStorage.getItem("token") !== null){
          this.isLoggedIn = true;
        }

        // this.isLoggedIn = App.methods.isLoggedIn;

        this.$http.get('http://127.0.0.1:4941/api/v1/auctions/' + this.auctionId)
          .then(function(response){
            this.auction = response.data;
            if(this.auction.bids.length === 0){
              this.noBids = true;
            } else {
              this.noBids = false;
              this.bids = this.auction.bids.sort(function(a,b){return b.datetime - a.datetime});
              this.winning = this.auction.bids[0];

            }
            this.auctionUpdate = Object.assign({}, response.data);
            if(this.auction.bids.length === 0){
              this.bidAmount = parseInt(this.auction.startingBid + 1);
            } else {
              this.bidAmount = parseInt(this.auction.currentBid + 1);
            }
            this.verifyAuctionEditable();
            this.verifyAuctionBidable();
            this.showLoading = false;
          }, function(error){
            this.error = error.data;
            this.errorFlag = true;
            this.showLoading = false;
          });
      },
      methods: {
          resetModal: function () {
            this.isUpdated = false;
            this.errorFlag = false;
          },
        verifyLogin: function () {
          if(localStorage.getItem("token") !== null){
            this.isLoggedIn = true;
          }
        },
          notLoggedIn: function () {
            alert("You must be logged in first! If you have, please click refresh.");
          },
        isPhotoUploaded: function () {
          if(this.selectedFile === null){
            this.updatable = false;
          } else {
            this.updatable = true;
          }
        },
          getCategories: function () {
            this.$http.get('http://127.0.0.1:4941/api/v1/categories')
              .then(function (response) {
                this.categories = response.data;

                for(let i = 0; i < this.categories.length; i++){ //process category title
                  if(this.auction.categoryId === this.categories[i].categoryId){
                    this.categoryTitle = this.categories[i].categoryTitle;
                    break;
                  }
                }

              }, function (error) {
                this.error = error;
                this.errorFlag = true;
              });
          },
        onFileChanged (event) {
          this.selectedFile = event.target.files[0];
          this.selectedFileType= event.target.files[0].type;
          this.updatable = true;
        },
        onUpload: function (auctionId) {
          if(this.picked !== 'upload'){
            //this.getOneAuction(this.auctionId);
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

            }, function (error) {
              this.error = error;
              this.errorFlag = true;
            });
        },
        onDelete: function (auctionId) {
          this.$http.delete('http://127.0.0.1:4941/api/v1/auctions/'+auctionId+'/photos', {
            headers: {
              'X-Authorization': localStorage.getItem("token")
            }
          })
            .then(function (response) {
              this.getPicture(this.auctionId);
              //this.getOneAuction(this.auctionId);
            }, function (error) {
              this.error = error;
              this.errorFlag = true;
              this.getPicture(this.auctionId);
              //this.getOneAuction(this.auctionId);
            });
        },
        getPicture: function (auctionId) {
          this.pictureURL = 'http://127.0.0.1:4941/api/v1/auctions/'+auctionId+'/photos';
        },
        updateAuction: function (auctionId) {
          if(!this.updatable){
            this.error = 'Please choose a photo';
            this.errorFlag = true;
            return;
          }

          let categoryId = 0;
          if(this.picked === 'upload' || this.picked === 'delete'){
            this.pictureURL = "";
          }
          for(let i = 0; i < this.categories.length; i++){ //process category id
            if(this.categoryTitle === this.categories[i].categoryTitle){
              categoryId = this.categories[i].categoryId;
              break;
            }
          }
          let startDateTimeUnix = new Date(this.startDateTimeReadable).getTime();
          let endDateTimeUnix = new Date(this.endDateTimeReadable).getTime();
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

          this.auctionUpdate.startDateTime = startDateTimeUnix;
          this.auctionUpdate.endDateTime = endDateTimeUnix;

          let req = {
            "categoryId": parseInt(categoryId),
            "title": this.auctionUpdate.title,
            "description": this.auctionUpdate.description,
            "startDateTime": this.auctionUpdate.startDateTime,
            "endDateTime": this.auctionUpdate.endDateTime,
            "reservePrice": parseFloat(this.auctionUpdate.reservePrice),
            "startingBid": parseFloat(this.auctionUpdate.startingBid)
          };

          this.$http.patch('http://127.0.0.1:4941/api/v1/auctions/' + auctionId, JSON.stringify(req), {
            headers: {
              'X-Authorization': localStorage.getItem("token")
            }
          })
            .then(function (response) {
              if (this.picked === "delete") {
                this.onDelete(this.auctionId);
              } else if (this.picked === "upload"){
                this.onUpload(this.auctionId);
            }
              this.isUpdated = true;
              this.getOneAuction(auctionId);
            }, function (error) {
              this.error = error.data;
              this.errorFlag = true;
            });
        },
        verifyAuctionEditable: function () {
          this.$http.get('http://127.0.0.1:4941/api/v1/auctions?q='+this.auction.title+'&status=upcoming'+'&seller='+localStorage.getItem("userId"))
            .then(function (response) {
              if(response.data.length !== 0) {
                for (let i = 0; i < response.data.length; i++) {
                  if (parseInt(this.auctionId) === parseInt(response.data[i].id)) {
                    this.editable = true;
                  } else {
                    this.editable = false;
                  }
                }
              }

              if(this.editable){
                this.getCategories();
                let startDateTimeReadableVar = new Date(this.auction.startDateTime);
                let endDateTimeReadableVar = new Date(this.auction.endDateTime);
                this.startDateTimeReadable = this.dateFormat(startDateTimeReadableVar);
                this.endDateTimeReadable = this.dateFormat(endDateTimeReadableVar);
              }
            },function (error) {
              this.error = error;
              this.errorFlag = true;
            })
        },
        verifyAuctionBidable: function () {
          let currentTimeUnix = new Date().getTime();
          // check if current viewer is owner
          this.$http.get('http://127.0.0.1:4941/api/v1/auctions?q='+this.auction.title+'&seller='+localStorage.getItem("userId"))
            .then(function (response) {
              if(response.data.length !== 0){
                for (let i = 0; i < response.data.length; i++) {
                  if (parseInt(this.auctionId) === parseInt(response.data[i].id)) {
                    this.isOwner = true;
                    this.bidable = false;

                  }
                }
              }
              if (currentTimeUnix < this.auction.startDateTime || currentTimeUnix > this.auction.endDateTime) {
                //this.editable = true;
                this.bidable = false;
                this.bidStatusMsg = 'Winner:'
              }

              this.isReservedMet = this.auction.reservePrice < this.auction.currentBid;

            },function (error) {
              this.error = error;
              this.errorFlag = true;
            })
        },
        dateFormat: function (date) {
          let dd = date.getDate();
          let mm = date.getMonth()+1; //January is 0!
          let yyyy = date.getFullYear();
          let hh = date.getHours();
          let m = date.getMinutes();

          if(dd<10) {
            dd = '0'+dd
          }

          if(mm<10) {
            mm = '0'+mm
          }

          if(hh<10) {
            hh = '0'+hh
          }

          if(m<10) {
            m = '0'+m
          }

          return yyyy+'-'+mm+'-'+dd+'T'+hh+':'+m;
        },
        getOneAuction: function(auctionId) {
          this.$http.get('http://127.0.0.1:4941/api/v1/auctions/' + auctionId)
            .then(function(response){
              this.auction = response.data;
              this.bids = this.auction.bids.sort(function(a,b){return b.datetime - a.datetime});
              this.winning = this.auction.bids[0];
              this.bidAmount = parseInt(this.auction.currentBid + 1);

              if(this.auction.bids.length === 0){
                this.noBids = true;
                this.bidAmount = parseInt(this.auction.startingBid + 1);
              } else {
                this.noBids = false;
                this.bidAmount = parseInt(this.auction.currentBid + 1);
              }

              let currentTimeUnix = new Date().getTime();
              if (currentTimeUnix < this.auction.startDateTime || currentTimeUnix > this.auction.endDateTime) {
                //this.editable = true;
                this.bidable = false;
                this.bidStatusMsg = 'Winner:'
              }

              this.isReservedMet = this.auction.reservePrice < this.auction.currentBid;


            }, function(error){
              this.error = error.data;
              this.errorFlag = true;
              alert(this.error);
            });
        },
        makeBid: function (auctionId){
          let currentTimeUnix = new Date().getTime();
          if (currentTimeUnix < this.auction.startDateTime || currentTimeUnix > this.auction.endDateTime) {
            //this.editable = true;
            this.bidable = false;
            this.bidStatusMsg = 'Winner:';
            alert("Auction closed");
            return;
          }

          this.isReservedMet = this.auction.reservePrice < this.auction.currentBid;

          if(this.auction.bids.length === 0 && this.bidAmount <= this.auction.startingBid){
            alert('Your bid amount must be larger than starting price');
            return;
          }

          if(this.bidAmount <= this.auction.currentBid){
            alert('Your bid amount must be larger than current bid');
            return;
          }

          this.$http.post('http://127.0.0.1:4941/api/v1/auctions/'+auctionId+'/bids?amount='+this.bidAmount, null, {
            headers: {
              'X-Authorization': localStorage.getItem("token")
            }
          })
            .then(function (response) {
              alert("bid Successful");
              //this.getOwnerAuction();
              this.getOneAuction(auctionId);

            }, function (error) {
              this.error = error;
              this.errorFlag = true;
            });
        }
      }
    }
</script>

<style scoped>

</style>
