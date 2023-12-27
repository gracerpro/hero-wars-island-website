<template>
  <table class="table table-striped table-hover table-sm mt-3">
    <thead>
      <tr>
        <th>Ресурс</th>
        <th>Количество</th>
        <th>Стоимость в изумрудах</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="!items.length">
        <td colspan="4">Нет данных.</td>
      </tr>
      <tr v-else v-for="item in items" :key="item.uniqueId">
        <td>{{ item.item.name }}</td>
        <td class="text-end">{{ item.humanQuantity }}</td>
        <td class="text-end">{{ item.emeraldCost }}</td>
      </tr>
    </tbody>
  </table>
</template>
<script>
export default {
  name: "MapTable",
  props: {
    items: { type: Array, required: true },
  },
};
</script>
