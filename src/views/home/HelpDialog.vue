<template>
  <modal-dialog
    :element-id="dialogId"
    :is-show-submit="false"
    header="Хочешь помочь?"
    ref="dialog"
  >
    <p>Кликни на ячейку со знаком вопроса, и впиши что в ней находится.</p>
    <ol>
      <li>Название</li>
      <li>Кличество, если больше 1</li>
    </ol>
    <h4>Карта</h4>
    <p>Нажать среднюю кнопку мышки - перемещение.</p>
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
