<template>
  <modal-dialog :element-id="dialogId" header="Хочешь помочь?" ref="dialog">
    <p>Кликни на ячейку со знаком вопроса, и впиши что в ней находится.</p>
    <ol>
      <li>Название</li>
      <li>Кличество, если больше 1</li>
    </ol>
    <p>Нажать среднюю кнопку мышки - перемещение.</p>
    <p>Прокручивать средней кнопкой мышки - увеличение или уменьшение.</p>
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
