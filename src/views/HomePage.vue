<template>
  <div>
    <h1>Соберем все призы вместе!</h1>

    <p v-if="creating">Loading...</p>
    <svg
      v-else
      width="800"
      height="600"
      viewBox="-5 -5 10 10"
      style="padding: 10px; margin: 0 auto; outline: 1px solid #ddd"
    >
      <circle
        v-for="(item, index) in coordinates"
        :key="index"
        :cx="item[0]"
        :cy="item[1]"
        r="0.5"
        stroke="black"
        stroke-width="0.1"
        fill="red"
        class="circle"
      />
    </svg>

    <p>Кликни на ячейку и впиши что в ней находится</p>
    <ol>
      <li>Название</li>
      <li>Кличество</li>
    </ol>
  </div>
</template>
<script>
export default {
  name: "HomePage",
  components: {},
  data() {
    return {
      creating: true,
      coordinates: [],
    };
  },
  mounted() {
    this.createField();
  },
  methods: {
    createField() {
      this.creating = true;

      const coordinates = [
        [0, -1],
        [0, 0],
        [0, 1],
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ];

      this.coordinates = coordinates;

      this.creating = false;
    },
  },
};
</script>
<style scoped>
.circle:hover {
  fill: green;
  cursor: pointer;
}
</style>
