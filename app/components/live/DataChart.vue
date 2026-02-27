<script setup lang="ts">
import { Line } from 'vue-chartjs'
import type { ScriptableContext, TooltipItem } from 'chart.js'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

/**
 * LiveDataChart — Reusable trend chart for water temps and lake levels.
 * Supports configurable label, unit, accent color, and period selector.
 */

const props = withDefaults(
  defineProps<{
    data: Array<{ timestamp: string; value: number }>
    title?: string
    unit?: string
    accentColor?: string // CSS color
    loading?: boolean
    embedded?: boolean
  }>(),
  {
    title: 'Trend',
    unit: '',
    accentColor: '#06b6d4', // eslint-disable-line atx/no-inline-hex -- Chart.js default
    loading: false,
    embedded: false,
  },
)

const emit = defineEmits<{
  (e: 'period-change', days: number): void
}>()

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const activePeriod = ref(30)
const periods = [
  { days: 7, label: '7d' },
  { days: 14, label: '14d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
]

function switchPeriod(days: number) {
  activePeriod.value = days
  emit('period-change', days)
}

const chartData = computed(() => {
  const dataSlice =
    activePeriod.value <= 30
      ? props.data.slice(-activePeriod.value * 24) // hourly readings
      : props.data

  const labels = dataSlice.map((d) => {
    const date = new Date(d.timestamp)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })

  const values = dataSlice.map((d) => d.value)
  const accent = props.accentColor

  return {
    labels,
    datasets: [
      {
        label: props.title,
        data: values,
        borderColor: accent,
        borderWidth: 2,
        pointRadius: dataSlice.length > 60 ? 0 : dataSlice.length > 30 ? 2 : 3,
        pointHoverRadius: 5,
        pointBackgroundColor: accent,
        pointBorderColor: 'transparent',
        fill: true,
        backgroundColor: (ctx: ScriptableContext<'line'>) => {
          const chart = ctx.chart
          const { ctx: canvasCtx, chartArea } = chart
          if (!chartArea) return `${accent}15`
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, `${accent}40`)
          gradient.addColorStop(0.5, `${accent}15`)
          gradient.addColorStop(1, `${accent}00`)
          return gradient
        },
        tension: 0.3,
      },
    ],
  }
})

const chartOptions = computed(() => {
  const dark = isDark.value
  const values = props.data.map((d) => d.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const range = maxVal - minVal || 1
  const yMin = Math.floor(minVal - range * 0.1)
  const yMax = Math.ceil(maxVal + range * 0.1)

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: dark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
        titleColor: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
        bodyColor: dark ? 'rgba(255,255,255,1)' : 'rgba(26,26,46,1)',
        borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
        titleFont: { size: 11, weight: '400' as const },
        bodyFont: { size: 13, weight: '600' as const },
        callbacks: {
          label: (ctx: TooltipItem<'line'>) => {
            const val = ctx.raw as number
            return `${val.toLocaleString()} ${props.unit}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)',
        },
        ticks: {
          color: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
          font: { size: 10 },
          maxRotation: 0,
          maxTicksLimit: activePeriod.value > 90 ? 8 : 10,
        },
        border: { display: false },
      },
      y: {
        min: yMin,
        max: yMax,
        grid: {
          color: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)',
        },
        ticks: {
          color: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
          font: { size: 10 },
          callback: (value: string | number) => `${value}${props.unit ? ` ${props.unit}` : ''}`,
        },
        border: { display: false },
      },
    },
  }
})
</script>

<template>
  <div
    :class="
      embedded
        ? 'bg-transparent border-0 rounded-none p-0'
        : 'bg-elevated border border-default rounded-2xl p-5'
    "
  >
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-[0.85rem] font-semibold text-muted uppercase tracking-[0.06em]">
        {{ title }}
      </h3>
      <div class="flex gap-0.5 bg-muted rounded-lg p-[3px]">
        <UButton
          v-for="p in periods"
          :key="p.days"
          size="xs"
          :variant="activePeriod === p.days ? 'solid' : 'ghost'"
          :color="activePeriod === p.days ? 'primary' : 'neutral'"
          :label="p.label"
          @click="switchPeriod(p.days)"
        />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="h-[240px] flex flex-col items-center justify-center gap-3">
      <div
        class="size-8 border-[3px] border-primary/15 border-t-primary rounded-full animate-spin"
      />
      <p class="text-[0.8rem] text-muted">Loading data…</p>
    </div>

    <div v-else :class="embedded ? 'h-[200px]' : 'h-[240px]'">
      <Line v-if="data.length > 0" :data="chartData" :options="chartOptions as any" />
      <div v-else class="h-full flex items-center justify-center text-muted text-[0.85rem]">
        <p>No data available yet — check back after the first ingestion run</p>
      </div>
    </div>
  </div>
</template>
