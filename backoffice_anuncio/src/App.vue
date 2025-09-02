<template>
  <div class="main_div">
    <SideBar @selecionarTabela="tabelaSelecionada = $event" />
    <div class="content_main_div">
      <NavBar v-if="isLoggedado" :tabela="tabelaSelecionada" />
      <CardLogin v-if="!isLoggedado" @loginSuccess="isLoggedado = true" />

      <!-- DASHBOARD -->
      <template v-if="tabelaSelecionada === 'dashboard'">
        <!-- KPIs: controla período internamente -->
        <DashboardKpis />

        <!-- Charts: controla período internamente -->
        <DashboardCharts />
      </template>

      <!-- Outras tabelas -->
      <CardTable
        v-if="mostrarCardTable"
        :tabela="tabelaSelecionada"
      />
    </div>
  </div>
</template>

<script>
import SideBar from './components/SideBar.vue'
import NavBar from './components/NavBar.vue'
import CardTable from './components/CardTable.vue'
import CardLogin from './components/CardLogin.vue'
import DashboardKpis from './components/DashboardKpis.vue'
import DashboardCharts from './components/DashboardCharts.vue'

export default {
  components: {
    SideBar,
    NavBar,
    CardTable,
    CardLogin,
    DashboardKpis,
    DashboardCharts
  },
  data() {
    return {
      tabelaSelecionada: 'dashboard',
      isLoggedado: localStorage.getItem('user') !== null
    }
  },
  computed: {
    mostrarCardTable() {
      const especiais = ['dashboard', 'settings']
      return this.tabelaSelecionada && !especiais.includes(this.tabelaSelecionada.toLowerCase())
    }
  }
}
</script>

<style>
body {
  @import url('https://fonts.googleapis.com/css2?family=Sansation:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap');
  margin: 0;
  padding: 0;
  background-color: #e7e7e7;
  font-family: "Sansation", sans-serif;
}
ul { list-style: none; padding: 0; margin: 0; }
button { background: none; border: none; padding: 0; margin: 0; color: inherit; font: inherit; cursor: pointer; }
.main_div { display: flex; flex-direction: row; height: 100vh; }
.content_main_div { position: absolute; right: 0rem; width: calc(100% - 13rem); }

@media (max-width: 700px){
  .content_main_div{
    width: calc(100% - 11rem);
  }
}
</style>
