<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <v-app>
    <v-app-bar color="orange" density="compact">
      <v-tabs
        bg-color="transparent"
        slider-color="black"
      >
        <v-tab to="/controle-engenharia">
          Controle Engenharia
        </v-tab>
        <v-tab to="/alocacoes">
          Alocações
        </v-tab>
      </v-tabs>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.v-tab {
  text-transform: none;
  font-size: 16px; 
  color: #fff;
  font-weight: 800;
}

.v-tab.v-tab--selected {
  color: #000; 
}
</style>