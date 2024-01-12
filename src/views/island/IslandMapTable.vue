<template>
  <table class="table table-striped table-hover table-sm mt-3">
    <thead>
      <tr>
        <th></th>
        <th>Ресурс</th>
        <th>Количество</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="!items.length">
        <td colspan="3">Нет данных.</td>
      </tr>
      <tr v-else v-for="item in items" :key="item.uniqueId">
        <td>
          <img
            v-if="item.item.iconUrl"
            :src="item.item.iconUrl"
            :width="item.item.iconWidth"
            :height="item.item.iconHeight"
            class="icon"
          />
        </td>
        <td>{{ item.item.name }}</td>
        <td class="text-end">{{ item.humanQuantity }}</td>
      </tr>
    </tbody>
  </table>
</template>
<script>
export default {
  name: "IslandMapTable",
  props: {
    items: { type: Array, required: true },
  },
};
</script>
<style scoped>
.icon {
  width: 24px;
  height: 24px;
}
</style>
