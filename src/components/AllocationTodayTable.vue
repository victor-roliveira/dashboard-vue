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
    if (text === 'Marica') return { backgroundColor: '#fce5cd', color: '#333' };
    if (text === 'Macae') return { backgroundColor: '#d9ead3', color: '#333' };
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
    width: 100%;
    overflow-x: auto;
    max-height: 500px;
    overflow-y: auto;
    margin-bottom: 50px;
}

table {
    width: 100%;
    height: 400px;
    table-layout: fixed;
    border-collapse: collapse;
}

th,
td {
    border: 1px solid #555;
    padding: 10px 12px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.col-link {
    width: 130px;
}

.col-small {
    width: 120px;
}

.col-medium {
    width: 180px;
}

.col-large {
    width: 350px;
}

th {
    background-color: orangered;
    color: white;
    position: relative;
    position: sticky;
    top: 0;
    z-index: 1;
    text-align: center;
}

tbody tr:nth-child(even) {
    background-color: transparent;
    color: black;
}

tbody tr:nth-child(odd) {
    background-color: transparent;
    color: black;
}

td a {
    color: blue;
    text-decoration: underline;
    font-weight: bold;
}

td a:hover {
    color: rgb(0, 0, 205);
}
</style>