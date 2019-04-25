<template>
  <div id="app">
    <!--
    <Slide style="margin-right:5px">
      <a id="home" href="/home">
        <span>
          <i class="fas fa-home" style="color:green"></i> Home
        </span>
      </a>
      <a id="ranking" href="/rankings">
        <span>
          <i class="fas fa-trophy" style="color:green"></i> Rankings
        </span>
      </a>
      <a id="editProfile" href="/profile">
        <span>
          <i class="fas fa-user" style="color:green"></i> Profile
        </span>
      </a>
       <a id="logout" href="/logout">
        <span>
         <i class="fas fa-sign-out-alt" style="color:green"></i> Logout
        </span>
      </a>
    </Slide>
    -->
    <router-view/>
  </div>
</template> 

<script>
//import { Slide } from 'vue-burger-menu'

export default {
  name: 'App',
    methods : {
      
    },
    components: {
      //Slide
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
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
