<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container">
      <div class="navbar-nav">
        <router-link to="/" class="nav-link">Гланая</router-link>
        <router-link
          v-if="actualIsland"
          :to="{ name: 'island', params: { id: actualIsland.id } }"
          class="nav-link"
          >Актуальный остров</router-link
        >
        <router-link to="/contact" class="nav-link">Контакты</router-link>
        <router-link to="/about" class="nav-link">О проекте</router-link>
      </div>
    </div>
  </nav>
  <router-view />
</template>
<script>
import HeroClient from "./api/HeroClient";

export default {
  client: new HeroClient(),

  name: "App",
  provide() {
    return {
      setMetaInfo: this.setMetaInfo,
    };
  },
  data: function () {
    return {
      actualIsland: null,
    };
  },
  created() {
    this.$options.client.getActualIsland().then((island) => {
      this.actualIsland = island;
    });
  },
  methods: {
    setMetaInfo(info) {
      if (info.title) {
        document.title = info.title;
      }

      const descriptionEl = document.querySelector(
        "head meta[name='description']"
      );
      const description = info.description ? info.description : "";
      if (!descriptionEl) {
        createMeta("description", description);
      } else {
        descriptionEl.setAttribute("content", description);
      }

      const keywordsEl = document.querySelector("head meta[name='keywords']");
      const keywords = info.keywords ? info.keywords : "";
      if (!keywordsEl) {
        createMeta("keywords", keywords);
      } else {
        keywordsEl.setAttribute("content", keywords);
      }

      function createMeta(name, content) {
        var meta = document.createElement("meta");
        meta.name = name;
        meta.content = content;
        document.getElementsByTagName("head")[0].appendChild(meta);
      }
    },
  },
};
</script>
