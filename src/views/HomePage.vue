<template>
  <div>
    <h1>Соберем все призы вместе!</h1>

    <p v-if="creating">Loading...</p>
    <svg
      v-else
      width="800"
      height="600"
      viewBox="-20 -20 40 40"
      style="padding: 10px; margin: 0 auto; outline: 1px solid #ddd"
    >
      <polygon
        v-for="(item, index) in paths"
        :key="index"
        :points="item.spacePaths"
        class="node"
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
      paths: [],
    };
  },
  mounted() {
    this.createField();
  },
  methods: {
    createField() {
      this.creating = true;

      const coordinates = [
        [0, -10],
        [0, 0],
        [0, 10],
        [-10, -10],
        [-10, 0],
        [-10, 10],
        [10, -10],
        [10, 0],
        [10, 10],
      ];

      const leftNodeCount = 10;
      const rightNodeCount = 10;
      const topNodeCount = 5;
      const bottomNodeCount = 5;

      let paths = [];
      const side = 4;
      const halfSide = side / 2;
      const h = (Math.sqrt(3) / 2) * side;

      coordinates.forEach((item) => {
        const x = item[0];
        const y = item[1];

        let arr = new Array(6);
        console.log(arr);
        arr[0] = { x: x + side, y: y };
        arr[1] = { x: x + halfSide, y: y + h };
        arr[2] = { x: x - halfSide, y: y + h };
        arr[3] = { x: x - side, y: y };
        arr[4] = { x: x - halfSide, y: y - h };
        arr[5] = { x: x + halfSide, y: y - h };
        console.log(arr);

        paths.push({
          coordinates: arr,
          spacePaths: this.getPaths(arr),
        });
      });
      console.log(paths);

      this.coordinates = coordinates;
      this.paths = paths;

      this.creating = false;
    },
    getPaths(coordinates) {
      return coordinates.map((item) => item.x + "," + item.y).join(" ");
    },
  },
};
/*
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
      */
</script>
<style scoped>
.node {
  fill: lime;
  stroke: purple;
  stroke-width: 0.1
}
.node:hover {
  fill: green;
  cursor: pointer;
}
</style>
