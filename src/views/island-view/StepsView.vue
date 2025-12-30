<script setup lang="ts">
import { getType, getUnknownItem, type ItemMap } from '@/api/ItemApi';
import type { Node, TypeGameIdToItemMap } from '@/api/NodeApi';
import { getHumanQuantity } from '@/helpers/formatter';
import { formatDate } from '@/helpers/formatter';
import { computed } from 'vue';

interface Props {
  node: Node
  gameItemMap: TypeGameIdToItemMap
  originRewards: ItemMap
}

const props = defineProps<Props>()

const steps = computed(() => {
  const result = props.node.steps?.map((stepItem, index) => {
    const rewards = stepItem.rewards.map((reward) => {
      const type = getType(reward.gameType)
      const gameId = (reward.gameId && reward.gameId > 0) ? reward.gameId : 0
      const itemId = props.gameItemMap[type + '_' + gameId] ?? null

      return {
        ...reward,
        item: itemId && props.originRewards[itemId] ? props.originRewards[itemId] : getUnknownItem()
      }
    })
    const costs = stepItem.costs.map((costItem) => {
      const type = getType(costItem.gameType)
      const gameId = (costItem.gameId && costItem.gameId > 0) ? costItem.gameId : 0
      const itemId = props.gameItemMap[type + '_' + gameId] ?? null

      return {
        ...costItem,
        item: itemId && props.originRewards[itemId] ? props.originRewards[itemId] : getUnknownItem()
      }
    })

    return {
      number: index + 1,
      rewards,
      costs,
      countdownInterval: stepItem.countdownInterval ?
        (stepItem.countdownInterval / 3600).toFixed()
        : '',
      countdownEndDate: stepItem.countdownEndDate ?
        formatDate(stepItem.countdownEndDate)
        : ''
    }
  })

  return result
})

</script>

<template>
  <div>
    <table class="table table-striped table-hover table-sm">
      <thead>
        <tr>
          <th></th>
          <th>Награда</th>
          <th>Цена хода</th>
          <th>Каждые __ ч.</th>
          <th>Окончание</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(stepItem, index) in steps" :key="index">
          <td>{{ index + 1 }}</td>
          <td>
            <div v-for="(reward, index2) in stepItem.rewards" :key="index + '_' + index2">
              {{ reward.item.name }} <b>{{ getHumanQuantity(reward.quantity) }}</b>
            </div>
          </td>
          <td>
            <div v-for="(cost, index3) in stepItem.costs" :key="index + '_' + index3">
              {{ cost.item.name }} <b>{{ getHumanQuantity(cost.quantity) }}</b>
            </div>
          </td>
          <td>{{ stepItem.countdownInterval }}</td>
          <td>{{ stepItem.countdownEndDate }}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>