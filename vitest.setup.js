//import { config } from '@vue/test-utils'
//import { vi } from "vitest"
//import { createI18n, useI18n } from 'vue-i18n'
//import { useRouter } from 'vue-router'

/*
vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(() => ({
    push: () => {}
  }))
}))

OR

useRouter.mockReturnValue({
  push: vi.fn(),
})*/



/*
const i18n = createI18n({
  legacy: false,
  allowComposition: true
})
config.global.plugins = [i18n]

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key) => key,
    d: (key) => key,
  }),
}));

useI18n.mockReturnValue({
  t: (tKey) => tKey,
});

config.global.mocks = {
  $t: (tKey) => tKey,
};
*/
