<script setup>
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '@/stores/dataStore';

import DonutChart from '@/components/DonutChart.vue';
import StackedBarChart from '@/components/StackedBarChart.vue';
import BarChart from '@/components/BarChart.vue';
import SituationsActvitiesTable from '@/components/SituationsActvitiesTable.vue';
import AllocationTodayTable from '@/components/AllocationTodayTable.vue';

// ...toda a sua lógica de 'computed', 'onMounted', etc., continua aqui...
// ...NENHUMA MUDANÇA NECESSÁRIA NO SCRIPT...
const dataStore = useDataStore()

const {
    loading,
    error,
    mainSheetData,
    disciplineSheetsData,
    sheetId,
    gidMap,
    colaboradoresData
} = storeToRefs(dataStore)

onMounted(() => {
    dataStore.fetchData()
});

const donutChartData = computed(() => {
    if (!mainSheetData.value || mainSheetData.value.length < 3) {
        return null;
    }

    const headers = mainSheetData.value[1];
    const totalsRow = mainSheetData.value[2];

    const idxMarica = headers.indexOf('Marica');
    const idxMacae = headers.indexOf('Macae');
    const idxDiversos = headers.indexOf('Diversos');

    if (idxMarica === -1 || idxMacae === -1 || idxDiversos === -1) {
        console.error("Não foi possível encontrar as colunas de totais. Verifique os nomes no Google Sheets.");
        return null;
    }

    const cleanPercent = (val) => {
        if (typeof val !== 'string') return 0;

        return parseFloat(val.replace('%', '').replace(',', '.')) || 0;
    };

    const data = [
        cleanPercent(totalsRow[idxMarica]),
        cleanPercent(totalsRow[idxMacae]),
        cleanPercent(totalsRow[idxDiversos])
    ];

    return {
        labels: ['Maricá', 'Macaé', 'Diversos'],
        datasets: [
            {
                label: 'Alocação',
                backgroundColor: ['#ff3c3c', '#2a95ff', '#a7a7a7'],
                data: data
            }
        ]
    };
});

const donutChartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                color: '#000',
                font: {
                    family: 'DM Sans, sans-serif',
                    size: 14,
                },
            },
        },
        title: {
            display: true,
            text: 'Alocações',
            color: '#000',
            font: {
                family: 'DM Sans',
                size: 18
            }
        },
        tooltip: {
            callbacks: {
                label: function (context) {
                    let label = context.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed !== null) {
                        label += context.parsed.toFixed(2).replace('.', ',') + '%';
                    }
                    return label;
                }
            }
        },
        datalabels: {
            display: true,
            color: '#fff',
            textAlign: 'center',
            font: {
                family: 'DM Sans',
                weight: 'bold',
                size: 14,
            },

            formatter: (value, context) => {
                if (value < 5) {
                    return '';
                }

                return value.toFixed(2).replace('.', ',') + '%';
            }
        }
    }
});

