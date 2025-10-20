<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import DonutChart from '@/components/DonutChart.vue';

// Estados reativos
const sheetData = ref([]); // Onde os dados da planilha ficarão
const loading = ref(true);
const error = ref(null);

const donutChartData = computed(() => {
    // Retorna nulo se os dados ainda não estiverem prontos
    // (Assumimos que [0] é cabeçalho e [1] é a linha de totais)
    if (!sheetData.value || sheetData.value.length < 2) {
        return null;
    }

    // Pega as linhas de cabeçalho e de totais
    const headers = sheetData.value[0];
    const totalsRow = sheetData.value[1]; // <-- ASSUMINDO que esta é sua linha de "valores gerais"

    // IMPORTANTE: Use os nomes EXATOS das suas novas colunas
    const idxMarica = headers.indexOf('Total Marica');
    const idxMacae = headers.indexOf('Total Macae');
    const idxDiversos = headers.indexOf('Total Diversos');

    // Se não encontrar as colunas, loga um erro
    if (idxMarica === -1 || idxMacae === -1 || idxDiversos === -1) {
        console.error("Não foi possível encontrar as colunas de totais. Verifique os nomes no Google Sheets.");
        return null;
    }

    // Função para limpar os dados (ex: "70,31%" => 70.31)
    const cleanPercent = (val) => {
        if (typeof val !== 'string') return 0;
        // 1. Remove o '%'
        // 2. Troca a vírgula (decimal brasileiro) por ponto (decimal JS)
        // 3. Converte para número
        return parseFloat(val.replace('%', '').replace(',', '.')) || 0;
    };

    const data = [
        cleanPercent(totalsRow[idxMarica]),
        cleanPercent(totalsRow[idxMacae]),
        cleanPercent(totalsRow[idxDiversos])
    ];

    // Este é o formato de objeto que o Chart.js espera
    return {
        labels: ['Total Maricá', 'Total Macaé', 'Total Diversos'],
        datasets: [
            {
                label: 'Alocação',
                backgroundColor: ['#41B883', '#E46651', '#00D8FF'], // Cores de exemplo
                data: data
            }
        ]
    };
});

// 3. Crie as opções para o gráfico (título, legenda, etc.)
const donutChartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top', // Posição da legenda
        },
        title: {
            display: true,
            text: 'Alocações', // Título do gráfico
            font: {
                size: 18
            }
        },
        tooltip: {
            callbacks: {
                // Formata a dica (tooltip) para mostrar o %
                label: function (context) {
                    let label = context.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed !== null) {
                        // Adiciona o símbolo de '%' no final
                        label += context.parsed.toFixed(2).replace('.', ',') + '%';
                    }
                    return label;
                }
            }
        }
    }
});

async function fetchData() {
    loading.value = true;
    error.value = null;

    try {
        console.log("1. Tentando buscar dados em /api/getSheetData...");
        const response = await axios.get('/api/getSheetData');

        sheetData.value = response.data.data;
    } catch (err) {
        if (err.response) {
            console.error("Dados do erro vindos do backend:", err.response.data);
        }

        error.value = 'Não foi possível carregar os dados.';

    } finally {
        loading.value = false;
    }
}
// Chama a função quando o componente é "montado" (carregado)
onMounted(() => {
    fetchData();
});
</script>

<template>
    <div class="dashboard">
        <h1>Meu Dashboard</h1>

        <div class="chart-container" v-if="donutChartData">
            <DonutChart :chartData="donutChartData" :chartOptions="donutChartOptions" />
        </div>

        <div v-if="loading" class="loading">
            Carregando dados...
        </div>

        <div v-else-if="error" class="error">
            {{ error }}
        </div>

        <div v-else-if="sheetData && sheetData.length > 0" class="table-container">
            <h2>Dados da Planilha</h2>
            <table>
                <thead>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>

        <div v-else>
            Nenhum dado encontrado.
        </div>
    </div>
</template>

<style scoped>
/* 5. ADICIONE ESTILOS PARA O GRÁFICO E A TABELA */

.chart-container {
    /* Define um tamanho para o container do gráfico */
    width: 100%;
    max-width: 450px;
    /* Um donut fica melhor com um max-width */
    height: 450px;
    margin: 20px auto;
    /* Centraliza o gráfico na tela */
    padding: 10px;
    border: 1px solid #444;
    border-radius: 8px;
}

.table-container {
    /* Faz a tabela rolar horizontalmente se for muito grande */
    width: 100%;
    overflow-x: auto;
    margin-top: 30px;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    border: 1px solid #ddd;
    padding: 8px;
    /* (Seu tema escuro precisa de cor no texto) */
    color: #eee;
}

th {
    background-color: #f4f4f4;
    /* (Cor do texto do cabeçalho) */
    color: #222;
}

.loading,
.error {
    color: red;
    font-weight: bold;
}
</style>