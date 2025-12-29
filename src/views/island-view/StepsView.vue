<script setup lang="ts">
import type { Node } from '@/api/NodeApi';
import { fromCurrentDate, getHumanQuantity } from '@/helpers/formatter';
import { formatDate } from '@/helpers/formatter';
interface Props {
  node: Node
}

const props = defineProps<Props>()

console.log("props.node", props.node)

</script>

<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>Уровень, шаг</th>
          <th>Награда</th>
          <th>Цена хода</th>
          <th>Каждые __ ч.</th>
          <th>Окончание</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(stepItem, index) in props.node.steps" :key="index">
          <td>{{ index + 1 }}</td>
          <td>
            <div v-for="(reward, index2) in stepItem.rewards" :key="index + '_' + index2">
              gameId {{ reward.gameId }} gameType {{ reward.gameType }} <b>{{ getHumanQuantity(reward.quantity) }}</b>
            </div>
          </td>
          <td>
            <div v-for="(cost, index3) in stepItem.costs" :key="index + '_' + index3">
              gameId {{ cost.gameId }} gameType {{ cost.gameType }} <b>{{ getHumanQuantity(cost.quantity) }}</b>
            </div>
          </td>
          <td>{{ stepItem.countdownInterval ? (stepItem.countdownInterval / 3600).toFixed() : '' }}</td>
          <td>{{ stepItem.countdownEndDate ? formatDate(stepItem.countdownEndDate) : '' }}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>