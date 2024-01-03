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
      <label :for="formId + '__comment'" class="form-label">Ресурс</label>
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
        При вводе от {{ minCharsCount }} символов можно выбрать из списка, нажав
        клавишу "Вниз", затем "Ввод". Несколько названий разделяется запятой.
      </div>
      <datalist :id="formId + '__comment__datalist'">
        <option
          v-for="item in items"
          :key="item.id"
          :value="item.name"
        ></option>
      </datalist>
    </div>
    <div class="mb-3">
      <label :for="formId + '__quantity'" class="form-label">Количество</label>
      <input
        v-model.trim="quantity"
        class="form-control"
        :id="formId + '__quantity'"
        autocomplete="off"
        :aria-describedby="formId + '__quantityHelp'"
      />
      <div class="form-text" :id="formId + '__quantityHelp'">
        По-умолчанию 1. Если названий несколько, то первое количество
        соответстветствует первому названию и т. д.
      </div>
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
  lastInputTime: 0,
  inputTimerId: 0,

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
      commentErrorMessage: "",
      comment: "",
      quantity: "",
      itemId: null,
      items: [],
    };
  },
  computed: {
    minCharsCount() {
      return 3;
    },
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
            this.errorMessage = "Возникла внутренняя ошибка.";
            throw error;
          }
        })
        .finally(() => {
          this.saving = false;
          this.$emit(EVENT_SAVING, false);
        });
    },
    onCommentInput() {
      if (this.comment.length >= this.minCharsCount) {
        // поиск включается спустя время, чтобы убрать множественные запросы на сервер
        const diff = 400;
        const now = new Date();

        if (now - this.$options.lastInputTime < diff) {
          if (this.$options.inputTimerId) {
            clearTimeout(this.$options.inputTimerId);
          }
          this.$options.inputTimerId = 0;
        }

        this.$options.lastInputTime = now;
        this.$options.inputTimerId = setTimeout(this.getItems, diff);
      }
    },
    getItems() {
      this.$options.client
        .getItems(10, { name: this.comment })
        .catch((error) => {
          if (error instanceof UserError) {
            this.commentErrorMessage = error.message;
          } else {
            this.commentErrorMessage = "Возникла внутренняя ошибка.";
          }
          throw error;
        })
        .then((list) => {
          this.items = list.items;
          this.commentErrorMessage = "";
        });
    },
    onCommentChange() {
      this.items.forEach((item) => {
        if (item.name === this.comment) {
          this.itemId = item.id;
        }
      });
    },
    getData() {
      return {
        comment: this.comment,
        quantity: this.quantity,
        itemId: this.itemId,
      };
    },
  },
};
</script>
