<!-- 
  OG Image Template — Austin Texas (Takumi Renderer)
  Uses Inter for all text and provides a warm, limestone-inspired aesthetic.
-->
<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  icon?: string
  siteName?: string
  fontFamily?: string
}>(), {
  title: 'Austin Texas',
  description: 'Your Guide to the Live Music Capital',
  icon: 'i-lucide-map-pin',
  siteName: 'austin-texas.net',
  fontFamily: 'Inter',
})
</script>

<template>
  <!-- eslint-disable atx/no-inline-hex -->
  <div
    tw="w-full h-full flex flex-col relative overflow-hidden"
    :style="{
      padding: '80px',
      background: 'linear-gradient(135deg, #e8f0f6 0%, #f4eee2 40%, #e8dbcd 100%)',
      fontFamily: 'Inter, sans-serif',
    }"
  >
    <!-- Accent gradient blob top left -->
    <div
      tw="absolute rounded-full"
      :style="{
        top: '-150px',
        left: '-150px',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
      }"
    />

    <!-- Accent gradient blob bottom right -->
    <div
      tw="absolute rounded-full"
      :style="{
        bottom: '-200px',
        right: '-200px',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(217, 119, 6, 0.06) 0%, transparent 70%)',
      }"
    />

    <!-- Top decorative bar -->
    <div
      tw="absolute top-0 left-0 right-0"
      :style="{
        height: '8px',
        background: 'linear-gradient(90deg, #10b981, #d97706, #0e7490)',
      }"
    />

    <div tw="flex flex-col flex-1 justify-center z-10 w-full mb-12">
      <!-- Title -->
      <div
        tw="font-bold flex"
        :style="{
          fontSize: '72px',
          color: '#1a2744',
          lineHeight: '1.15',
          fontFamily: 'Inter, sans-serif',
          fontWeight: '700',
          letterSpacing: '-0.02em',
          maxWidth: '1000px',
          marginBottom: '24px',
        }"
      >
        {{ title }}
      </div>

      <!-- Description -->
      <div
        v-if="description"
        tw="flex"
        :style="{
          fontSize: '32px',
          fontWeight: '400',
          color: '#4e5a70',
          lineHeight: '1.4',
          maxWidth: '900px',
          fontFamily: 'Inter, sans-serif',
        }"
      >
        {{ description }}
      </div>
    </div>

    <!-- Bottom: divider + site name -->
    <div
      tw="flex flex-col absolute z-10 w-full"
      :style="{
        bottom: '60px',
        left: '80px',
        right: '80px',
        width: 'calc(100% - 160px)',
        gap: '20px',
      }"
    >
      <div :style="{ width: '100%', height: '2px', backgroundColor: '#d4c9b8' }" />
      
      <div tw="flex flex-row justify-between items-center w-full">
        <span
          :style="{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1a2744',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '-0.01em',
          }"
        >{{ siteName }}</span>

        <!-- Badge -->
        <div
          tw="flex flex-row items-center justify-center rounded-xl"
          :style="{
            padding: '8px 16px',
            backgroundColor: '#1a2744',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '600',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }"
        >
          Live Local Intelligence
        </div>
      </div>
    </div>
  </div>
</template>
