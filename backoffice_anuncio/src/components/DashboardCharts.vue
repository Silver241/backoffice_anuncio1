<template>
  <div class="charts-wrap">
    <!-- Filtros reorganizados -->
    <div class="filters">
      <div class="filters-left">
        <!-- Botões de período movidos para cá -->
        <div class="periodo">
          <SelectButton v-model="period" :options="periodos" optionLabel="label" optionValue="value" />
        </div>
        
        <Dropdown
          v-model="canal"
          :options="canalOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Canal (todos)"
          class="w-14rem"
        />
      </div>
    </div>

    <!-- Grid de gráficos -->
    <div class="grid-charts">
      <!-- 1) Receita por canal (empilhado por região) -->
      <Card class="chart-card">
        <template #title>
          <div class="card-title">Receita por canal </div>
        </template>
        <template #content>
          <div class="chart-box">
            <Bar :data="revenueStackData" :options="stackOptions" class="chart"/>
          </div>
        </template>
      </Card>

      <!-- 2) Anúncios por estado (Doughnut) -->
      <Card class="chart-card">
        <template #title>
          <div class="card-title">Anúncios por estado</div>
        </template>
        <template #content>
          <div class="chart-box">
            <Doughnut :data="adsByEstadoData" :options="pieOptions" class="chart"/>
          </div>
        </template>
      </Card>

      <!-- 3) Evolução diária dos pagamentos (Linha) -->
      <Card class="chart-card">
        <template #title>
          <div class="card-title">Evolução diária dos pagamentos</div>
        </template>
        <template #content>
          <div class="chart-box">
            <Line :data="dailyLineData" :options="lineOptions" class="chart"/>
          </div>
        </template>
      </Card>

      <!-- 4) Heatmap (dia x horário) -->
      <Card class="chart-card">
        <template #title>
          <div class="card-title">Mapa de calor (dia × horário)</div>
        </template>
        <template #content>
          <div class="chart-box">
            <Chart :type="'matrix'" :data="heatmapData" :options="heatmapOptions" class="chart"/>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'
import SelectButton from "primevue/selectbutton";
import { Bar, Line, Doughnut, Chart as VueChart } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, TimeScale,
  BarElement, LineElement, PointElement, ArcElement,
  Tooltip, Legend
} from 'chart.js'
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix'

ChartJS.register(
  CategoryScale, LinearScale, TimeScale,
  BarElement, LineElement, PointElement, ArcElement,
  Tooltip, Legend,
  MatrixController, MatrixElement
)

const API_BASE = 'http://127.0.0.1:8000'
const d2 = n => String(n).padStart(2, '0')
const labelDia = d => `${d2(d.getDate())}/${d2(d.getMonth()+1)}`
const diasPT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

