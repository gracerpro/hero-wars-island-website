<template>
  <form @submit.prevent="onSubmit" :id="formId">
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
import HeroClient from "@/api/HeroClient";
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
