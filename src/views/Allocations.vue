<script setup>
import { onMounted, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useDataStore } from '@/stores/dataStore'
import AllocationsContracts from '@/components/AllocationsContracts.vue'

const dataStore = useDataStore()

const { loading, error, mainSheetData } = storeToRefs(dataStore)

onMounted(() => {
  dataStore.fetchData()
})

watchEffect(() => {
  console.log('[AllocationsView] Estado Atual:');
  console.log('  - Loading:', loading.value);
  console.log('  - Error:', error.value);
  // Verifica se mainSheetData tem algum valor (não nulo/undefined)
  console.log('  - mainSheetData existe?', !!mainSheetData.value);
  // Se existir, mostra as primeiras linhas para confirmar
  if (mainSheetData.value) {
    console.log('  - Amostra mainSheetData:', mainSheetData.value.slice(0, 5));
  }
});
</script>

<template>
  <v-container fluid>

    <v-overlay :model-value="loading" persistent class="d-flex flex-column justify-center align-center">
      <h1 class="text-h4 font-weight-bold mb-6" style="color: white;">
        Alocações
      </h1>
      <v-progress-circular indeterminate color="orange" size="64"></v-progress-circular>
      <p class="text-h6 mt-4" style="color: white;">Carregando dados...</p>
    </v-overlay>

    <div v-if="!loading">

      <v-alert v-if="error" type="error" variant="tonal" border="start" prominent class="my-4">
        {{ error }}
      </v-alert>

      <div v-else-if="mainSheetData">
        <AllocationsContracts :main-sheet-data="mainSheetData" />
      </div>

    </div>

  </v-container>
</template>

<style scoped>
main {
  padding: 20px;
}

h1,
p {
  font-family: 'DM Sans';
}

.loading,
.error {
  text-align: center;
  font-size: 1.5em;
  color: #ccc;
  margin-top: 50px;
}
</style>