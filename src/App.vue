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

      if (info.description !== undefined) {
        const descriptionEl = document.querySelector(
          "head meta[name='description']"
        );
        if (!descriptionEl) {
          createMeta("description", info.description);
        } else {
          descriptionEl.setAttribute("content", info.description);
        }
      }

      if (info.keywords !== undefined) {
        const keywordsEl = document.querySelector("head meta[name='keywords']");
        if (!keywordsEl) {
          createMeta("keywords", info.keywords);
        } else {
          keywordsEl.setAttribute("content", info.keywords);
        }
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