const stackedBarChartData = computed(() => {
    const data = disciplineSheetsData.value;
    if (!data || Object.keys(data).length === 0) {
        return null;
    }

    const situacoes = {
        'Problema': { color: '#f80224', data: [] },
        'Pior que o esperado': { color: '#f0ad4e', data: [] },
        'Dentro do Esperado': { color: '#5bc0de', data: [] },
        'Melhor que o esperado': { color: '#02b875', data: [] }
    };

    const labels = Object.keys(data);

    labels.forEach(disciplina => {
        const sheet = data[disciplina];
        if (!sheet || sheet.length < 2) return;

        const headers = sheet[0];

        const idxAval4 = headers.indexOf('Avaliação 4ª');
        const idxAval6 = headers.indexOf('Avaliação 6ª');

        const counts = {
            'Problema': 0,
            'Pior que o esperado': 0,
            'Dentro do Esperado': 0,
            'Melhor que o esperado': 0
        };

        sheet.slice(1).forEach(row => {
            const val4 = row[idxAval4] ? row[idxAval4].trim() : '';
            const val6 = row[idxAval6] ? row[idxAval6].trim() : '';

            if (counts.hasOwnProperty(val4)) {
                counts[val4]++;
            }
            if (counts.hasOwnProperty(val6)) {
                counts[val6]++;
            }
        });

        situacoes['Problema'].data.push(counts['Problema']);
        situacoes['Pior que o esperado'].data.push(counts['Pior que o esperado']);
        situacoes['Dentro do Esperado'].data.push(counts['Dentro do Esperado']);
        situacoes['Melhor que o esperado'].data.push(counts['Melhor que o esperado']);
    });

    const datasets = Object.keys(situacoes).map(key => {
        return {
            label: key,
            backgroundColor: situacoes[key].color,
            data: situacoes[key].data,
        };
    });

    return {
        labels: labels.map(name => {
            const parts = name.split(' ');
            return parts.length > 1 ? parts.pop() : name;
        }),
        datasets: datasets
    };
});

const stackedBarChartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        title: {
            display: true,
            text: 'Situação por Disciplina',
            color: '#000',
            font: {
                family: 'DM Sans',
                size: 18,
                weight: 'bold',
            },
        },
        legend: {
            position: 'top',
            labels: {
                color: '#000',
                font: {
                    family: 'DM Sans',
                    size: 14,
                },
            },
        },
        datalabels: {
            display: true,
            color: '#fff',
            font: {
                family: 'DM Sans',
                weight: 'bold',
                size: 13,
            },
            formatter: (value) => {
                return value > 0 ? value : null;
            },
        },
    },
    scales: {
        x: {
            stacked: true,
            ticks: {
                color: '#000',
                font: {
                    family: 'DM Sans',
                    size: 12,
                },
            },
            grid: {
                color: '#a7a7a7',
            },
        },
        y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
                color: '#000',
                font: {
                    family: 'DM Sans',
                    size: 12,
                },
                precision: 0,
            },
        },
    },
});

const delayedTasksChartData = computed(() => {
    const data = disciplineSheetsData.value;
    if (!data || Object.keys(data).length === 0) return null;

    const colors = {
        'EST': '#5300a1',
        'HID': '#0076d8',
        'ELE': '#fdb300',
        'PCI/AVAC': '#c5c5c5',
        'TER': '#702121',
        'ORÇ': '#1ab800',
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parseDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return null;
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;
        return new Date(parts[2], parts[1] - 1, parts[0]);
    };

    const fullLabels = Object.keys(data);
    const counts = [];

    const siglaLabels = fullLabels.map(name => {
        const parts = name.split(' ');
        let sigla = parts.length > 1 ? parts.pop() : name;
        return sigla.replace(/'$/, '');
    });

    fullLabels.forEach(disciplinaFullName => {
        const sheet = data[disciplinaFullName];
        if (!sheet || sheet.length < 2) {
            counts.push(0);
            return;
        }

        const headers = sheet[0];
        const colIndex = headers.indexOf('🤖 Data de Entrega Contratual');

        if (colIndex === -1) {
            console.warn(`Coluna '🤖 Data de Entrega Contratual' não encontrada em ${disciplinaFullName}`);
            counts.push(0);
            return;
        }

        let atrasosCount = 0;
        sheet.slice(1).forEach(row => {
            const dateStr = row[colIndex];
            const taskDate = parseDate(dateStr);

            if (taskDate && taskDate < today) {
                atrasosCount++;
            }
        });
        counts.push(atrasosCount);
    });

    const datasets = siglaLabels.map((label, index) => {
        const dataForThisLabel = new Array(siglaLabels.length).fill(0);
        dataForThisLabel[index] = counts[index];

        return {
            label: label,
            data: dataForThisLabel,
            backgroundColor: colors[label] || '#999999',
        };
    });

    return {
        labels: siglaLabels,
        datasets: datasets
    };
});

const delayedTasksChartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    color: '#FFFFFF',

    plugins: {
        title: {
            display: true,
            text: 'Atividades com Atraso',
            font: { family: 'DM Sans', size: 18 },
            color: '#000'
        },
        legend: {
            position: 'top',
            labels: {
                font: {
                    family: 'DM Sans',
                },
                color: '#black'
            }
        },
        datalabels: {
            display: true,
            color: 'white',
            anchor: 'end',
            align: 'top',
            offset: -5,
            font: {
                family: 'DM Sans',
                weight: 'bold'
            },
            color: '#000',
            formatter: (value) => {
                return value > 0 ? value : null;
            }
        }
    },
    scales: {
        x: {
            stacked: false,
            ticks: {
                color: '#000',
                font: {
                    family: 'DM Sans',
                    size: 14,
                    weight: '500'
                }
            }
        },
        y: {
            stacked: false,
            beginAtZero: true,
            title: {
                display: true,
                text: 'Atividades Atrasadas',
                color: '#000',
                font: {
                    family: 'DM Sans',
                    size: 14,
                    weight: '600'
                }
            },
            ticks: {
                precision: 0,
                color: '#000',
                font: {
                    family: 'DM Sans',
                    size: 13,
                    weight: '500'
                }
            }
        }
    }
});
</script>

