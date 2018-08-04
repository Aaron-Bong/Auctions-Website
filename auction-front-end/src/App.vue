<template>
  <div id="app">
    <router-link class="btn btn-primary" style="margin-bottom: 10pt"
      v-if="$routerHistory.hasPrevious()"
      :to="{ path: $routerHistory.previous().path }">
      < Previous
    </router-link>
    <button v-else class="btn btn-primary" style="margin-bottom: 10pt; background-color: gray" disabled>< Previous</button>

    <router-link class="btn btn-primary" style="margin-bottom: 10pt"
      v-if="$routerHistory.hasForward()"
      :to="{ path: $routerHistory.next().path }">
      Next >
    </router-link>
    <button v-else class="btn btn-primary" style="margin-bottom: 10pt; background-color: gray" disabled>Next ></button>

    <nav class="navbar navbar-expand-lg navbar-light navbar-top" style="margin-bottom: 10pt; background-color: lightskyblue;">
      <router-link class="navbar-brand" :to="{name: 'Auction'}">Seller Master</router-link>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-between" id="navbarNavAltMarkup">
        <div class="navbar-nav">
          <router-link style="color: white" class="nav-item nav-link" :to="{name: 'myAuction'}" v-if="isLogged">My Auctions</router-link>
          <router-link style="color: white" class="nav-item nav-link" :to="{name: 'user', params: {userId: userId}}" v-if="isLogged">{{user.username}}</router-link>
        </div>
        <div class="navbar-nav">
          <a style="color: white" class="nav-item nav-link" href="#createUserModel" data-target="#createUserModel" data-toggle="modal" v-if="!isLogged" v-on:click="resetError()">Register</a>
          <a style="color: white" class="nav-item nav-link" href="#loginModel" data-target="#loginModel" data-toggle="modal"  v-if="!isLogged" v-on:click="resetError()">Login</a>
          <a style="color: white" class="nav-item nav-link" v-on:click.prevent="logout()" href="#"  v-if="isLogged">Logout</a>
        </div>

      </div>
    </nav>

    <router-view></router-view>

    <div class="modal fade" id="createUserModel" tabindex="-1" role="dialog"
         aria-labelledby="createUserModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="createUserModalLabel">Register new account</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form v-on:submit.prevent="createUser()" v-if="!isLogged && !showLoading">
              <div class="form-group">
                <label>User Name:</label>
                <input v-model = "username" required/>
              </div>
              <div class="form-group">
                <label> Given Name:</label>
                <input v-model = "givenname" required/>
              </div>
              <div class="form-group">
                <label>Family Name:</label>
                <input v-model = "familyname" required/>
              </div>
              <div class="form-group">
                <label>Email Address:</label>
                <input v-model = "email" type="email" v-bind:pattern="emailRegex" required/>
              </div>
              <div class="form-group">
                <label>Password:</label>
                <input v-model = "password" type="password" required/>
              </div>
              <p v-if="errorFlag" style="color: red">{{error}}</p>
              <div class="modal-footer">
                <button type="submit" class="btn btn-outline-success">Create</button>
                <button type="button" class="btn btn-outline-primary" data-dismiss="modal">Close</button>
              </div>
            </form>
            <img src="./assets/loading.gif" v-if="showLoading">
            <p data-dismiss="modal" v-if="isLogged">Welcome {{user.givenName}}!</p>
          </div>
          <div class="modal-footer" v-if="isLogged">
            <button type="button" class="btn btn-outline-primary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="loginModel" tabindex="-1" role="dialog"
         aria-labelledby="loginModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="loginModalLabel">Login</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form v-on:submit.prevent="login('login')" v-if="!isLogged && !showLoading">
                <div class="form-group">
                  <label>User Name:</label> <br>
                  <input v-model= "loginUsername" />
                </div>
                <p style="text-align: left">Or</p>
                <div class="form-group">
                  <label>email address:</label> <br>
                  <input v-model = "loginEmail" type="email" v-bind:pattern="emailRegex"/>
                </div>
                <div class="form-group">
                  <label>password:</label> <br>
                  <input v-model = "loginPassword" type="password" required/>
                </div>
              <br>
              <p v-if="errorFlag" style="color: red">{{error}}</p>
              <div class="modal-footer">
                <button type="submit"  class="btn btn-outline-success">Confirm</button> <!--cannot use data-dismiss="modal", otherwise, form will not trigger login method-->
                <button type="button" class="btn btn-outline-primary" data-dismiss="modal">Close</button>
              </div>
            </form>
            <img src="./assets/loading.gif" v-if="showLoading">
            <p data-dismiss="modal" v-if="isLogged">Welcome back {{user.givenName}}!</p>
          </div>
          <div class="modal-footer" v-if="isLogged">
            <button type="button" class="btn btn-outline-primary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <footer>
      <p style="margin-bottom: 0; color: green">SENG365 Assignment 2. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
  export default {
  data () {
    return {
      showLoading: false,
      loginUsername: "",
      loginEmail: "",
      emailRegex: "[^@\\s]+@[^@\\s]+\\.[^@\\s]+",
      loginPassword: "",
      username: "",
      givenname: "",
      familyname: "",
      email: "",
      password: "",
      error: "",
      errorFlag: false,
      userId: "",
      isLogged: false,
      loginable: false,
      user: {
        username: ""
      }
    }
  },
    mounted: function () {
      if(localStorage.getItem("token") !== null){
        this.getUser('login');
      }
    },
  methods: {
    resetError: function () {
      this.errorFlag = false;
      this.error = "";
    },
    // getLogInStatus: function () {
    //   console.log("logged in ???????????")
    //   return this.isLogged;
    // },
    getUser: function (mode) {
      this.$http.get('http://127.0.0.1:4941/api/v1/users/' + localStorage.getItem("userId"), {
        headers: {
          'X-Authorization': localStorage.getItem("token")
        }
      })
        .then(function(response){
          this.user = response.data;
          if(mode ==='login'){
          this.isLogged = true;
          this.userId = localStorage.getItem("userId");
          }

        }, function(error){
          this.error = error.data;
          this.errorFlag = true;
        });
    },
      createUser: function () {
        let req = {
          "username": this.username,
          "givenName": this.givenname,
          "familyName": this.familyname,
          "email": this.email,
          "password": this.password
        };

        this.$http.post('http://127.0.0.1:4941/api/v1/users/', JSON.stringify(req))
          .then(function (response) {
            this.id = response.data.id;
            this.login('register');
          }, function (error) {
            this.error = error.data;
            this.errorFlag = true;
          });
      },
    login: function (mode) {
      this.showLoading = true;
      let req = {};
      if(mode === 'register'){
        req = {
          "password": this.password,
          'username': this.username,
          'email': this.email
        };
      } else {
        req = {
          "password": this.loginPassword
        };

        if (this.loginUsername === "" && this.loginEmail === "") {
          this.error = "Please enter user name or email";
          this.errorFlag = true;
          this.showLoading = false;
          return;
        }

        if (this.loginUsername !== "") {
          req['username'] = this.loginUsername;
        }

        if (this.loginEmail !== "") {
          req['email'] = this.loginEmail;
        }
      }

      this.$http.post('http://127.0.0.1:4941/api/v1/users/login/', JSON.stringify(req))
        .then(function (response) {
          this.showLoading = false;
          this.userId = response.data.id;
          this.isLogged = true;
          this.errorFlag = false;
          this.error = '';

          if (typeof(Storage) !== "undefined") {
            // Store to local storage
            localStorage.setItem("userId", response.data.id);
            localStorage.setItem("token", response.data.token);
            this.getUser('register');
          } else {
            alert("WARNING! your browser does not support Web Storage");
          }

        }, function (error) {
          this.showLoading = false;
          this.error = error.data;
          this.errorFlag = true;
        });
    },
    logout: function () {
      this.$http.post('http://127.0.0.1:4941/api/v1/users/logout/', null, {
        headers: {
          'X-Authorization': localStorage.getItem("token")
        }
      })
        .then(function (response) {
          localStorage.removeItem("userId");
          localStorage.removeItem("token");
          localStorage.removeItem("categories");
          this.userId = '';
          this.isLogged = false;
          this.loginUsername= "";
          this.loginEmail= "";
          this.loginPassword= "";
          this.username= "";
          this.givenname= "";
          this.familyname= "";
          this.email= "";
          this.password= "";
          this.$router.push('/');
        }, function (error) {
          this.error = error;
          this.errorFlag = true;
        });
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  background: url("./assets/background.jpg") no-repeat center center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: blue;
}

  .form-group {
    text-align: left;
  }
  input {
    width: 100%;
  }

  .modal-footer {
    justify-content: center;
  }

textarea {
  width: 100%;
}

  .text-left {
    text-align: left;
  }
  .pagination-enable {
    color: white;
    background-color: dodgerblue;
  }

</style>
