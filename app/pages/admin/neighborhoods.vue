<!-- eslint-disable atx/no-fetch-in-component -- SSR admin page data fetching -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -- TanStack table APIs -->
<!-- eslint-disable atx/no-raw-tailwind-colors -- Admin star indicator -->
<script setup lang="ts">
import { h, resolveComponent } from 'vue'

const UButton = resolveComponent('UButton')

definePageMeta({
  title: 'Neighborhoods Manager',
  middleware: 'auth',
})

const { isAdmin } = useAuth()

// ── Types ──
interface Neighborhood {
  id: number
  name: string
  slug: string
  lat: number
  lng: number
  city: string | null
  region: string | null
  zipCode: string | null
  description: string | null
  population: number | null
  featured: boolean | null
  tier: string | null
  parentRegion: string | null
  appleMapName: string | null
  boundaryGeojson: string | null
  createdAt: string
  updatedAt: string
}

// ── Data Fetching ──
const { data, refresh } = useFetch<{ neighborhoods: Neighborhood[] }>('/api/admin/neighborhoods')
const neighborhoods = computed(() => data.value?.neighborhoods ?? [])

// ── Filtering ──
const globalFilter = ref('')
const tierFilter = ref<string | undefined>(undefined)
const regionFilter = ref<string | undefined>(undefined)

const uniqueTiers = computed(() => {
  const tiers = new Set(neighborhoods.value.map((n) => n.tier).filter((t): t is string => !!t))
  return Array.from(tiers).sort()
})

const uniqueRegions = computed(() => {
  const regions = new Set(neighborhoods.value.map((n) => n.region).filter((r): r is string => !!r))
  return Array.from(regions).sort()
})

const filteredNeighborhoods = computed(() => {
  let result = [...neighborhoods.value]

  if (tierFilter.value) {
    result = result.filter((n) => n.tier === tierFilter.value)
  }
  if (regionFilter.value) {
    result = result.filter((n) => n.region === regionFilter.value)
  }
  if (globalFilter.value) {
    const search = globalFilter.value.toLowerCase()
    result = result.filter(
      (n) =>
        n.name.toLowerCase().includes(search) ||
        n.slug.toLowerCase().includes(search) ||
        n.city?.toLowerCase().includes(search) ||
        n.region?.toLowerCase().includes(search) ||
        n.appleMapName?.toLowerCase().includes(search),
    )
  }

  return result
})

const hasActiveFilters = computed(() => {
  return globalFilter.value || tierFilter.value || regionFilter.value
})

function clearFilters() {
  globalFilter.value = ''
  tierFilter.value = undefined
  regionFilter.value = undefined
}

// ── Sorting ──
const sorting = ref([{ id: 'region', desc: false }])

// ── Stats ──
const stats = computed(() => {
  const all = neighborhoods.value
  const withShape = all.filter((n) => !!n.boundaryGeojson)
  const byTier = {
    region: all.filter((n) => n.tier === 'region').length,
    neighborhood: all.filter((n) => n.tier === 'neighborhood').length,
    micro: all.filter((n) => n.tier === 'micro').length,
    district: all.filter((n) => n.tier === 'district').length,
  }
  return {
    total: all.length,
    withShape: withShape.length,
    withoutShape: all.length - withShape.length,
    byTier,
  }
})

// ── Edit Modal ──
const showEditModal = ref(false)
const editingHood = ref<Partial<Neighborhood> | null>(null)
const saving = ref(false)

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function openEdit(hood?: Neighborhood) {
  editingHood.value = hood
    ? { ...hood }
    : {
        name: '',
        slug: '',
        lat: 30.2672,
        lng: -97.7431,
        city: 'Austin',
        region: '',
        tier: 'neighborhood',
        parentRegion: null,
        appleMapName: null,
        description: null,
        population: null,
        featured: false,
        zipCode: null,
        boundaryGeojson: null,
      }
  showEditModal.value = true
}

// Auto-generate slug from name for new entries
watch(
  () => editingHood.value?.name,
  (newName) => {
    if (newName && editingHood.value && !editingHood.value.id) {
      editingHood.value.slug = slugify(newName)
    }
  },
)

async function saveNeighborhood() {
  if (!editingHood.value) return
  saving.value = true
  try {
    await $fetch('/api/admin/neighborhoods/save', {
      method: 'POST',
      body: editingHood.value,
    })
    showEditModal.value = false
    await refresh()
  } catch (err) {
    console.error('Save failed:', err)
  } finally {
    saving.value = false
  }
}

