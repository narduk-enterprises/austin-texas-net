<script setup lang="ts">
definePageMeta({ title: 'Sign In' })

usePageSeo({
  title: 'Sign In',
  description: 'Sign in to your Austin-Texas.net account.',
})

useSeoMeta({ robots: 'noindex, nofollow' })

const {
  user,
  loggedIn,
  ensureLoaded,
  login: doLogin,
  signup: doSignup,
  logout: doLogout,
} = useAuth()
await ensureLoaded()

const form = reactive({
  name: '',
  email: import.meta.dev ? 'admin@austin-texas.net' : '',
  password: import.meta.dev ? 'testpassword123' : '',
})
const error = ref('')
const loading = ref(false)
const emailOpen = ref(false)
const mode = ref<'signin' | 'signup'>('signin')

const route = useRoute()
if (route.query.mode === 'signup') mode.value = 'signup'

const tabItems = computed(() => [
  { label: 'Sign In', value: 'signin' },
  { label: 'Sign Up', value: 'signup' },
])

function toggleMode() {
  mode.value = mode.value === 'signin' ? 'signup' : 'signin'
  error.value = ''
  form.email = ''
  form.password = ''
  form.name = ''
}

async function handleSubmit() {
  error.value = ''
  if (mode.value === 'signup' && form.password.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }
  loading.value = true
  try {
    if (mode.value === 'signin') {
      await doLogin(form.email, form.password)
    } else {
      await doSignup(form.email, form.password, form.name)
    }

    const redirect = route.query.redirect as string
    if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
      await navigateTo(redirect)
    } else {
      await navigateTo('/')
    }
  } catch (e: unknown) {
    const msg = (e as { data?: { message?: string } })?.data?.message
    error.value =
      mode.value === 'signin'
        ? msg || 'Invalid email or password'
        : msg || 'Failed to create account'
  } finally {
    loading.value = false
  }
}

function handleApple() {
  if (import.meta.client) {
    const params = new URLSearchParams({
      client_id: 'com.atxapps',
      redirect_uri: `${window.location.origin}/api/auth/apple-callback`,
      response_type: 'code id_token',
      response_mode: 'form_post',
      scope: 'name email',
      state: (route.query.redirect as string) || '/',
    })
    window.location.href = `https://appleid.apple.com/auth/authorize?${params.toString()}`
  }
}

async function handleLogout() {
  await doLogout()
  navigateTo('/login')
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-120px)] py-8 px-4">
    <div class="w-full max-w-[400px] flex flex-col gap-6">
      <!-- Logo & Title -->
      <div class="text-center">
        <div
          class="size-14 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-secondary/15 border border-primary/20"
        >
          <UIcon name="i-lucide-shield" class="size-7 text-primary" />
        </div>
        <h1 class="text-[1.75rem] font-bold tracking-tight mb-1">Austin Texas</h1>
        <p class="text-sm text-dimmed m-0">Sign in to your account</p>
      </div>

      <!-- Authenticated State -->
      <template v-if="loggedIn">
        <div class="flex flex-col gap-5 p-6 bg-elevated border border-default rounded-2xl">
          <div class="flex items-center gap-3">
            <div
              class="size-11 flex items-center justify-center rounded-xl bg-linear-to-br from-primary to-secondary text-white font-semibold text-lg"
            >
              {{ user?.email?.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-semibold m-0">{{ user?.name || 'Anonymous' }}</p>
              <p class="text-[0.8125rem] text-dimmed m-0">{{ user?.email }}</p>
            </div>
          </div>
          <UButton color="neutral" variant="outline" label="Sign Out" block @click="handleLogout" />
        </div>
      </template>

      <!-- Guest State -->
      <template v-else>
        <!-- Apple Sign In -->
        <UButton
          block
          size="lg"
          icon="i-lucide-apple"
          label="Continue with Apple"
          class="bg-black! text-white! border-none! dark:bg-white! dark:text-black!"
          @click="handleApple"
        />

        <!-- Divider -->
        <div
          class="flex items-center gap-3 text-dimmed text-xs uppercase tracking-wider before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border"
        >
          <span>or</span>
        </div>

        <!-- Email Toggle -->
        <UButton
          block
          variant="outline"
          color="neutral"
          :icon="emailOpen ? 'i-lucide-chevron-up' : 'i-lucide-mail'"
          :label="
            emailOpen ? 'Hide' : mode === 'signin' ? 'Sign in with email' : 'Sign up with email'
          "
          @click="emailOpen = !emailOpen"
        />

        <!-- Email Form -->
        <Transition name="slide">
          <div v-if="emailOpen" class="flex flex-col gap-5">
            <!-- Tabs -->
            <UTabs
              v-model="mode"
              :items="tabItems"
              :content="false"
              color="neutral"
              variant="pill"
              class="w-full"
              @update:model-value="error = ''"
            />

            <!-- Error -->
            <div
              v-if="error"
              class="flex items-center gap-2 py-3 px-4 bg-error/10 dark:bg-error/15 border border-error/20 rounded-[10px] text-error text-sm"
            >
              <UIcon name="i-lucide-alert-circle" class="size-4 shrink-0" />
              <span>{{ error }}</span>
              <UButton
                icon="i-lucide-x"
                variant="ghost"
                color="neutral"
                size="xs"
                class="ml-auto"
                @click="error = ''"
              />
            </div>

            <UForm :state="form" class="flex flex-col gap-4" @submit="handleSubmit">
              <!-- Name (signup only) -->
              <Transition name="slide">
                <UFormField v-if="mode === 'signup'" label="Name" name="name">
                  <UInput v-model="form.name" placeholder="Your name" required autocomplete="name" class="w-full" />
                </UFormField>
              </Transition>

              <UFormField label="Email" name="email">
                <UInput
                  v-model="form.email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autocomplete="email"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Password"
                name="password"
                :hint="mode === 'signup' ? 'Min. 8 characters' : undefined"
              >
                <UInput
                  v-model="form.password"
                  type="password"
                  placeholder="••••••••"
                  required
                  :autocomplete="mode === 'signin' ? 'current-password' : 'new-password'"
                  class="w-full"
                />
              </UFormField>

              <UButton
                type="submit"
                color="primary"
                block
                size="lg"
                :loading="loading"
                :label="mode === 'signin' ? 'Sign In' : 'Create Account'"
              />
            </UForm>

            <!-- Toggle mode text -->
            <p class="text-center text-[0.8125rem] text-dimmed">
              <template v-if="mode === 'signin'">
                Don't have an account?
                <UButton variant="link" label="Create one" size="xs" @click="toggleMode" />
              </template>
              <template v-else>
                Already have an account?
                <UButton variant="link" label="Sign in" size="xs" @click="toggleMode" />
              </template>
            </p>
          </div>
        </Transition>
      </template>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 600px;
  transform: translateY(0);
}
</style>
