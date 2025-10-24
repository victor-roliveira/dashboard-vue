<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    mainSheetData: { type: Array, required: true }
})

const selectedDiscipline = ref('Todos')

console.log('[AllocationsComponent] Dados recebidos (props.mainSheetData):', props.mainSheetData);

const processedData = computed(() => {
    console.log('[AllocationsComponent] Executando computed "processedData"...');

    if (!props.mainSheetData || props.mainSheetData.length < 3) {
        console.error('[AllocationsComponent] ERRO: mainSheetData inválido ou curto demais.');
        return {};
    }

    const headers = props.mainSheetData[1];
    console.log('[AllocationsComponent] Cabeçalhos (headers):', headers);

    const findIndex = (headerName) => {
        return headers.findIndex(h => h && h.trim() === headerName.trim());
    };

    const idx = {
        disciplina: findIndex('Disciplinas'),
        profissional: findIndex('Profissional'),
        total: findIndex('🤖Total'),
        marica: findIndex('Marica'),
        macae: findIndex('Macae'),
        diversos: findIndex('Diversos')
    };

    console.log('[AllocationsComponent] Índices das Colunas (idx):', idx);

    if (idx.disciplina === -1 || idx.profissional === -1) {
        console.error('[AllocationsComponent] ERRO: Coluna "Disciplinas" ou "Profissional" não encontrada!');
        return {};
    }

    const groups = {}
    const dataRows = props.mainSheetData.slice(3);

    for (const row of dataRows) {
        if (!row || row.length === 0 || row.every(cell => !cell)) continue;

        const disciplina = idx.disciplina > -1 ? (row[idx.disciplina] || '') : '';
        if (!disciplina) continue;

        if (!groups[disciplina]) {
            groups[disciplina] = []
        }

        groups[disciplina].push({
            profissional: idx.profissional > -1 ? (row[idx.profissional] || '') : 'N/A',
            total: idx.total > -1 ? (row[idx.total] || '') : 'N/A',
            marica: idx.marica > -1 ? (row[idx.marica] || '') : 'N/A',
            macae: idx.macae > -1 ? (row[idx.macae] || '') : 'N/A',
            diversos: idx.diversos > -1 ? (row[idx.diversos] || '') : 'N/A'
        })
    }

    console.log('[AllocationsComponent] Grupos Processados:', groups);
    return groups
})

const disciplines = computed(() => {
    return ['Todos', ...Object.keys(processedData.value)]
})

const filteredData = computed(() => {
    if (selectedDiscipline.value === 'Todos') {
        return processedData.value
    }
    return {
        [selectedDiscipline.value]: processedData.value[selectedDiscipline.value]
    }
})

const tableHeaders = ref([
    { title: 'Profissional', key: 'profissional', align: 'start' },
    { title: 'Total', key: 'total', align: 'center' },
    { title: 'Marica', key: 'marica', align: 'center' },
    { title: 'Macae', key: 'macae', align: 'center' },
    { title: 'Diversos', key: 'diversos', align: 'center' },
])


function clearFilter() {
    selectedDiscipline.value = 'Todos'
}

const parseTotal = (totalStr) => {
    if (typeof totalStr !== 'string') return 0;

    return parseFloat(totalStr.replace('%', '').replace(',', '.')) || 0
}

const getRowProps = ({ item }) => {
  const isAvailable = parseTotal(item.raw.total) === 0;

  if (!isAvailable) return {};

  return {
    class: 'available-row', // opcional, se quiser manter a classe
    style: {
      backgroundColor: '#FFF3E0', // fundo laranja claro
      color: '#E65100',           // texto laranja escuro
    }
  };
};

</script>

<template>
    <v-row class="mb-4" align="center">

        <v-col cols="12" sm="auto">
            <v-btn-toggle v-model="selectedDiscipline" color="orange" variant="outlined" mandatory divided>
                <v-btn v-for="discipline in disciplines" :key="discipline" :value="discipline">
                    {{ discipline }}
                </v-btn>
            </v-btn-toggle>
        </v-col>

        <v-col cols="12" sm="auto">
            <v-btn @click="clearFilter" color="grey">
                Limpar Filtro
            </v-btn>
        </v-col>
    </v-row>

    <v-row>
        <v-col v-for="(rows, disciplineName) in filteredData" :key="disciplineName" cols="12" lg="6">
            <v-card flat>
                <v-card-title class="text-h6">
                    {{ disciplineName }}
                </v-card-title>

                <v-card-subtitle class="d-flex flex-wrap ga-4 mb-2">
                    <span>❌ Ocupado</span>
                    <span>🟢 Disponível</span>
                    <span>✅ Em dia</span>
                    <span>⚠️ Atrasos</span>
                </v-card-subtitle>

                <v-data-table :headers="tableHeaders" :items="rows" :item-props="getRowProps" density="compact"
                    fixed-header height="300px" hide-default-footer items-per-page="-1">
                    <template v-slot:item.profissional="{ item }">
                        <span v-if="parseTotal(item.total) > 0">
                            ❌
                        </span>
                        <span class="disponivel" v-if="parseTotal(item.total) === 0">
                            🟢
                        </span>
                        <span v-if="parseTotal(item.total) === 100">
                            ✅
                        </span>
                        <span v-else>
                            ⚠️
                        </span>
                        {{ item.profissional }}
                    </template>
                </v-data-table>
            </v-card>
        </v-col>
    </v-row>
</template>

<style scoped>
.disponivel > tr {
    background-color: #E65100;
}
/* Cabeçalho laranja */
.v-data-table :deep(thead > tr > th) {
  background-color: orange !important;
  color: white !important;
  font-weight: bold;
}

/* Linha com profissional disponível (total = 0) */
.v-data-table :deep(tbody tr.available-row) {
  background-color: #FFF3E0 !important; /* Laranja claro */
  color: #E65100 !important;            /* Texto laranja escuro */
}

/* Efeito hover na linha disponível */
.v-data-table :deep(tbody tr.available-row:hover) {
  background-color: #FFE0B2 !important; /* Laranja médio */
}

</style>