// ── Delete ──
const deleting = ref<number | null>(null)

async function deleteNeighborhood(hood: Neighborhood) {
  if (!confirm(`Delete "${hood.name}"? This cannot be undone.`)) return
  deleting.value = hood.id
  try {
    await $fetch('/api/admin/neighborhoods/delete', {
      method: 'POST',
      body: { id: hood.id },
    })
    await refresh()
  } catch (err) {
    console.error('Delete failed:', err)
  } finally {
    deleting.value = null
  }
}

// ── Shape Generation ──
const generatingShapes = ref(false)
const shapeResult = ref<{
  matched: number
  stored: number
  unmatched: Array<{ name: string; pointCount: number }>
} | null>(null)

async function generateShapes(dryRun: boolean) {
  generatingShapes.value = true
  shapeResult.value = null
  try {
    const result = await $fetch<{
      matched: number
      stored: number
      unmatched: Array<{ name: string; pointCount: number }>
    }>('/api/admin/neighborhood-grid/generate-shapes', {
      method: 'POST',
      body: { minPoints: 10, dryRun },
    })
    shapeResult.value = result
    if (!dryRun) await refresh()
  } catch (err) {
    console.error('Shape generation failed:', err)
  } finally {
    generatingShapes.value = false
  }
}

// ── Table Columns ──
const tierColors: Record<string, string> = {
  region: 'info',
  neighborhood: 'success',
  micro: 'warning',
  district: 'primary',
}

const columns = [
  {
    accessorKey: 'name',
    header: ({ column }: any) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'md',
        class: 'text-sm font-bold',
        label: 'Name',
        icon: column.getIsSorted()
          ? column.getIsSorted() === 'asc'
            ? 'i-lucide-arrow-up'
            : 'i-lucide-arrow-down'
          : 'i-lucide-arrow-up-down',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }),
    class: 'w-[250px]',
  },
  {
    accessorKey: 'tier',
    header: ({ column }: any) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'md',
        class: 'text-sm font-bold',
        label: 'Tier',
        icon: column.getIsSorted()
          ? column.getIsSorted() === 'asc'
            ? 'i-lucide-arrow-up'
            : 'i-lucide-arrow-down'
          : 'i-lucide-arrow-up-down',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }),
    class: 'w-[120px]',
  },
  {
    accessorKey: 'region',
    header: ({ column }: any) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'md',
        class: 'text-sm font-bold',
        label: 'Region',
        icon: column.getIsSorted()
          ? column.getIsSorted() === 'asc'
            ? 'i-lucide-arrow-up'
            : 'i-lucide-arrow-down'
          : 'i-lucide-arrow-up-down',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }),
  },
  {
    accessorKey: 'city',
    header: ({ column }: any) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'md',
        class: 'text-sm font-bold',
        label: 'City',
        icon: column.getIsSorted()
          ? column.getIsSorted() === 'asc'
            ? 'i-lucide-arrow-up'
            : 'i-lucide-arrow-down'
          : 'i-lucide-arrow-up-down',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }),
    class: 'w-[120px]',
  },
  {
    accessorKey: 'shape',
    header: 'Shape',
    class: 'w-[80px]',
  },
  {
    accessorKey: 'actions',
    header: '',
    class: 'w-[100px]',
  },
]
</script>

