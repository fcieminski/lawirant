<template>
  <div class="home">
    <input type="text" v-model="name" />
    <button @click="startGame">Ok</button>
    
    <div v-if="createTable">
        <button>Utwórz stół</button>
        <button>Dołącz do stołu</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
  components: {},
  data() {
    return {
      name: '',
      createTable: false,
    };
  },
  methods: {
    startGame() {
      if (this.name) {
          this.createTable = true;
      } else {
           this.createTable = false;
      }
    }
  }
};
</script>
