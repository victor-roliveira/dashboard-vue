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
  <main>
    <div v-if="loading" class="loading">
      Carregando dados de alocação...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="mainSheetData">
      <AllocationsContracts :main-sheet-data="mainSheetData" />
    </div>
  </main>
</template>

<style scoped>
main {
  padding: 20px;
}
.loading, .error {
  text-align: center;
  font-size: 1.5em;
  color: #ccc;
  margin-top: 50px;
}
</style>