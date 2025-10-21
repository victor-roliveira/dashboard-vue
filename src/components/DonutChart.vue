<script setup>
import { Chart, Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels)

defineProps({
    chartData: {
        type: Object,
        required: true
    },
    chartOptions: {
        type: Object,
        default: () => ({
            responsive: true,
            maintainAspectRatio: false
        })
    }
})
</script>

<template>
    <Doughnut :data="chartData" :options="chartOptions" />
</template>