<template>
  <form @submit.prevent="onSubmit" :id="formId">
    <div v-if="isShowStatus" class="mb-3">
      <label :for="formId + '__status'" class="form-label">Статус</label>
      <input
        class="form-control"
        :id="formId + '__status'"
        :value="statusName"
        disabled
        readonly
      />
    </div>
    <div class="mb-3">
      <label :for="formId + '__comment'" class="form-label">Комментарий</label>
      <input
        v-model.trim="comment"
        required
        class="form-control"
        :id="formId + '__comment'"
      />
    </div>
    <div class="mb-3">
      <label :for="formId + '__quantity'" class="form-label">Количество</label>
      <input
        v-model.trim="quantity"
        required
        class="form-control"
        :id="formId + '__quantity'"
      />
    </div>
    <div v-show="errorMessage.length" class="alert alert-danger mb-0">
      {{ errorMessage }}
    </div>
  </form>
</template>
<script>
import HeroClient, {
  STATUS_ACCEPTED_SUCCESS,
  STATUS_ON_MODERATION,
} from "@/api/HeroClient";
import UserError from "@/exceptions/UserError";

const EVENT_SUCCESS_SAVE = "success-save";
const EVENT_SAVING = "saving";

export default {
  client: new HeroClient(),

  name: "NodeForm",
  props: {
    formId: { type: String, required: true },
    node: { type: Object, required: true },
  },
  emits: [EVENT_SUCCESS_SAVE, EVENT_SAVING],
  data: function () {
    return {
      saving: false,
      errorMessage: "",
      comment: "",
      quantity: "",
    };
  },
  computed: {
    isShowStatus() {
      return (
        this.node.statusId === STATUS_ACCEPTED_SUCCESS ||
        this.node.statusId === STATUS_ON_MODERATION
      );
    },
    statusName() {
      if (this.node.statusId === STATUS_ACCEPTED_SUCCESS) {
        return "Принято";
      }
      if (this.node.statusId === STATUS_ON_MODERATION) {
        return "На модерации";
      }
      return "";
    },
  },
  created() {
    this.comment = this.node.userComment;
    this.quantity = this.node.userQuantity;
  },
  methods: {
    onSubmit() {
      if (this.saving) {
        return;
      }

      this.$emit(EVENT_SAVING, true);
      this.saving = true;
      this.errorMessage = "";
      this.$options.client
        .updateNode(this.node.id, this.getData())
        .then((node) => {
          this.$emit(EVENT_SUCCESS_SAVE, node);
        })
        .catch((error) => {
          if (error instanceof UserError) {
            this.errorMessage = error.message;
          } else {
            throw error;
          }
        })
        .finally(() => {
          this.saving = false;
          this.$emit(EVENT_SAVING, false);
        });
    },
    getData() {
      return {
        comment: this.comment,
        quantity: this.quantity,
      };
    },
  },
};
</script>
