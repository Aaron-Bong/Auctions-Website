<template>
  <h4 style="color: red" v-if="!isLoggedIn">Please login to view User Page!</h4>
  <img src="./assets/loading.gif" v-else-if="showLoading">
  <div v-else class="container">
    <div class="card" style="margin-bottom: 25%">
      <h5 class="card-header">Personal Details</h5>
      <div class="card-body">
        <p class="card-text"><strong>User Name:</strong></p>
        <p class="card-text">{{user.username}}</p>
        <p class="card-text"><strong>Given Name:</strong></p>
        <p class="card-text">{{user.givenName}}</p>
        <p class="card-text"><strong>Family Name:</strong></p>
        <p class="card-text">{{user.familyName}}</p>
        <p class="card-text" v-if="isOwner"><strong>Email:</strong></p>
        <p class="card-text" v-if="isOwner">{{user.email}}</p>
        <p class="card-text" v-if="isOwner"><strong>Account Balance:</strong></p>
        <p class="card-text" v-if="isOwner">{{user.accountBalance | moneyFormat}}</p>
        <button class="btn btn-primary" data-target="#updateUserModel" data-toggle="modal" v-if="isOwner">Edit</button>

      </div>
    </div>
    <div class="modal fade" id="updateUserModel" tabindex="-1" role="dialog" data-backdrop="static" data-keyboard="false"
         aria-labelledby="updateUserModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="updateUserModalLabel">Update Your Details</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form v-on:submit.prevent="updateUser()" v-if="!isUpdated">
              <div class="form-group">
                <label>Given Name:</label>
              <input v-model = "userUpdate.givenName"/>
              </div>
              <div class="form-group">
                <label>Family Name:</label>
              <input v-model = "userUpdate.familyName">
              </div>
              <p v-if="errorFlag" style="color: red">{{error}}</p>
              <div class="modal-footer">
                <button type="submit" class="btn btn-outline-success">Update</button>
                <button type="button" class="btn btn-outline-primary" data-dismiss="modal" v-on:click="getUser()">Close</button>
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
    export default {
        data(){
          return{
            user: Object,
            userUpdate: Object,
            isOwner: false,
            userId: '',
            isUpdated: false,
            error: "",
            errorFlag: false,
            showLoading: false,
            isLoggedIn: true
          }
        },
      mounted: function () {
        if(localStorage.getItem("token") === null){
          this.isLoggedIn = false;
          return;
        } else {
          this.isLoggedIn = true;
        }

        this.showLoading = true;
        this.userId  = this.$route.params.userId;
        this.ownerVerify();

        this.$http.get('http://127.0.0.1:4941/api/v1/users/' + this.userId, {
          headers: {
            'X-Authorization': localStorage.getItem("token")
          }
        })
          .then(function(response){
            this.user = response.data;
            this.userUpdate = Object.assign({}, response.data);
            this.showLoading = false;
          }, function(error){
            this.error = error;
            this.errorFlag = true;
            this.showLoading = false;
          });
      },
      methods: {
        resetModal: function () {
          this.isUpdated = false;
          this.errorFlag = false;
        },
        updateUser: function () {
          let req = {
            "givenName": this.userUpdate.givenName,
            "familyName": this.userUpdate.familyName
          };

          this.$http.patch('http://127.0.0.1:4941/api/v1/users/' + localStorage.getItem("userId"), JSON.stringify(req), {
            headers: {
              'X-Authorization': localStorage.getItem("token")
            }
          })
            .then(function (response) {
              this.isUpdated = true;
              this.getUser();

            }, function (error) {
              this.error = error.data;
              this.errorFlag = true;
            });
        },
        getUser: function () {
          this.$http.get('http://127.0.0.1:4941/api/v1/users/' + localStorage.getItem("userId"), {
            headers: {
              'X-Authorization': localStorage.getItem("token")
            }
          })
            .then(function(response){
              this.user = response.data;

            }, function(error){
              this.error = error;
              this.errorFlag = true;
            });
        },
        ownerVerify: function () {
          if(parseInt(this.userId) === parseInt(localStorage.getItem("userId"))){
            this.isOwner = true;
          }
          else {
            this.isOwner = false;
          }
        }
      }
    }
</script>

<style scoped>

</style>
