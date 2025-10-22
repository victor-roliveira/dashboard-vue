<script setup>
import { ref, computed } from 'vue';

// Props que o componente recebe do DashboardView
const props = defineProps({
    sheetId: { type: String, required: true },
    disciplineData: { type: Object, required: true },
    gidMap: { type: Object, required: true }
});

// --- Filtros ---
const selectedContrato = ref('Todos');
const selectedOS = ref('Todos');

// --- Colunas Chave (AJUSTE OS NOMES SE NECESSÁRIO) ---
const COLS = {
    PROFISSIONAL: 'Profissional',
    CONTRATO: 'Contrato',
    TAREFA: 'Tarefa (Descrita)',
    OS: 'OS',
    DATA: '🤖 Data de Entrega Contratual', // Coluna de data da sua imagem
    AVAL_4: 'Avaliação 4ª',
    OBS_4: 'OBS 4ª',
    AVAL_6: 'Avaliação 6ª',
    OBS_6: 'OBS 6ª',
};

// --- 1. Processamento e Agregação dos Dados ---
const allProblemRows = computed(() => {
    const allRows = [];
    if (!props.disciplineData) return [];

    // Itera em cada aba de disciplina (ex: "Planejamento ELE'", "Planejamento HID'")
    for (const sheetName in props.disciplineData) {
        const sheet = props.disciplineData[sheetName];
        if (!sheet || sheet.length < 2) continue; // Pula abas vazias

        const headers = sheet[0];

        // Encontra os índices das colunas
        const idx = {
            profissional: headers.indexOf(COLS.PROFISSIONAL),
            contrato: headers.indexOf(COLS.CONTRATO),
            tarefa: headers.indexOf(COLS.TAREFA),
            os: headers.indexOf(COLS.OS),
            data: headers.indexOf(COLS.DATA),
            aval4: headers.indexOf(COLS.AVAL_4),
            obs4: headers.indexOf(COLS.OBS_4),
            aval6: headers.indexOf(COLS.AVAL_6),
            obs6: headers.indexOf(COLS.OBS_6),
            // linkPlanilha: headers.indexOf(COLS.LINK_PLANILHA),
        };

        // Itera em cada linha de dados (pulando o cabeçalho)
        sheet.slice(1).forEach((row, rowIndex) => {
            const aval4Value = row[idx.aval4] || '';
            const aval6Value = row[idx.aval6] || '';

            // A regra de negócio: Se *qualquer* avaliação existir, adicione à tabela
            if (aval4Value.trim() || aval6Value.trim()) {

                // O valor 'aval' a ser exibido (dá prioridade ao 4ª)
                const avaliacao = aval4Value || aval6Value;
                const obs = row[idx.obs4] || row[idx.obs6] || ''; // Prioriza OBS 4ª

                allRows.push({
                    // Dados para o link
                    sheetName: sheetName, // "Planejamento ELE'"
                    rowIndexInSheet: rowIndex + 3, // +1 (slice) +1 (índice 0) = Linha 2

                    // Dados da Tabela
                    // linkPlanilha: row[idx.linkPlanilha] || '', // Use isso se já houver um link
                    profissional: row[idx.profissional] || '',
                    contrato: row[idx.contrato] || '',
                    tarefa: row[idx.tarefa] || '',
                    os: row[idx.os] || '',
                    data: row[idx.data] || '',
                    avaliacao: avaliacao,
                    obs: obs,
                });
            }
        });
    }
    return allRows;
});

// --- 2. Opções dos Filtros ---
const contratoOptions = computed(() => {
    // Pega todos os valores, remove duplicados, e adiciona "Todos"
    const contracts = allProblemRows.value.map(row => row.contrato);
    return ['Todos', ...new Set(contracts)].filter(Boolean); // filter(Boolean) remove nulos/vazios
});

const osOptions = computed(() => {
    const osList = allProblemRows.value.map(row => row.os);
    return ['Todos', ...new Set(osList)].filter(Boolean);
});

// --- 3. Dados Filtrados Finais ---
const filteredRows = computed(() => {
    return allProblemRows.value.filter(row => {
        const matchContrato = (selectedContrato.value === 'Todos') || (row.contrato === selectedContrato.value);
        const matchOS = (selectedOS.value === 'Todos') || (row.os === selectedOS.value);
        return matchContrato && matchOS;
    });
});

function generateSheetLink(row) {
    const cleanSheetName = row.sheetName.replace(/^'|'$/g, '');

    const gid = props.gidMap[cleanSheetName];

    if (gid === undefined || !props.sheetId) {
        console.warn(`Não foi possível encontrar o GID para a aba: ${cleanSheetName}`);
        return '#';
    }

    const range = `A${row.rowIndexInSheet}`;
    return `https://docs.google.com/spreadsheets/d/${props.sheetId}/edit#gid=${gid}&range=${range}`;
}

function goToSheet(row) {
    const url = generateSheetLink(row);

    if (url !== '#') {
        window.open(url, '_blank', 'noopener,noreferrer');
    } else {
        alert("Não foi possível gerar o link. Verifique se o nome da aba está correto na API.");
    }
}
</script>

<template>
    <div class="problem-table-container">
        <h2>Consulta de Atividades</h2>

        <div class="filters">
            <div class="filter-group">
                <label for="filter-contrato">Filtrar por Contrato:</label>
                <select id="filter-contrato" v-model="selectedContrato">
                    <option v-for="option in contratoOptions" :key="option" :value="option">
                        {{ option }}
                    </option>
                </select>
            </div>
            <div class="filter-group">
                <label for="filter-os">Filtrar por OS:</label>
                <select id="filter-os" v-model="selectedOS">
                    <option v-for="option in osOptions" :key="option" :value="option">
                        {{ option }}
                    </option>
                </select>
            </div>
        </div>

        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th class="col-link">Ir para Planilha</th>
                        <th class="col-medium">Profissional</th>
                        <th class="col-medium">Contrato</th>
                        <th class="col-large">Tarefa (Descrita)</th>
                        <th class="col-medium">OS</th>
                        <th class="col-small">Término</th>
                        <th class="col-medium">Avaliação 4ª</th>
                        <th class="col-large">OBS 4ª</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in filteredRows" :key="index">
                        <td class="col-link">
                            <a href="#" @click.prevent="goToSheet(row)">
                                Ir para Linha {{ row.rowIndexInSheet }}
                            </a>
                        </td>
                        <td class="col-medium">{{ row.profissional }}</td>
                        <td class="col-medium">{{ row.contrato }}</td>
                        <td class="col-large">{{ row.tarefa }}</td>
                        <td class="col-medium">{{ row.os }}</td>
                        <td class="col-small">{{ row.data }}</td>
                        <td class="col-medium">{{ row.avaliacao }}</td>
                        <td class="col-large">{{ row.obs }}</td>
                    </tr>
                    <tr v-if="filteredRows.length === 0">
                        <td :colspan="8">Nenhuma atividade encontrada com os filtros selecionados.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
h2 {
    color: black;
    font-weight: bold;
}

.problem-table-container {
    width: 1800px;
    margin-top: 40px;
    margin-bottom: 40px;
    color: #eee;
}

.filters {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.filter-group {
    display: flex;
    flex-direction: column;
}

.filter-group label {
    font-size: 0.9em;
    margin-bottom: 5px;
    color: black;
    font-weight: 500;
}

.filter-group select {
    padding: 8px;
    border-radius: 4px;
    border: 2px solid #a7a7a7;
    background-color: transparent;
    color: black;
    font-size: 1em;
    font-family: 'DM Sans';
    cursor: pointer;
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

td {
    border: 2px solid #e1e1e1;
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