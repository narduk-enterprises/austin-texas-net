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
 * PollenChart — Pollen trend chart supporting 7d to 60d ranges.
 */

const props = withDefaults(
  defineProps<{
    data: Array<{ date: string; count: number; level?: string; peak?: number }>
    embedded?: boolean
    loading?: boolean
  }>(),
  {
    embedded: false,
    loading: false,
  },
)

const emit = defineEmits<{
  (e: 'period-change', days: number): void
}>()

const colorMode = useColorMode()

const activePeriod = ref(30)
const periods = [
  { days: 7, label: '7d' },
  { days: 14, label: '14d' },
  { days: 30, label: '30d' },
  { days: 60, label: '60d' },
]

function switchPeriod(days: number) {
  activePeriod.value = days
  emit('period-change', days)
}

function getSeverityColor(count: number): string {
  return severityFromCount(count).color
}

const isDark = computed(() => colorMode.value === 'dark')

const chartData = computed(() => {
  const dataSlice = props.data

  const labels = dataSlice.map((d) => {
    const parts = d.date.split('-')
    return `${parts[1]}/${parts[2]}`
  })

  const values = dataSlice.map((d) => d.count)
  const pointColors = values.map((v) => getSeverityColor(v))

  return {
    labels,
    datasets: [
      {
        label: 'Pollen Count',
        data: values,
        borderColor: POLLEN_ACCENT,
        borderWidth: 2,
        pointRadius: dataSlice.length > 45 ? 0 : dataSlice.length > 20 ? 2 : 4,
        pointHoverRadius: 6,
        pointBackgroundColor: pointColors,
        pointBorderColor: 'transparent',
        fill: true,
        backgroundColor: (ctx: ScriptableContext<'line'>) => {
          const chart = ctx.chart
          const { ctx: canvasCtx, chartArea } = chart
          if (!chartArea) return 'rgba(16,185,129,0.1)'
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, 'rgba(16,185,129,0.25)')
          gradient.addColorStop(0.5, 'rgba(16,185,129,0.08)')
          gradient.addColorStop(1, 'rgba(16,185,129,0)')
          return gradient
        },
        tension: 0.3,
      },
    ],
  }
})

const chartOptions = computed(() => {
  const dark = isDark.value
  const maxVal = Math.max(...props.data.map((d) => d.count), 1000)
  const yMax = Math.ceil(maxVal / 1000) * 1000 + 1000

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
            let level = 'Low'
            if (val >= 5000) level = 'Severe'
            else if (val >= 1500) level = 'Very High'
            else if (val >= 500) level = 'High'
            else if (val >= 50) level = 'Medium'
            return `${val.toLocaleString()} grains/m³ — ${level}`
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
          maxTicksLimit: activePeriod.value > 30 ? 12 : 10,
        },
        border: { display: false },
      },
      y: {
        min: 0,
        max: yMax,
        grid: {
          color: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)',
        },
        ticks: {
          color: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
          font: { size: 10 },
          stepSize: yMax > 5000 ? 2000 : 1000,
          callback: (value: string | number) => {
            if (typeof value === 'number' && value >= 1000) return `${value / 1000}k`
            return String(value)
          },
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
        Pollen Trend
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
    <div v-if="loading" class="h-[280px] flex flex-col items-center justify-center gap-3">
      <div
        class="size-8 border-[3px] border-primary/15 border-t-primary rounded-full animate-spin"
      />
      <p class="text-[0.8rem] text-muted">Loading pollen data...</p>
    </div>

    <div v-else :class="embedded ? 'h-[220px]' : 'h-[280px]'">
      <Line v-if="data.length > 0" :data="chartData" :options="chartOptions as any" />
      <div v-else class="h-full flex items-center justify-center text-muted text-[0.85rem]">
        <p>No pollen data available for this period</p>
      </div>
    </div>


  </div>
</template>
