<template>
  <div class="container">
    <h1>Хроники хаоса Эра доминиона - откроем остров вместе!</h1>
    <p>
      В игре появилось новое собитие <b>Остров приключений</b>. На котором нужно
      тратить ходы исследователя и открывать узлы карты, получать подарки.
      Изначально вся карта закрыта и неизвестно в какую сторону двигаться чтобы
      получить лучший приз.
    </p>

    <h3>Острова</h3>
    <div v-if="loadingIslands"></div>
    <div v-else-if="!islands.length" class="alert alert-warning">
      Не найдено доступных.
    </div>
    <ol v-else>
      <li v-for="island in islands" :key="island.id">
        <router-link
          :to="{ name: 'island', params: { id: island.id } }"
          :class="[isActual(island) ? '' : 'text-secondary']"
          >{{ island.name + " " + getIslandHint(island) }}</router-link
        >
        <span v-if="isActual(island)" class="badge text-bg-primary ms-2"
          >актуально</span
        >
      </li>
    </ol>

    <div v-if="news.length">
      <h3>Новости</h3>
      <p>...</p>
    </div>
  </div>
</template>
<script>
import HeroClient from "@/api/HeroClient";
import { fromCurrentDate } from "@/helpers/formatter";

export default {
  client: new HeroClient(),

  name: "TheHomeView",
  inject: ["setMetaInfo"],
  data() {
    return {
      loadingIslands: true,
      islands: [],
      islandsCount: 0,
      news: [],
    };
  },
  created() {
    this.setMetaInfo({
      title: "Хроники хаоса Эра доминиона карта острова",
      description:
        "В игре Хроники Хаоса на карте острова открыты все узлы, соберем все призы вместе!",
      keywords: "Хроники хаоса, Эра доминиона, карта острова, карта, событие",
    });
  },
  mounted() {
    this.loadIslands();
  },
  methods: {
    isActual(island) {
      const now = new Date();

      return island.eventEndAt > now;
    },
    getIslandHint(island) {
      const now = new Date();
      let result = "";

      if (island.eventEndAt < now) {
        result =
          "от " +
          fromCurrentDate(island.eventStartAt) +
          " до " +
          fromCurrentDate(island.eventEndAt);
      } else {
        const days = Math.ceil((island.eventEndAt - now) / 1000 / 60 / 60 / 24);
        result =
          "до " +
          fromCurrentDate(island.eventEndAt) +
          ", осталось дней " +
          days;
      }

      return result;
    },
    loadIslands() {
      this.loadingIslands = true;
      this.$options.client
        .getIslandList(5)
        .then((list) => {
          this.islands = list.items;
          this.islandsCount = list.totalCount;
        })
        .catch(() => {
          this.errorMessage =
            "Не удалось загрузить острова. Разработчики видят проблему и в скором времени починят.";
        })
        .finally(() => (this.loadingIslands = false));
    },
  },
};
</script>
