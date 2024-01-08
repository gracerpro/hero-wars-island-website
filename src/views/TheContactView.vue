<template>
  <div class="container">
    <h1>Контакты</h1>

    <p>
      Если вы имеете интересные идеи или вопросы, пожалуйста, заполните
      следующие поля на форме для связи с нами. Спасибо!
    </p>

    <div class="row">
      <div class="col-lg-8 offset-lg-2 border border-primary rounded-3">
        <form @submit.prevent="onSubmit">
          <div class="mb-3 mt-2">
            <label class="form-label" :for="formId + '__subject'">Тема</label>
            <input
              v-model.trim="feedback.subject"
              :disabled="submiting"
              class="form-control"
              :id="formId + '__subject'"
              ref="formSubject"
              required
            />
          </div>
          <div class="mb-3">
            <label :for="formId + '__message'" class="form-label"
              >Сообщение</label
            >
            <textarea
              v-model.trim="feedback.message"
              class="form-control"
              :id="formId + '__message'"
              rows="3"
              :disabled="submiting"
              required
            ></textarea>
          </div>
          <div class="row">
            <div class="col-lg-6 mb-3">
              <label :for="formId + '__username'" class="form-label"
                >Имя пользователя</label
              >
              <input
                v-model.trim="feedback.username"
                :disabled="submiting"
                class="form-control"
                :id="formId + '__username'"
                :aria-describedby="formId + '__username__help'"
              />
              <div :id="formId + '__username__help'" class="form-text">
                Можно не заполнять
              </div>
            </div>
            <div class="col-lg-6 mb-3">
              <label :for="formId + '__email'" class="form-label"
                >Электронная почта</label
              >
              <input
                v-model.trim="feedback.email"
                :disabled="submiting"
                class="form-control"
                :id="formId + '__email'"
                :aria-describedby="formId + '__email__help'"
              />
              <div :id="formId + '__email__help'" class="form-text">
                Можно не заполнять
              </div>
            </div>
          </div>
          <div class="mb-3" v-show="errorMessage.length">
            <div class="alert alert-danger mb-0" role="alert">
              {{ errorMessage }}
            </div>
          </div>
          <div>
            <button
              type="submit"
              class="btn btn-primary mb-3 w-100"
              :disabled="submiting"
            >
              <span
                v-show="submiting"
                class="spinner-border spinner-border-sm"
                aria-hidden="true"
              ></span>
              Отправить
            </button>
          </div>
        </form>
      </div>
    </div>
    <toast-message ref="toast" element-id="contactToast" />
  </div>
</template>
<script>
import UserError from "@/exceptions/UserError";
import HeroClient from "@/api/HeroClient";
import ToastMessage, {
  TYPE_SUCCESS,
  TYPE_DANGER,
} from "@/components/ToastMessage.vue";

export default {
  client: new HeroClient(),

  name: "TheContactView",
  inject: ["setMetaInfo"],
  components: { ToastMessage },
  data: () => ({
    submiting: false,
    errorMessage: "",
    createdDate: new Date(),
    feedback: {
      username: "",
      email: "",
      subject: "",
      message: "",
    },
  }),
  computed: {
    formId() {
      return "contactForm";
    },
  },
  created() {
    this.setMetaInfo({
      title: "Контакты",
      description: "Оставить обратную связь, связаться с администратором",
      keywords: "контакты, связаться с автором, связь, обратная связь",
    });
  },
  mounted() {
    setTimeout(() => this.$refs.formSubject.focus(), 200);
  },
  methods: {
    onSubmit() {
      if (this.submiting) {
        return;
      }

      this.submiting = true;

      const data = { ...this.feedback };
      data.contactEmail = "";
      data.tempField = "1";
      data.submitTimeInMs = new Date().getTime() - this.createdDate.getTime();
      this.errorMessage = "";

      this.$options.client
        .createFeedback(data)
        .then(() => {
          this.feedback.message = "";
          this.feedback.subject = "";

          this.$refs.toast.show("Сообщение успешно создано.", TYPE_SUCCESS);
        })
        .catch((error) => {
          if (error instanceof UserError) {
            this.errorMessage = error.message;
            this.$refs.toast.show(error.message, TYPE_DANGER);
          } else {
            this.errorMessage = "Возникла внутренняя ошибка.";
            throw error;
          }
        })
        .finally(() => (this.submiting = false));
    },
  },
};
</script>
