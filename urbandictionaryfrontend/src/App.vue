<template>
  <div id="app">
    <!--    Add a ProfileButton here -->
    <header>
      <div class="navbar navbar-dark bg-dark shadow-sm">
        <div class="container">
          <router-link to="/" class="navbar-brand d-flex align-items-center p-2">
            <b-icon icon="book-half" >
            </b-icon>
            <strong>Urban Dictionary</strong>
          </router-link>
          <button class="navbar-toggler" type="button">
            <p class="h3 mb-2" >

              <router-link to="/UrbanTerm"
                           class="navbar-brand d-flex align-items-center p-2">
                <b-icon icon="person-circle" ></b-icon>
              </router-link>
            </p>
          </button>

        </div>
      </div>
    </header>
    <div style="position:relative; height: 900px; overflow-y:scroll;">
      <router-view class="container-xl"/>

    </div>
    <ParticlesBg color="#28282B" type="random" num:1000 :bg="true" />
  </div>
</template>
<script>

import { ParticlesBg } from 'particles-bg-vue';

export default {
  name: 'App',
  components: {
    ParticlesBg,
  },
};
</script>
<style>

</style>
