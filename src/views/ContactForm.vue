<template>
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
      <label :for="formId + '__message'" class="form-label">Сообщение</label>
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

    <toast-message ref="toast" element-id="contactToast" />
  </form>
</template>
<script setup>
import UserError from "@/exceptions/UserError";
import HeroClient from "@/api/HeroClient";
import ToastMessage, {
  TYPE_SUCCESS,
  TYPE_DANGER,
} from "@/components/ToastMessage.vue";
import { ref, shallowReactive, onMounted } from "vue";

const client = new HeroClient();
const createdDate = new Date();

const submiting = ref(false);
const errorMessage = ref("");
const feedback = shallowReactive({
  username: "",
  email: "",
  subject: "",
  message: "",
});
const toast = ref(null);
const formSubject = ref(null);
const formId = "contactForm";

onMounted(() => {
  setTimeout(() => formSubject.value.focus(), 300);
});

const onSubmit = () => {
  if (submiting.value) {
    return;
  }

  submiting.value = true;

  const data = { ...feedback };
  data.contactEmail = "";
  data.tempField = "1";
  data.submitTimeInMs = new Date().getTime() - createdDate.getTime();
  errorMessage.value = "";

  client
    .createFeedback(data)
    .then(() => {
      feedback.message = "";
      feedback.subject = "";

      toast.value.show("Сообщение успешно создано.", TYPE_SUCCESS);
    })
    .catch((error) => {
      if (error instanceof UserError) {
        errorMessage.value = error.message;
        toast.value.show(error.message, TYPE_DANGER);
      } else {
        errorMessage.value = "Возникла внутренняя ошибка.";
        throw error;
      }
    })
    .finally(() => (submiting.value = false));
};
</script>
