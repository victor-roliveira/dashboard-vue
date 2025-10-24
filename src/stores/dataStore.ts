import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

export const useDataStore = defineStore('data', () => {
    const mainSheetData = ref([])
    const disciplineSheetsData = ref([])
    const colaboradoresData = ref(null)
    const loading = ref(true);
    const error = ref(null);
    const sheetId = ref(null);
    const gidMap = ref(null);


    async function fetchData() {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get('/api/getSheetData');

            mainSheetData.value = response.data.mainSheet;
            disciplineSheetsData.value = response.data.disciplineSheets;
            sheetId.value = response.data.sheetId;
            gidMap.value = response.data.gidMap;
            colaboradoresData.value = response.data.colaboradoresData;

        } catch (error: any) {
            console.error(error);
            error.value = 'Não foi possível carregar os dados.';
        } finally {
            loading.value = false;
        }
    }

    return {
        loading,
        error,
        mainSheetData,
        disciplineSheetsData,
        sheetId,
        gidMap,
        colaboradoresData,
        fetchData 
    }
})