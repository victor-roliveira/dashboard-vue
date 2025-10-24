<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    colaboradoresData: { type: Array, required: true }
})

function getSheetHeaderFormat(date) {
    const day = date.getDate().toString().padStart(2, '0')

    const weekdayLong = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date)

    const weekdayShort = weekdayLong.split('-')[0]
    const weekdayCapitalized = weekdayShort.charAt(0).toUpperCase() + weekdayShort.slice(1)

    return `${day}/${weekdayCapitalized}`
}

const today = new Date()
const tomorrow = new Date()
tomorrow.setDate(today.getDate() + 1)

const todayHeader = getSheetHeaderFormat(today)
const tomorrowHeader = getSheetHeaderFormat(tomorrow)

const processedData = computed(() => {
    if (!props.colaboradoresData || props.colaboradoresData.length < 2) {
        return { headers: null, rows: [] }
    }

    const headers = props.colaboradoresData[0]
    const dataRows = props.colaboradoresData.slice(1)

    const idxColab = headers.indexOf('Colaborador')
    const idxToday = headers.indexOf(todayHeader)
    const idxTomorrow = headers.indexOf(tomorrowHeader)

    if (idxColab === - 1 || idxToday === -1) {
        console.error(`Não foi possível encontrar as colunas Colaborador ou Dia Atual (${todayHeader}) na planilha`)
        return { headers: null, rows: [] }
    }

    const tableHeaders = {
        colab: 'Colaborador',
        today: todayHeader,
        tomorrow: idxTomorrow > - 1 ? tomorrowHeader : 'N/A'
    }

    const tableRows = dataRows.map(row => {
        const colaborador = row[idxColab]
        if (!colaborador) return null

        return {
            colaborador: colaborador,
            hoje: row[idxToday] || '---',
            amanha: idxTomorrow > - 1 ? (row[idxTomorrow] || '---') : 'N/A'
        }
    }).filter(Boolean)

    return { headers: tableHeaders, rows: tableRows }
})

function getCellStyle(text) {
    if (text === 'HomeOffice') return { backgroundColor: '#d9d2e9', color: '#333' };
    if (text === 'Maricá') return { backgroundColor: '#ff8282', color: '#000' };
    if (text === 'Macaé') return { backgroundColor: '#6698ff', color: '#000' };
    return {};
}
</script>

<template>
    <div class="allocation-table-container">
        <h2>Controle dos Colaboradores</h2>

        <div class="table-wrapper" v-if="processedData.headers">
            <table>
                <thead>
                    <tr>
                        <th>{{ processedData.headers.colab }}</th>
                        <th>{{ processedData.headers.today }} (Atual)</th>
                        <th>{{ processedData.headers.tomorrow }} (Amanhã)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in processedData.rows" :key="row.colaborador">
                        <td>{{ row.colaborador }}</td>
                        <td :style="getCellStyle(row.hoje)">{{ row.hoje }}</td>
                        <td :style="getCellStyle(row.amanha)">{{ row.amanha }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else>
            Não foi possível carregar os dados de alocação. Verifique se as colunas de data (ex: "22/Quarta") existem na
            planilha.
        </div>

    </div>
</template>
<style scoped>
h2 {
    color: black;
    font-weight: bold;
}

.table-wrapper {
    width: 98%;
    overflow-x: auto;
    max-height: 450px;
    overflow-y: auto;
    margin-bottom: 50px;
}

table {
    width: 100%;
    height: 400px;
    table-layout: fixed;
    border-collapse: collapse;
}


td {
    border: 2px solid #e1e1e1;
    padding: 2px 3px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: black;
}

th {
    background-color: orange;
    padding: 10px;
    color: white;
    font-weight: 600;
    position: relative;
    position: sticky;
    top: 0;
    z-index: 1;
    text-align: center;
}
</style>