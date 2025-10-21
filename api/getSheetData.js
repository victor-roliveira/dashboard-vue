import { google } from 'googleapis';

export default async function handler(request, response) {
    try {
        const base64Creds = process.env.GOOGLE_CREDENTIALS_B64; 
        if (!base64Creds) {
            throw new Error("Variável de ambiente GOOGLE_CREDENTIALS_B64 não encontrada.");
        }

        const credsString = Buffer.from(base64Creds, 'base64').toString('utf-8');

        const creds = JSON.parse(credsString);
        
        const auth = google.auth.fromJSON(creds);
        auth.scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

        const spreadsheetId = process.env.SHEET_ID;

        const abaPrincipal = "Trabalho";
        const abasDisciplinas = [
            'Planejamento HID',
            'Planejamento TER',
            'Planejamento EST',
            'Planejamento ELE',
            'Planejamento PCI/AVAC',
            'Planejamento ORÇ'
        ]

        const ranges = [`${abaPrincipal}!A1:Z`];
        abasDisciplinas.forEach(aba => {
            ranges.push(`${aba}!A2:Z`);
        });

        console.log(`[LOG DA API] Tentando buscar... ID: ${spreadsheetId}, Aba: ${abaPrincipal}`);

        const sheets = google.sheets({ version: 'v4', auth: auth }); 

        const result = await sheets.spreadsheets.values.batchGet({
            spreadsheetId,
            ranges: ranges
        })

        const allSheetData = result.data.valueRanges;

        const responseData = {
            mainSheet: allSheetData[0].values,
            disciplineSheets: allSheetData.slice(1).reduce((acc, sheet) => {
                const sheetName = sheet.range.split('!')[0]
                acc[sheetName] = sheet.values
                return acc
            }, {})
        }

        console.log('[LOG DO BACKEND] Resposta da API do Google recebida com SUCESSO.');

        response.status(200).json(responseData)

    } catch (error) {
        console.error('### ERRO NO CATCH DO BACKEND ###', error);
        response.status(500).json({
            error: 'Falha ao buscar dados.',
            details: error.message
        });
    }
}