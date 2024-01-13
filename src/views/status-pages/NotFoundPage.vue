<template>
  <div class="container">
    <h1>Страница не найдена</h1>

    <p v-if="returnUrl">
      Была попытка перейти по адресу <code>{{ returnUrl }}</code
      >.
    </p>
  </div>
</template>
<script>
export default {
  name: "NotFoundPage",
  inject: ["setMetaInfo"],
  computed: {
    returnUrl() {
      return this.$route.query.returnUrl;
    },
  },
  created() {
    this.setMetaInfo({
      title: "Страница не найдена",
      description: "Страница не найдена",
      keywords: "404, страница не найдена",
    });
  },
};
</script>
