// api/getSheetData.js
import { google } from 'googleapis';

// --- Função Helper 1: Busca dados da Planilha de Engenharia (seu código antigo) ---
async function getEngenhariaData(auth, sheets) {
    try {
        const spreadsheetId = process.env.SHEET_ID;
        if (!spreadsheetId) throw new Error("SHEET_ID não definido.");

        const abaPrincipal = "Trabalho";
        const abasDisciplinas = [
            'Planejamento HID', 'Planejamento TER', 'Planejamento EST',
            'Planejamento ELE', 'Planejamento PCI/AVAC', 'Planejamento ORÇ'
        ];
        
        const ranges = [`${abaPrincipal}!A1:Z`];
        abasDisciplinas.forEach(aba => {
            ranges.push(`${aba}!A2:Z`);
        });

        // Chamada 1: Buscar os dados
        const dataPromise = sheets.spreadsheets.values.batchGet({
            spreadsheetId,
            ranges: ranges
        });

        // Chamada 2: Buscar os metadados (GIDs)
        const metaPromise = sheets.spreadsheets.get({
            spreadsheetId,
            fields: 'sheets(properties(title,sheetId))' 
        });

        const [dataResult, metaResult] = await Promise.all([dataPromise, metaPromise]);

        // Processa Metadados
        const gidMap = metaResult.data.sheets.reduce((acc, sheet) => {
            acc[sheet.properties.title] = sheet.properties.sheetId;
            return acc;
        }, {});

        // Processa Dados
        const allSheetData = dataResult.data.valueRanges;
        const mainSheet = allSheetData[0].values;
        const disciplineSheets = allSheetData.slice(1).reduce((acc, sheet) => {
            const sheetName = sheet.range.split('!')[0]; 
            acc[sheetName] = sheet.values;
            return acc;
        }, {});

        return {
            sheetId: spreadsheetId, 
            mainSheet: mainSheet, 
            disciplineSheets: disciplineSheets,
            gidMap: gidMap 
        };

    } catch (err) {
        console.error("Erro ao buscar dados de Engenharia:", err.message);
        // Retorna nulo se falhar, para não quebrar a chamada principal
        return null; 
    }
}

// --- Função Helper 2: Busca dados da Nova Planilha de Colaboradores ---
async function getColaboradoresData(auth, sheets) {
    try {
        const spreadsheetId = process.env.COLABORADORES_SHEET_ID;
        if (!spreadsheetId) {
            console.warn("COLABORADORES_SHEET_ID não definido. Pulando.");
            return null;
        }

        // Busca a primeira aba visível da planilha, range A:Z
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'A1:Z', // Ajuste o nome da aba se necessário, ex: 'Plan1!A1:Z'
        });
        return result.data.values;

    } catch (err) {
        console.error("Erro ao buscar dados de Colaboradores:", err.message);
        return null;
    }
}


// --- Handler Principal (Atualizado) ---
export default async function handler(request, response) {
    try {
        // Autenticação (igual a antes)
        const base64Creds = process.env.GOOGLE_CREDENTIALS_B64; 
        if (!base64Creds) throw new Error("GOOGLE_CREDENTIALS_B64 não encontrada.");
        
        const credsString = Buffer.from(base64Creds, 'base64').toString('utf-8');
        const creds = JSON.parse(credsString);
        
        const auth = google.auth.fromJSON(creds);
        auth.scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
        
        const sheets = google.sheets({ version: 'v4', auth: auth }); 

        // ==========================================================
        // MUDANÇA: Executa as duas buscas em paralelo
        // ==========================================================
        const [engenhariaData, colaboradoresData] = await Promise.all([
            getEngenhariaData(auth, sheets),
            getColaboradoresData(auth, sheets)
        ]);

        console.log('[LOG DO BACKEND] Todas as planilhas foram buscadas com SUCESSO.');

        // Combina tudo em uma única resposta
        response.status(200).json({
            ...engenhariaData, // (sheetId, mainSheet, disciplineSheets, gidMap)
            colaboradoresData: colaboradoresData // (os novos dados)
        });

    } catch (error) {
        console.error('### ERRO NO CATCH DO BACKEND ###', error);
        response.status(500).json({
            error: 'Falha ao buscar dados.',
            details: error.message
        });
    }
}