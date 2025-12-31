<script setup lang="ts">
import { getType, getUnknownItem, type ItemMap } from '@/api/ItemApi';
import type { Node, TypeGameIdToItemMap } from '@/api/NodeApi';
import { getHumanQuantity } from '@/helpers/formatter';
import { formatShortDateTime } from '@/helpers/formatter';
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
        item: itemId && props.originRewards[itemId] ? props.originRewards[itemId] : getUnknownItem(),
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
        formatShortDateTime(stepItem.countdownEndDate)
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
            <div v-for="(reward, index2) in stepItem.rewards" :key="index + '_' + index2" class="item">
              <img
                v-if="reward.item.iconUrl && reward.item.iconWidth && reward.item.iconHeight"
                :src="reward.item.iconUrl"
                :width="reward.item.iconWidth"
                :height="reward.item.iconHeight"
                class="icon"
                :title="reward.item.name"
              />
              <span v-else class="icon -no-image" :title="reward.item.name"></span>
              <b>{{ getHumanQuantity(reward.quantity) }}</b>
            </div>
          </td>
          <td>
            <div v-for="(cost, index3) in stepItem.costs" :key="index + '_' + index3" class="item">
              <img
                v-if="cost.item.iconUrl && cost.item.iconWidth && cost.item.iconHeight"
                :src="cost.item.iconUrl"
                :width="cost.item.iconWidth"
                :height="cost.item.iconHeight"
                class="icon"
                :title="cost.item.name"
              />
              <span v-else class="icon -no-image" :title="cost.item.name"></span>
              <b>{{ getHumanQuantity(cost.quantity) }}</b>
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

<style scoped>
.icon {
  width: 32px;
  height: 32px;
  margin-right: 5px;
}
.-no-image {
  display: inline-block;
  outline: 1px solid #ddd;
}
.item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}
.item:last-child {
  margin-bottom: 0;
}
</style>