<template>
    <v-container fluid>

        <v-overlay :model-value="loading" persistent class="d-flex flex-column justify-center align-center">
            <h1 class="text-h4 font-weight-bold mb-6" style="color: white;">
                Controle Engenharia
            </h1>
            <v-progress-circular indeterminate color="orange" size="64"></v-progress-circular>
            <p class="text-h6 mt-4" style="color: white;">Carregando dados...</p>
        </v-overlay>

        <div v-if="!loading">

            <v-row v-if="error" align="center" justify="center">
                <v-col cols="12" md="10">
                    <v-alert type="error" variant="tonal" border="start" prominent class="my-4">
                        {{ error }}
                    </v-alert>
                </v-col>
            </v-row>

            <div v-else>
                <h1 class="text-h4 font-weight-bold text-center my-">
                    Controle Engenharia
                </h1>

                <v-row class="mb-4">
                    <v-col v-if="donutChartData" cols="12" md="6" lg="4">
                        <v-card class="chart-card pa-4" flat>
                            <DonutChart :chartData="donutChartData" :chartOptions="donutChartOptions" />
                        </v-card>
                    </v-col>
                    <v-col v-if="stackedBarChartData" cols="12" md="6" lg="4">
                        <v-card class="chart-card pa-4" flat>
                            <StackedBarChart :chartData="stackedBarChartData" :chartOptions="stackedBarChartOptions" />
                        </v-card>
                    </v-col>
                    <v-col v-if="delayedTasksChartData" cols="12" md="6" lg="4">
                        <v-card class="chart-card pa-4" flat>
                            <BarChart :chartData="delayedTasksChartData" :chartOptions="delayedTasksChartOptions" />
                        </v-card>
                    </v-col> </v-row>

                <v-row>
                    <v-col v-if="sheetId && gidMap" cols="12">
                        <v-card flat>
                            <SituationsActvitiesTable :sheet-id="sheetId" :gid-map="gidMap"
                                :discipline-data="disciplineSheetsData" />
                        </v-card>
                    </v-col>
                    <v-col v-if="colaboradoresData" cols="12">
                        <v-card flat>
                            <AllocationTodayTable :colaboradores-data="colaboradoresData" />
                        </v-card>
                    </v-col>
                </v-row>
            </div>
        </div>

    </v-container>
</template>

<style scoped>
h1 {
    font-family: 'DM Sans';
}

p {
    font-family: 'DM Sans';
}

.chart-card {
    height: 400px;
}
</style>