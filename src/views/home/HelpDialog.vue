<template>
  <modal-dialog
    :element-id="dialogId"
    :is-show-submit="false"
    header="Карта"
    ref="dialog"
  >
    <p>
      При перемещении курсора если нажать среднюю кнопку мышки - сдвиг.<br />
      Прокручивать средней кнопкой мышки - увеличение или уменьшение.
    </p>
    <h4>Узлы</h4>
    <ul class="list-unstyled">
      <li><span class="node-box node-start"></span>Начало, вход</li>
      <li><span class="node-box node"></span>Один ресурс</li>
      <li><span class="node-box node-town"></span>Башня</li>
      <li><span class="node-box node-chest"></span>Сундук</li>
    </ul>
    <h4>Хочешь помочь?</h4>
    <p>На ячейке со знаком вопроса нужно вписать или поправить ресурс.</p>
    <ol class="mb-0">
      <li>Название ресурса, главное понятное и существующее</li>
      <li>Количество, если больше 1 (например, 123, 300к, 5М)</li>
    </ol>
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
<style scoped>
.node-box {
  display: inline-block;
  width: 2em;
  height: 1em;
  border: 1px solid #dddddd;
  vertical-align: middle;
  margin-right: 0.5em;
}
.node {
  background-color: #9da7c9;
}
.node-start {
  background-color: #55211d;
}
.node-town {
  background-color: #94440e;
}
.node-chest {
  background-color: #1a660b;
}
</style>
