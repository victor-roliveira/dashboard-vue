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

        const nomeAba = "Página1";

        const range = `${nomeAba}!A1:Z`; 

        console.log(`[LOG DA API] Tentando buscar... ID: ${spreadsheetId}, Aba: ${nomeAba}`);

        const sheets = google.sheets({ version: 'v4', auth: auth }); 

        const sheetData = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range
        });

        console.log('[LOG DO BACKEND] Resposta da API do Google recebida com SUCESSO.');

        response.status(200).json({
            data: sheetData.data.values,
        });

    } catch (error) {
        console.error('### ERRO NO CATCH DO BACKEND ###', error);
        response.status(500).json({
            error: 'Falha ao buscar dados.',
            details: error.message
        });
    }
}