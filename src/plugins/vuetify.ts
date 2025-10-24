// src/plugins/vuetify.js

// Importações de Estilo
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css' // Importação dos ícones

// Importação do Vuetify
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Criar a instância do Vuetify
const vuetify = createVuetify({
  components,
  directives,
  // Você pode adicionar configurações de tema globais aqui
  // theme: {
  //   defaultTheme: 'light',
  // },
})

export default vuetify