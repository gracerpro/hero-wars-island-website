<script setup lang="ts">
/* global HTMLElement */
/* global setTimeout */

import ClientOnly from "@/components/ClientOnly.vue";
import { UserError } from "@/exceptions/UserError";
import HeroClient from "@/api/HeroClient";
import { ref, shallowReactive, onMounted, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { TYPE_SUCCESS, TYPE_DANGER } from "@/components/toast";
import { defineAsyncComponent } from "vue";
import type { FeedbackData } from "@/api/FeedbackApi";
import type { ComponentExposed } from "vue-component-type-helpers";
import type ToastMessage from "@/components/ToastMessage.vue";

const { t } = useI18n();

const submiting = ref(false);

const client = new HeroClient();
const createdDate = new Date();

if (!import.meta.env.SSR) {
  defineAsyncComponent(() => import("@/components/ToastMessage.vue"));
}

const errorMessage = ref("");
const feedback = shallowReactive({
  username: "",
  email: "",
  subject: "",
  message: "",
});
const toastRef = useTemplateRef<ComponentExposed<typeof ToastMessage>>('toastRef');
const formSubject = ref<HTMLElement | null>(null);
const formId = "contactForm";

onMounted(() => {
  setTimeout(() => {
    if (formSubject.value) {
      formSubject.value.focus();
    }
  }, 300);
});

const onSubmit = () => {
  if (submiting.value) {
    return;
  }

  submiting.value = true;

  const data: FeedbackData = {
     ...feedback,
     contactEmail: "",
    tempField: "1",
    submitTimeInMs: new Date().getTime() - createdDate.getTime()
  };
  errorMessage.value = "";

  client.feedback
    .create(data)
    .then(() => {
      feedback.message = "";
      feedback.subject = "";

      toastRef.value?.show(t("page.contact.messageWasCreated"), TYPE_SUCCESS);
    })
    .catch((error) => {
      if (error instanceof UserError) {
        errorMessage.value = error.message;
        toastRef.value?.show(error.message, TYPE_DANGER);
      } else {
        errorMessage.value = t("common.internalError");
        throw error;
      }
    })
    .finally(() => (submiting.value = false));
};
</script>

<template>
  <form
    class="p-2 border border-secondary-subtle rounded-3"
    @submit.prevent="onSubmit"
  >
    <div class="mb-3">
      <label
        class="form-label"
        :for="formId + '__subject'"
        >{{ t("page.contact.theme") }}</label
      >
      <input
        :id="formId + '__subject'"
        ref="formSubject"
        v-model.trim="feedback.subject"
        :disabled="submiting"
        class="form-control"
        required
      />
    </div>
    <div class="mb-3">
      <label
        :for="formId + '__message'"
        class="form-label"
        >{{ t("page.contact.message") }}</label
      >
      <textarea
        :id="formId + '__message'"
        v-model.trim="feedback.message"
        class="form-control"
        rows="3"
        :disabled="submiting"
        required
      ></textarea>
    </div>
    <div class="row">
      <div class="col-lg-6 mb-3">
        <label
          :for="formId + '__username'"
          class="form-label"
          >{{ t("page.contact.username") }}</label
        >
        <input
          :id="formId + '__username'"
          v-model.trim="feedback.username"
          :disabled="submiting"
          class="form-control"
          :aria-describedby="formId + '__username__help'"
        />
        <div
          :id="formId + '__username__help'"
          class="form-text"
        >
          {{ t("page.contact.canBeEmpty") }}
        </div>
      </div>
      <div class="col-lg-6 mb-3">
        <label
          :for="formId + '__email'"
          class="form-label"
          >{{ t("page.contact.email") }}</label
        >
        <input
          :id="formId + '__email'"
          v-model.trim="feedback.email"
          :disabled="submiting"
          type="email"
          class="form-control"
          :aria-describedby="formId + '__email__help'"
        />
        <div
          :id="formId + '__email__help'"
          class="form-text"
        >
          {{ t("page.contact.canBeEmpty") }}
        </div>
      </div>
    </div>
    <div
      v-show="errorMessage.length"
      class="mb-3"
    >
      <div
        class="alert alert-danger mb-0"
        role="alert"
      >
        {{ errorMessage }}
      </div>
    </div>
    <div>
      <button
        type="submit"
        class="btn btn-primary w-100"
        :disabled="submiting"
      >
        <span
          v-show="submiting"
          class="spinner-border spinner-border-sm"
          aria-hidden="true"
        ></span>
        {{ t("common.send") }}
      </button>
    </div>

    <client-only>
      <toast-message
        ref="toastRef"
        element-id="contactToast"
      />
    </client-only>
  </form>
</template>
