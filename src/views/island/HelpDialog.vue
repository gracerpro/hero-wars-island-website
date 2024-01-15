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
    <h4>Помощь</h4>
    <p class="mb-0">
      На ячейке со знаком вопроса нужно вписать или поправить ресурс.
    </p>
    <ul class="mb-0">
      <li>
        Название ресурса, главное понятное. Несколько названий разделяется
        запятой.
      </li>
      <li>
        Количество, если больше 1 (например, 123, 300к, 5М). Если названий
        несколько, то первое количество соответстветствует первому названию и т.
        д.
      </li>
    </ul>
  </modal-dialog>
</template>
<script setup>
import ModalDialog from "@/components/ModalDialog.vue";
import { ref } from "vue";

const dialogId = "node-help-dialog";

const dialog = ref(null);

const show = () => dialog.value.show();

defineExpose({
  show,
});
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
  background-color: #a6f3fd;
}
.node-town {
  background-color: #94440e;
}
.node-chest {
  background-color: #1a660b;
}
</style>
