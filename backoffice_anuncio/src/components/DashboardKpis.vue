<!-- src/components/DashboardKpis.vue -->
<template>
  <div class="kpi-grid card-compact">

    <!-- Receita -->
    <Card class="kpi-card">
      <template #title><div class="div-info-title"><div id="icon-receita" class="title-icon"></div><span class="card-title">Receita</span></div></template>
      <template #content>
        <div v-if="loading" class="skeleton-wrap">
          <Skeleton height="1.4rem" width="60%" />
          <Skeleton height="0.9rem" width="40%" />
        </div>
        <div v-else>
          <div class="kpi-value">{{ fmtCurrency(kpis.revenue) }}</div>
          <div class="kpi-sub">Pagamentos: {{ kpis.paymentsCount }}</div>
        </div>
      </template>
    </Card>

    <!-- Ticket Médio -->
    <Card class="kpi-card">
      <template #title><div class="div-info-title"><div id="icon-ticket-medio" class="title-icon"></div><span class="card-title">Ticket Médio</span></div></template>
      <template #content>
        <div v-if="loading" class="skeleton-wrap">
          <Skeleton height="1.4rem" width="50%" />
        </div>
        <div v-else>
          <div class="kpi-value">{{ fmtCurrency(kpis.avgTicket) }}</div>
          <div class="kpi-sub">Base: {{ kpis.paymentsCount }} pagamentos</div>
        </div>
      </template>
    </Card>

    <!-- Anúncios -->
    <Card class="kpi-card anuncios-card">
      <template #title><div class="div-info-title"><div id="icon-anuncios" class="title-icon"></div><span class="card-title">Anúncios</span></div></template>
      <template #content>
        <div v-if="loading" class="skeleton-wrap">
          <Skeleton height="1.4rem" width="45%" />
          <Skeleton height="0.9rem" width="55%" class="mt-2" />
        </div>
        <div v-else>
          <div class="kpi-value anuncios-total">{{ kpis.adsPending + kpis.adsDone }}</div>

          <!-- badges abaixo e lado a lado do total -->
          <div class="anuncios-row">
            <Tag :value="`Pendentes: ${kpis.adsPending}`" severity="warning" />
            <Tag :value="`Concluídos: ${kpis.adsDone}`" severity="success" />
          </div>
        </div>
      </template>
    </Card>

    <!-- Utilizadores -->
    <Card class="kpi-card">
      <template #title><div class="div-info-title"><div id="icon-utilizadores" class="title-icon"></div><span class="card-title">Utilizadores</span></div></template>
      <template #content>
        <div v-if="loading" class="skeleton-wrap">
          <Skeleton height="1.4rem" width="35%" />
        </div>
        <div v-else>
          <div class="kpi-value">{{ kpis.usersTotal }}</div>
          <div class="kpi-sub">Registados no sistema</div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script>
import axios from 'axios'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'

const API_BASE = 'http://127.0.0.1:8000'

export default {
  name: 'DashboardKpis',
  components: { Card, Tag, Skeleton },
  data () {
    return {
      loading: true,
      kpis: {
        revenue: 0,
        paymentsCount: 0,
        avgTicket: 0,
        adsPending: 0,
        adsDone: 0,
        usersTotal: 0
      }
    }
  },
  created () {
    this.fetchAllKpis()
  },
  methods: {
    async fetchAll (endpoint, pageSize = 100) {
      let url = `${API_BASE}/${endpoint}/?page_size=${pageSize}`
      const all = []
      while (url) {
        const { data } = await axios.get(url)
        const results = Array.isArray(data) ? data : (data.results || [])
        all.push(...results)
        url = data.next || null
      }
      return all
    },
    sum (arr, pick) { return arr.reduce((a, x) => a + (pick(x) || 0), 0) },
    fmtCurrency (v) {
      return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(v || 0)
    },
    async fetchAllKpis () {
      try {
        this.loading = true

        // Pagamentos
        const pagamentos = await this.fetchAll('pagamentos')
        const revenue = this.sum(pagamentos, p => Number(p.valor_total))
        const paymentsCount = pagamentos.length
        const avgTicket = paymentsCount ? revenue / paymentsCount : 0

        // Anúncios
        const anuncios = await this.fetchAll('anuncios')
        const adsPending = anuncios.filter(a => (a.estado || '').toLowerCase() === 'pendente').length
        const adsDone = anuncios.filter(a => ['concluído', 'concluido'].includes((a.estado || '').toLowerCase())).length

        // Utilizadores
        const { data: usersPage1 } = await axios.get(`${API_BASE}/users/?page_size=1`)
        const usersTotal = usersPage1?.count ?? 0

        this.kpis = { revenue, paymentsCount, avgTicket, adsPending, adsDone, usersTotal }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
/* Grid: 4/3/2/1 colunas, gaps menores */
.kpi-grid{
  margin-top: 1rem;
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:.75rem;
  padding:.25rem .75rem .75rem .75rem;
}

/* Cartões compactos */
.kpi-card ::v-deep(.p-card){ height:100%; }
.kpi-card ::v-deep(.p-card-body){ padding:.3rem .85rem; }
.kpi-card ::v-deep(.p-card-title){ margin-bottom:0rem; font-size:1.1rem; font-weight:700; margin-top: .5rem; }

/* Tipografia dos valores */
.kpi-value{ font-size:1.25rem; font-weight:700; line-height:1.15; }
.kpi-sub{ color:#6b7280; margin-top:.15rem; font-size:.8rem; }

/* Tags (pendente/concluído) mais compactas */
.anuncios-row{
  margin-top: .15rem;
  display:flex;
  align-items:flex-start;
  gap:.5rem;
  flex-wrap:wrap;
}
.anuncios-row .tot{
  font-size:1.25rem;
  font-weight:700;
  line-height:1.2;
  min-width:2ch;
}
.div-info-title{
  display: flex;
  align-items: center;
}

.title-icon{
  display: inline-block;
  background-image: url('../assets/add.png');
  background-size: cover;
  background-repeat: no-repeat;
  width: 1.5rem;
  height: 1.5rem;
  margin-right: .3rem;
}

#icon-receita {
  background-image: url('../assets/receita.png');
}

#icon-ticket-medio {
  background-image: url('../assets/media.png');
}

#icon-anuncios {
  background-image: url('../assets/anuncio.png');
}

#icon-utilizadores {
  background-image: url('../assets/utilizadores.png');
}

/* PrimeVue Tag menor */
.kpi-card ::v-deep(.p-tag){
  padding:.18rem .45rem;
  font-size:.78rem;
  line-height:1;
  border-radius:.4rem;
}

/* Skeletons menores */
.skeleton-wrap{ display:flex; flex-direction:column; gap:.35rem; }

/* Breakpoints */
@media (max-width:1200px){
  .kpi-grid{ grid-template-columns:repeat(4,minmax(0,1fr)); }
}
@media (max-width:900px){
  .kpi-grid{ grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media (max-width:600px){
  .kpi-grid{ grid-template-columns:1fr; }
}
</style>
