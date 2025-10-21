<script setup>
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    ChartDataLabels
)

defineProps({
    chartData: {
        type: Object,
        required: true
    },
    chartOptions: {
        type: Object,
        default: () => ({})
    }
})
</script>

<template>
    <Bar :data="chartData" :options="chartOptions" />
</template>