export default {
  name: 'DashboardCharts',
  components: { Card, Dropdown, Bar, Line, Doughnut, Chart: VueChart, SelectButton },
  
  data () {
    return {
      /* 🔹 Período agora é interno, não mais prop */
      period: '7d',
      periodos: [
        { label: "Hoje", value: "today" },
        { label: "7 dias", value: "7d" },
        { label: "Mês", value: "month" }
      ],

      canal: 'all',
      canalOptions: [
        { label: 'Todos', value: 'all' },
        { label: 'RCV', value: 'RCV' },
        { label: 'RCV+', value: 'RCV+' },
        { label: 'TCV', value: 'TCV' }
      ],

      anuncios: [],
      pagamentos: [],
      adsByEstadoData: { labels: [], datasets: [] },
      revenueStackData: { labels: [], datasets: [] },
      dailyLineData: { labels: [], datasets: [] },
      heatmapData: { labels: [], datasets: [] },

      barOptions: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ y:{beginAtZero:true} } },
      pieOptions: { 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 8,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          }
        },
        layout: {
          padding: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10
          }
        }
      },
      stackOptions: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom'}}, scales:{ x:{stacked:true}, y:{stacked:true, beginAtZero:true} } },
      lineOptions: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, tension:0.3 },
      heatmapOptions: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}, tooltip:{enabled:true}}, scales:{ x:{type:'category', position:'top'}, y:{type:'category', reverse:true} } }
    }
  },
  watch: {
    period() { this.renderAll() },
    canal() { this.renderAll() }
  },
  async created () {
    await this.loadData()
    this.renderAll()
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
    async loadData () {
      this.anuncios = await this.fetchAll('anuncios')
      this.pagamentos = await this.fetchAll('pagamentos')
    },
    startEndFor (period) {
      const now = new Date()
      let start, end
      
      if (period === 'today') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      } else if (period === '7d') {
        // Calculate 7 days ago properly
        const sevenDaysAgo = new Date(now)
        sevenDaysAgo.setDate(now.getDate() - 6) // Last 7 days including today
        start = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate(), 0, 0, 0, 0)
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      } else if (period === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      }
      
      if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error('[v0] Invalid dates created in startEndFor:', { period, start, end })
        // Fallback to today if dates are invalid
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      }
      
      console.log(`[v0] Period: ${period}`)
      console.log(`[v0] Start: ${start.toISOString().split('T')[0]} (${start.toLocaleDateString()})`)
      console.log(`[v0] End: ${end.toISOString().split('T')[0]} (${end.toLocaleDateString()})`)
      
      return { start, end }
    },
    asDate (str) { 
      if(!str) return null
      const dateStr = str.includes(' ') ? str.split(' ')[0] : str // Handle datetime strings
      const parts = dateStr.split('-')
      if (parts.length !== 3) return null
      
      const [y, m, d] = parts.map(Number)
      if (isNaN(y) || isNaN(m) || isNaN(d)) return null
      
      return new Date(y, m-1, d)
    },
    
    inRange (dateStr, start, end) { 
      const d = this.asDate(dateStr)
      if(!d) {
        console.log(`[v0] Invalid date string: ${dateStr}`)
        return false
      }
      
      // Create date objects for comparison (time set to midnight)
      const dateToCheck = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate())
      
      const isInRange = dateToCheck >= startDate && dateToCheck <= endDate
      
      console.log(`[v0] Checking date ${dateStr}:`)
      console.log(`[v0]   Date to check: ${dateToCheck.toISOString().split('T')[0]}`)
      console.log(`[v0]   Range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`)
      console.log(`[v0]   In range: ${isInRange}`)
      
      return isInRange
    },

    anunciosFiltrados () {
      const { start, end } = this.startEndFor(this.period)
      
      console.log(`[v0] Filtering anuncios for period: ${this.period}`)
      console.log(`[v0] Total anuncios before filtering: ${this.anuncios.length}`)
      
      const filtered = this.anuncios.filter(a => {
        const okPeriod = this.inRange(a.data, start, end)
        const okCanal  = this.canal === 'all' ? true : (a.canal === this.canal)
        
        if (okPeriod && okCanal) {
          console.log(`[v0] ✓ Anuncio included: ${a.data} (${a.canal})`)
        }
        
        return okPeriod && okCanal
      })
      
      console.log(`[v0] Filtered anuncios: ${filtered.length} of ${this.anuncios.length} total`)
      console.log(`[v0] Filtered dates: ${filtered.map(a => a.data).join(', ')}`)
      
      return filtered
    },

    pagamentosFiltrados () {
      const { start, end } = this.startEndFor(this.period)
      const pagosPer = this.pagamentos.filter(p => this.inRange(p.data_pagamento, start, end))
      if (this.canal === 'all') return pagosPer
      const idxAnuncio = new Map(this.anuncios.map(a => [a.id, a]))
      return pagosPer.filter(p => {
        const a = idxAnuncio.get(p.anuncio_id)
        return a ? a.canal === this.canal : false
      })
    },

    renderAll () {
      this.renderAdsByEstado()
      this.renderRevenueStack()
      this.renderDailyLine()
      this.renderHeatmap()
    },
    renderAdsByEstado () {
      const anns = this.anunciosFiltrados()
      const pend = anns.filter(a => (a.estado || '').toLowerCase() === 'pendente').length
      const conc = anns.filter(a => ['concluido','concluído'].includes((a.estado || '').toLowerCase())).length
      this.adsByEstadoData = {
        labels: ['Pendente', 'Concluído'],
        datasets: [{ data: [pend, conc], backgroundColor: ['#f59e0b', '#22c55e'] }]
      }
    },
    renderRevenueStack () {
      const canais = ['RCV', 'RCV+', 'TCV']
      const regioes = ['Barlavento', 'Sotavento']
      const idxAnuncio = new Map(this.anuncios.map(a => [a.id, a]))
      const sum = {}; regioes.forEach(r => sum[r] = { RCV:0, 'RCV+':0, TCV:0 })
      for (const p of this.pagamentosFiltrados()) {
        const a = idxAnuncio.get(p.anuncio_id); if (!a) continue
        if (!canais.includes(a.canal) || !regioes.includes(a.regiao)) continue
        sum[a.regiao][a.canal] += Number(p.valor_total) || 0
      }
      this.revenueStackData = {
        labels: canais,
        datasets: regioes.map((r,i)=>({ label:r, data:canais.map(c=>sum[r][c]), backgroundColor: i? '#10b981':'#3b82f6' }))
      }
    },
    renderDailyLine () {
      const pagos = this.pagamentosFiltrados()
      const { start, end } = this.startEndFor(this.period)
      const labels = []; const map = new Map()
      for (let d=new Date(start); d<=end; d.setDate(d.getDate()+1)) { const l=labelDia(d); map.set(l, labels.length); labels.push(l) }
      const valores = Array(labels.length).fill(0)
      for (const p of pagos) {
        const d = this.asDate(p.data_pagamento); const l = labelDia(d); const i = map.get(l)
        if (i !== undefined) valores[i] += Number(p.valor_total) || 0
      }
      this.dailyLineData = { labels, datasets:[{ data: valores, borderColor:'#6366f1', backgroundColor:'rgba(99,102,241,.15)', fill:true, pointRadius:2 }] }
    },
    renderHeatmap () {
      const anns = this.anunciosFiltrados()
      const horarios = [...new Set(anns.map(a => a.horario))].sort()
      const horas = horarios.length ? horarios : ['12:30','18:30']
      const dias = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']
      const count = {}; dias.forEach(d => (count[d] = {})); for (const h of horas) for (const d of dias) count[d][h] = 0
      for (const a of anns) {
        const d = this.asDate(a.data); const dia = diasPT[d.getDay()]
        if (count[dia] && count[dia][a.horario] !== undefined) count[dia][a.horario] += 1
      }
      const data=[]; let maxV=0
      dias.forEach(d => horas.forEach(h => { const v=count[d][h]; data.push({x:h,y:d,v}); if(v>maxV) maxV=v }))
      const color = (v) => !v ? 'rgba(99,102,241,0.06)' : `rgba(99,102,241,${Math.max(0.15, v/(maxV||1))})`
      this.heatmapData = { datasets:[{ label:'Contagem', data, backgroundColor: ctx=>color(ctx.raw.v), borderColor:'#fff', borderWidth:1,
        width: (ctx) => { const a=ctx.chart.chartArea; return (a.right-a.left)/horas.length - 3 },
        height:(ctx) => { const a=ctx.chart.chartArea; return (a.bottom-a.top)/dias.length - 3 } }] }
      this.heatmapOptions = { ...this.heatmapOptions, scales:{ x:{type:'category', position:'top', labels:horas}, y:{type:'category', reverse:true, labels:dias} } }
    }
  }
}
</script>

