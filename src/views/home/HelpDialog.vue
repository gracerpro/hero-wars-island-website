<template>
  <modal-dialog
    :element-id="dialogId"
    :is-show-submit="false"
    header="Хочешь помочь?"
    ref="dialog"
  >
    <p>На ячейке со знаком вопроса нужно вписать или поправить ресурс.</p>
    <ol>
      <li>Название ресурса, главное понятное и существующее</li>
      <li>Количество, если больше 1 (например, 123, 300к, 5М)</li>
    </ol>
    <h4>Карта</h4>
    <p>При перемещении курсора если нажать среднюю кнопку мышки - сдвиг.</p>
    <p class="mb-0">
      Прокручивать средней кнопкой мышки - увеличение или уменьшение.
    </p>
  </modal-dialog>
</template>
<script>
import ModalDialog from "@/components/ModalDialog.vue";

const EVENT_MOUNTED = "mounted";

export default {
  name: "HelpDialog",
  components: { ModalDialog },
  emits: [EVENT_MOUNTED],
  computed: {
    dialogId() {
      return "node-help-dialog";
    },
  },
  mounted() {
    this.$emit(EVENT_MOUNTED);
  },
  methods: {
    show() {
      return this.$refs.dialog.show();
    },
  },
};
</script>
