<template><RosMap :points="pointInfo" /></template>
<script setup lang="ts">
import RosMap from './RosMap.vue'
import type { MapPoint } from '@/utils/rosMap'
withDefaults(defineProps<{ pointInfo?: MapPoint[] }>(), { pointInfo: () => [] })
</script>