<style scoped>
.charts-wrap {
  padding: .5rem 1rem 1rem 1rem;
}

/* Filtros - reorganizados */
.filters {
  
  display: flex;
  justify-content: flex-end;
  margin-bottom: .5rem;
}
.filters-left {
  display: flex;
  gap: .5rem;
  align-items: center;
  
}


/* Estilo específico para os botões de período */
.periodo {
  display: flex;
  align-items: center;
}


/* Grid de gráficos (compacta) */
.grid-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
}

/* Card + caixa do gráfico com altura controlada */
.chart-card {
           /* ALTURA GLOBAL DOS CARDS */
  display: flex;
  flex-direction: column;
}
.card-title {
  font-weight: 700;
  font-size: 1rem;
}
.chart-box {
  flex: 1;
  min-height: 0;            /* permite o canvas ocupar todo o espaço disponível */
}
.chart {
  width: 100%;
  height: 100%;
}

::v-deep(.p-selectbutton .p-button) {
  font-size: .8rem;
  padding: .5rem 1rem;
  /* Outras customizações */
}

::v-deep( .p-dropdown .p-dropdown-label) {
  font-size: .8rem;
  padding: .5rem 0rem .5rem 1rem;
}

::v-deep(.p-selectbutton .p-button.p-highlight) {
  background-color: #3b82f6;
  color: white;
}

::v-deep(.custom-dropdown .p-dropdown-item.p-highlight) {
  font-size: .8rem;
  padding: .5rem 1rem;
  color: red;
  /* Outras customizações */
}

/* Breakpoints menores ainda mais compactos */
@media (max-width: 1100px) {
  .chart-card { height: 280px; }
}
@media (max-width: 600px) {
  .chart-card { height: 240px; }
  
  /* Ajuste para telas pequenas */
  .filters-left {
    flex-direction: column;
    align-items: flex-end;
  }
}
</style>
