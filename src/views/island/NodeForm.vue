<template>
  <form @submit.prevent="onSubmit" :id="formId">
    <div class="row">
      <div v-if="isShowStatus" class="col-md-4 mb-3">
        <label :for="formId + '__status'" class="form-label">{{
          t("common.status")
        }}</label>
        <input
          class="form-control"
          :id="formId + '__status'"
          :value="statusName"
          disabled
          readonly
        />
      </div>
      <div class="col-md-8" v-if="nodeItems">
        <label class="form-label">{{ t("common.resource", 2) }}</label>
        <ul class="list-unstyled">
          <li v-for="item in nodeItems" :key="item.id" class="mb-1">
            <img
              v-if="item.iconUrl"
              class="icon"
              :src="item.iconUrl"
              :width="item.iconWidth"
              :height="item.iconHeight"
            />
            {{ item.quantity }}
            {{ item.name }}
          </li>
        </ul>
      </div>
    </div>

    <div class="mb-3">
      <label :for="formId + '__comment'" class="form-label">{{
        t("common.resource")
      }}</label>
      <input
        v-model.trim="comment"
        required
        :class="['form-control', commentErrorMessage ? 'is-invalid' : '']"
        :id="formId + '__comment'"
        :list="formId + '__comment__datalist'"
        @input="onCommentInput"
        @change="onCommentChange"
        autocomplete="off"
        :aria-describedby="formId + '__commentHelp'"
      />
      <div
        v-if="commentErrorMessage"
        class="invalid-feedback"
        :id="formId + '__commentHelp'"
      >
        {{ commentErrorMessage }}
      </div>
      <div v-else class="form-text" :id="formId + '__commentHelp'">
        {{ t("page.island.namesByComma") }}
      </div>
      <datalist :id="formId + '__comment__datalist'">
        <option
          v-for="item in items"
          :key="item.id"
          :value="item.name"
        ></option>
      </datalist>
    </div>
    <div>
      <label :for="formId + '__quantity'" class="form-label">{{
        t("common.quantity")
      }}</label>
      <input
        v-model.trim="quantity"
        class="form-control"
        :id="formId + '__quantity'"
        autocomplete="off"
        :aria-describedby="formId + '__quantityHelp'"
      />
      <div class="form-text" :id="formId + '__quantityHelp'">
        {{ t("page.island.quantityHint") }}
      </div>
    </div>
    <div v-show="errorMessage.length" class="alert alert-danger mb-0 mt-3">
      {{ errorMessage }}
    </div>
  </form>
</template>
<script>
const EVENT_SUCCESS_SAVE = "success-save";
const EVENT_SAVING = "saving";
</script>
<script setup>
import HeroClient from "@/api/HeroClient";
import { STATUS_CREATED, getStatusName } from "@/api/node";
import UserError from "@/exceptions/UserError";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const client = new HeroClient();
let lastInputTime = 0;
let inputTimerId = 0;

const props = defineProps({
  formId: { type: String, required: true },
  node: { type: Object, required: true },
});
const emit = defineEmits([EVENT_SUCCESS_SAVE, EVENT_SAVING]);

let itemId = null;
const minCharsCount = 3;

const saving = ref(false);
const errorMessage = ref("");
const commentErrorMessage = ref("");
const comment = ref("");
const quantity = ref("");
const items = ref([]);

const isShowStatus = computed(() => props.node.statusId !== STATUS_CREATED);
const statusName = computed(() => getStatusName(t, props.node.statusId));
const nodeItems = computed(() => {
  return props.node.items && props.node.items.length ? props.node.items : null;
});

comment.value = props.node.userComment;
quantity.value = props.node.userQuantity;

const onSubmit = () => {
  if (saving.value) {
    return;
  }

  emit(EVENT_SAVING, true);
  saving.value = true;
  errorMessage.value = "";
  client
    .updateNode(props.node.id, getData())
    .then((node) => {
      emit(EVENT_SUCCESS_SAVE, node);
    })
    .catch((error) => {
      if (error instanceof UserError) {
        errorMessage.value = error.message;
      } else {
        errorMessage.value = t("common.internalError");
        throw error;
      }
    })
    .finally(() => {
      saving.value = false;
      emit(EVENT_SAVING, false);
    });
};
const onCommentInput = () => {
  if (comment.value.length >= minCharsCount) {
    // show a list after some time, to remove multiple queries to server
    const diff = 400;
    const now = new Date();

    if (now - lastInputTime < diff) {
      if (inputTimerId) {
        clearTimeout(inputTimerId);
      }
      inputTimerId = 0;
    }

    lastInputTime = now;
    inputTimerId = setTimeout(getItems, diff);
  }
};
const getItems = () => {
  client
    .getItems(10, { name: comment.value })
    .then((list) => {
      items.value = list.items;
      commentErrorMessage.value = "";
    })
    .catch((error) => {
      if (error instanceof UserError) {
        commentErrorMessage.value = error.message;
      } else {
        commentErrorMessage.value = t("common.internalError");
      }
      throw error;
    });
};
const onCommentChange = () => {
  items.value.forEach((item) => {
    if (item.name === comment.value) {
      itemId = item.id;
    }
  });
};
const getData = () => {
  return {
    comment: comment.value,
    quantity: quantity.value,
    itemId,
  };
};
</script>
<style scoped>
.icon {
  display: inline-block;
  width: 32px;
  height: 32px;
  outline: 1px solid #ddd;
  margin-right: 5px;
}
</style>