<template>
  <div class="max-w-7xl mx-auto py-8 px-4 flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <UIcon name="i-lucide-map" class="size-8 text-primary" />
        </div>
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Neighborhoods</h1>
          <p class="text-base text-dimmed">Manage neighborhood boundaries, tiers, and metadata</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UButton color="neutral" variant="outline" size="sm" to="/admin/" icon="i-lucide-arrow-left"
          >Dashboard</UButton
        >
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div class="rounded-xl border border-default bg-elevated p-4">
        <p class="text-2xl font-bold">{{ stats.total }}</p>
        <p class="text-xs text-dimmed">Total</p>
      </div>
      <div class="rounded-xl border border-default bg-elevated p-4">
        <p class="text-2xl font-bold text-success">{{ stats.withShape }}</p>
        <p class="text-xs text-dimmed">With Shapes</p>
      </div>
      <div class="rounded-xl border border-default bg-elevated p-4">
        <p class="text-2xl font-bold text-warning">{{ stats.withoutShape }}</p>
        <p class="text-xs text-dimmed">No Shape</p>
      </div>
      <div class="rounded-xl border border-default bg-elevated p-4">
        <p class="text-2xl font-bold text-info">{{ stats.byTier.region }}</p>
        <p class="text-xs text-dimmed">Regions</p>
      </div>
      <div class="rounded-xl border border-default bg-elevated p-4">
        <p class="text-2xl font-bold">{{ stats.byTier.district }}</p>
        <p class="text-xs text-dimmed">Districts</p>
      </div>
    </div>

    <!-- Actions & Filters Bar -->
    <UCard>
      <div class="px-4 py-3 flex items-center gap-3 border-b border-default flex-wrap">
        <UInput
          v-model="globalFilter"
          icon="i-lucide-search"
          placeholder="Search neighborhoods..."
          size="md"
          class="max-w-[220px]"
        />
        <USelectMenu
          v-model="tierFilter"
          :items="uniqueTiers"
          placeholder="Tier"
          size="md"
          class="w-36"
          clearable
        />
        <USelectMenu
          v-model="regionFilter"
          :items="uniqueRegions"
          placeholder="Region"
          size="md"
          class="w-44"
          clearable
        />
        <UButton
          v-if="hasActiveFilters"
          color="neutral"
          variant="subtle"
          size="md"
          icon="i-lucide-filter-x"
          @click="clearFilters"
        />

        <div class="ml-auto flex items-center gap-2">
          <UButton
            color="neutral"
            variant="soft"
            size="md"
            icon="i-lucide-hexagon"
            label="Generate Shapes"
            :loading="generatingShapes"
            @click="generateShapes(false)"
          />
          <UButton
            v-if="isAdmin"
            color="primary"
            size="md"
            icon="i-lucide-plus"
            @click="openEdit()"
          >
            New
          </UButton>
        </div>
      </div>

      <!-- Shape Result Banner -->
      <div
        v-if="shapeResult"
        class="px-4 py-3 bg-success/5 border-b border-success/20 flex items-center justify-between"
      >
        <div class="text-sm">
          <span class="font-semibold text-success">{{ shapeResult.stored }} shapes stored</span>
          <span class="text-dimmed ml-2">{{ shapeResult.matched }} matched</span>
          <span v-if="shapeResult.unmatched.length" class="text-warning ml-2"
            >{{ shapeResult.unmatched.length }} unmatched</span
          >
        </div>
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-lucide-x"
          @click="shapeResult = null"
        />
      </div>

      <!-- Table -->
      <UTable v-model:sorting="sorting" :data="filteredNeighborhoods" :columns="columns">
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3 overflow-hidden max-w-[250px]">
            <UIcon
              v-if="(row.original as Neighborhood).featured"
              name="i-lucide-star"
              class="size-4 text-warning shrink-0"
            />
            <div class="truncate min-w-0">
              <div class="text-base font-bold truncate">
                {{ (row.original as Neighborhood).name }}
              </div>
              <div class="text-xs text-dimmed truncate font-mono">
                {{ (row.original as Neighborhood).slug }}
              </div>
            </div>
          </div>
        </template>

        <template #tier-cell="{ row }">
          <UBadge
            v-if="(row.original as Neighborhood).tier"
            :color="(tierColors[(row.original as Neighborhood).tier!] as any) || 'neutral'"
            variant="soft"
            size="sm"
            class="capitalize"
          >
            {{ (row.original as Neighborhood).tier }}
          </UBadge>
          <span v-else class="text-dimmed">—</span>
        </template>

        <template #region-cell="{ row }">
          <span class="text-sm">{{ (row.original as Neighborhood).region || '—' }}</span>
        </template>

        <template #city-cell="{ row }">
          <span class="text-sm">{{ (row.original as Neighborhood).city || '—' }}</span>
        </template>

        <template #shape-cell="{ row }">
          <UIcon
            v-if="(row.original as Neighborhood).boundaryGeojson"
            name="i-lucide-check-circle"
            class="size-5 text-success"
          />
          <UIcon v-else name="i-lucide-circle-dashed" class="size-5 text-muted" />
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-2 px-2">
            <UButton
              size="md"
              color="neutral"
              variant="ghost"
              icon="i-lucide-pencil"
              @click="openEdit(row.original as Neighborhood)"
            />
            <UButton
              size="md"
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              :loading="deleting === (row.original as Neighborhood).id"
              @click="deleteNeighborhood(row.original as Neighborhood)"
            />
          </div>
        </template>
      </UTable>

      <div class="px-4 py-3 text-sm font-medium text-dimmed border-t border-default">
        {{ filteredNeighborhoods.length }} of {{ neighborhoods.length }} neighborhoods
      </div>
    </UCard>

    <!-- Edit Modal -->
    <UModal v-model:open="showEditModal">
      <template #content>
        <div v-if="editingHood" class="p-8 flex flex-col gap-8 max-w-3xl w-full">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-bold">{{ editingHood.id ? 'Edit' : 'New' }} Neighborhood</h3>
            <UBadge
              v-if="editingHood.tier"
              :color="(tierColors[editingHood.tier] as any) || 'neutral'"
              variant="soft"
              class="capitalize"
            >
              {{ editingHood.tier }}
            </UBadge>
          </div>

          <div class="grid grid-cols-4 gap-6">
            <!-- Core Fields -->
            <UFormField label="Name" class="col-span-4 sm:col-span-2">
              <UInput
                v-model="editingHood.name!"
                size="lg"
                placeholder="e.g. Northwest Hills"
                class="w-full font-bold"
              />
            </UFormField>
            <UFormField label="Slug" class="col-span-4 sm:col-span-2">
              <UInput v-model="editingHood.slug!" size="lg" class="w-full font-mono" />
            </UFormField>

            <!-- Classification -->
            <UFormField label="Tier" class="col-span-4 sm:col-span-1">
              <USelect
                v-model="editingHood.tier!"
                size="lg"
                :items="['region', 'neighborhood', 'micro', 'district']"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Region" class="col-span-4 sm:col-span-1">
              <UInput
                v-model="editingHood.region!"
                size="lg"
                placeholder="e.g. Central"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Parent Region" class="col-span-4 sm:col-span-1">
              <UInput
                v-model="editingHood.parentRegion!"
                size="lg"
                placeholder="Optional"
                class="w-full"
              />
            </UFormField>
            <UFormField label="City" class="col-span-4 sm:col-span-1">
              <UInput v-model="editingHood.city!" size="lg" class="w-full" />
            </UFormField>

            <!-- Location -->
            <UFormField label="Latitude" class="col-span-4 sm:col-span-1">
              <UInput
                v-model.number="editingHood.lat!"
                size="lg"
                type="number"
                step="0.0001"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Longitude" class="col-span-4 sm:col-span-1">
              <UInput
                v-model.number="editingHood.lng!"
                size="lg"
                type="number"
                step="0.0001"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Zip Code" class="col-span-4 sm:col-span-1">
              <UInput v-model="editingHood.zipCode!" size="lg" class="w-full" />
            </UFormField>
            <UFormField label="Population" class="col-span-4 sm:col-span-1">
              <UInput
                v-model.number="editingHood.population!"
                size="lg"
                type="number"
                class="w-full"
              />
            </UFormField>

            <!-- Apple Maps Name -->
            <UFormField label="Apple Maps Name" class="col-span-4 sm:col-span-2">
              <UInput
                v-model="editingHood.appleMapName!"
                size="lg"
                placeholder="Exact Apple Maps name for crawl matching"
                class="w-full"
              />
            </UFormField>

            <!-- Flags -->
            <div class="col-span-4 sm:col-span-2 flex items-end gap-4 pb-2">
              <UCheckbox v-model="editingHood.featured!" label="Featured" size="lg" />
              <UBadge v-if="editingHood.boundaryGeojson" color="success" variant="soft" size="sm">
                <UIcon name="i-lucide-hexagon" class="size-3 mr-1" /> Has Shape
              </UBadge>
              <UBadge v-else color="neutral" variant="soft" size="sm"> No Shape </UBadge>
            </div>

            <!-- Description -->
            <UFormField label="Description" class="col-span-4">
              <UTextarea
                v-model="editingHood.description!"
                size="lg"
                :rows="4"
                placeholder="Neighborhood description..."
                class="w-full"
              />
            </UFormField>
          </div>

          <div class="flex justify-end gap-3 mt-4">
            <UButton color="neutral" variant="outline" size="lg" @click="showEditModal = false"
              >Cancel</UButton
            >
            <UButton color="primary" size="lg" :loading="saving" @click="saveNeighborhood">
              {{ editingHood.id ? 'Save Changes' : 'Create Neighborhood' }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
