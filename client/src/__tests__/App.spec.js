import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('mounts renders properly', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          RouterView: true,
        },
      },
    })

    expect(wrapper.text()).toContain('JennyFits')
  })
})
