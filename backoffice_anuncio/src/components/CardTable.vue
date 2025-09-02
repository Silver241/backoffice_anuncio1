<template>
  <div>
    <div class="card-table">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th v-for="(coluna, i) in colunasVisiveis" :key="i" :class="columnClass(coluna)">
              {{ rotuloColuna(coluna) }}
            </th>
            <th>
              <div class="button" id="add_img" @click="abrirCriar"></div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading">
            <td :colspan="colunasVisiveis.length + 2" class="text-center">A carregar…</td>
          </tr>

          <tr v-for="(item, index) in dados" :key="item.id">
            <td>{{ (paginaAtual - 1) * pageSize + index + 1 }}</td>

            <td
              v-for="coluna in colunasVisiveis"
              :key="coluna"
              :class="columnClass(coluna)"
              :title="String(valorApresentacao(item, coluna))"
            >
              {{ valorApresentacao(item, coluna) }}
            </td>

            <td class="acoes">
              <div class="button" id="update_img" @click="editar(item)"></div>
              <div class="button" id="delete_img" @click="eliminar(item.id)"></div>
            </td>
          </tr>

          <tr v-if="!loading && dados.length === 0">
            <td :colspan="colunasVisiveis.length + 2" class="text-center">Sem resultados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="paginacao-externa" v-if="total > pageSize">
      <span>Total: {{ total }} | Página {{ paginaAtual }} de {{ totalPaginas }}</span>
      <div class="controls">
        <button :disabled="paginaAtual === 1" @click="irParaPagina(1)">&laquo;</button>
        <button :disabled="paginaAtual === 1" @click="irParaPagina(paginaAtual - 1)">&lt;</button>

        <button
          v-for="p in paginasVisiveis"
          :key="p"
          :class="['num', { active: p === paginaAtual }]"
          @click="irParaPagina(p)"
        >{{ p }}</button>

        <button :disabled="paginaAtual === totalPaginas" @click="irParaPagina(paginaAtual + 1)">&gt;</button>
        <button :disabled="paginaAtual === totalPaginas" @click="irParaPagina(totalPaginas)">&raquo;</button>
      </div>
    </div>

    <!-- Popup Add/Editar -->
    <AddPopup
      v-if="mostrarPopup"
      :key="popupKey"
      :titulo="tabela"
      :colunas="colunasForm"
      :registro="registroEdicao"
      @fechar="fecharPopup"
      @salvou="aoSalvar"
    />
  </div>
</template>

<script>
import AddPopup from './AddPopup.vue';

export default {
  name: 'CardTable',
  props: ['tabela'],
  components: { AddPopup },
  data() {
    return {
      dados: [],
      total: 0,
      paginaAtual: 1,
      pageSize: 20,
      totalPaginas: 1,
      nextUrl: null,
      prevUrl: null,
      colunasOriginais: [],
      colunasVisiveis: [],
      mostrarPopup: false,
      registroEdicao: null,
      popupKey: 0,
      loading: false,

      relMap: {
        perfil_id:   { nested: 'perfil',    field: 'tipo' },
        minuta_id:   { nested: 'minuta',    field: 'tipo' },
        user_id:     { nested: 'user',      field: 'nome' },
        pagamento_id:{ nested: 'pagamento', field: 'valor_total' },
        anuncio_id:  { nested: 'anuncio',   field: 'conteudo' },
        cartao_id:   { nested: 'cartao',    field: 'numero' },
      }
    };
  },
  watch: {
    tabela: {
      immediate: true,
      handler() { this.paginaAtual = 1; this.buscarDados(); }
    }
  },
  computed: {
    paginasVisiveis() {
      const max = 5;
      let start = Math.max(1, this.paginaAtual - Math.floor(max / 2));
      let end = Math.min(this.totalPaginas, start + max - 1);
      start = Math.max(1, end - max + 1);
      const arr = [];
      for (let p = start; p <= end; p++) arr.push(p);
      return arr;
    },
    // Colunas que o formulário deve usar (sem objetos aninhados e sem id/password)
    colunasForm() {
      const cols = [...this.colunasOriginais];
      const baseHasId = new Set(cols.filter(c => /_id$/.test(c)).map(c => c.replace(/_id$/, '')));
      return cols.filter(c => {
        if (c === 'id' || c === 'password') return false;
        if (baseHasId.has(c) && !/_id$/.test(c)) return false; // esconde 'minuta', 'user', etc
        return true;
      });
    }
  },
  methods: {
    abrirCriar() {
      this.registroEdicao = null;
      this.mostrarPopup = true;
      this.popupKey++;
    },

    columnClass(coluna) {
      const n = String(coluna).toLowerCase();
      const isLong  = /(conteudo|conteúdo|descricao|descrição|mensagem|observac|observação|texto|address|endereco|endereço)/.test(n);
      const isEmail = /email/.test(n);
      const isSmall = /(id|vezes|canal|regiao|região|estado|data|horario|horário|mm|yy|cvv)/.test(n);
      return { 'col-long': isLong, 'col-email': isEmail, 'col-small': isSmall };
    },

    rotuloColuna(coluna) {
      return coluna.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\bId\b$/i, '').trim();
    },

    valorApresentacao(item, coluna) {
      const v = item?.[coluna];
      if (/_id$/.test(coluna)) {
        const map = this.relMap[coluna];
        const base = coluna.replace(/_id$/, '');
        if (map && item[map.nested]) {
          const val = item[map.nested]?.[map.field];
          if (val !== undefined && val !== null && val !== '') return val;
        }
        if (item[base] && typeof item[base] === 'object') {
          const obj = item[base];
          const prefer = ['tipo', 'nome', 'conteudo', 'valor_total', 'numero'];
          for (const k of prefer) if (obj[k] != null && obj[k] !== '') return obj[k];
        }
        return v ?? '—';
      }
      if (v && typeof v === 'object') {
        const prefer = ['tipo', 'nome', 'conteudo', 'valor_total', 'numero'];
        for (const k of prefer) if (v[k] != null && v[k] !== '') return v[k];
        return '—';
      }
      return v ?? '—';
    },

    async buscarDados() {
      if (!this.tabela) return;
      this.loading = true;
      try {
        const url = new URL(`http://127.0.0.1:8000/${this.tabela}/`);
        url.searchParams.set('page', this.paginaAtual);
        url.searchParams.set('page_size', this.pageSize);

        const response = await fetch(url.toString());
        const data = await response.json();

        const resultados = Array.isArray(data) ? data : (data.results ?? []);
        this.dados = resultados;
        this.total = data.count ?? resultados.length ?? 0;
        this.nextUrl = data.next ?? null;
        this.prevUrl = data.previous ?? null;
        this.totalPaginas = Math.max(1, Math.ceil(this.total / this.pageSize));

        this.colunasOriginais = resultados.length ? Object.keys(resultados[0]) : [];
        this.definirColunasVisiveis();

        if (!this.loading && this.dados.length === 0 && this.paginaAtual > 1) {
          this.paginaAtual--; return this.buscarDados();
        }
      } catch (e) {
        console.error('Erro ao buscar dados:', e);
        this.dados = []; this.colunasOriginais = []; this.colunasVisiveis = [];
        this.total = 0; this.totalPaginas = 1;
      } finally { this.loading = false; }
    },

    irParaPagina(p) {
      const alvo = Math.min(Math.max(1, p), this.totalPaginas);
      if (alvo !== this.paginaAtual) { this.paginaAtual = alvo; this.buscarDados(); }
    },

    definirColunasVisiveis() {
      const ignorar = new Set(['id', 'password']);
      const cols = [...this.colunasOriginais];
      const baseHasId = new Set(cols.filter(c => /_id$/.test(c)).map(c => c.replace(/_id$/, '')));
      this.colunasVisiveis = cols.filter(c => {
        if (ignorar.has(c)) return false;
        if (baseHasId.has(c) && !/_id$/.test(c)) return false; // esconde objeto se existir *_id
        return true;
      });
    },

    editar(item) {
      this.registroEdicao = item;
      this.mostrarPopup = true;
      this.popupKey++;
    },

    async eliminar(id) {
      try {
        const resp = await fetch(`http://127.0.0.1:8000/${this.tabela}/delete/${id}/`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('Erro ao eliminar');
        this.buscarDados();
      } catch (error) { console.error(error); }
    },

    fecharPopup() {
      this.mostrarPopup = false;
      this.registroEdicao = null;
    },

    aoSalvar() {
      this.fecharPopup();
      this.paginaAtual = 1;
      this.buscarDados();
    }
  }
};
</script>

<style scoped>
.card-table {
  position: relative;
  font-size: 0.8rem;
  top: 2rem;
  left: 2rem;
  width: calc(100vw - 16.5rem);
  overflow-x: hidden;
  background-color: #fff;
  border-radius: 0.7rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
table { width: 100%; border-collapse: collapse; table-layout: fixed; }
thead { background-color: #333; color: #fff; font-weight: 100; }
th, td {
  text-align: left; padding: 0.1rem 0.5rem;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  border-bottom: 1px solid #eee; max-width: 20ch;
}
th.col-long, td.col-long   { max-width: 100ch; }
th.col-email, td.col-email { max-width: 32ch; }
th.col-small, td.col-small { max-width: 10ch; }
td:first-child, th:first-child {
  position: sticky; left: 0; color: #fff; background-color: #333; z-index: 1;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  width: 40px; min-width: 40px; max-width: 40px; text-align: center;
}
td.acoes, th:last-child { width: 3.5rem; min-width: 3.5rem; max-width: 3.5rem; text-align: center; }
td.acoes { display: flex; gap: 1rem; align-items: center; }
.button { width: 0.9rem; height: 0.9rem; cursor: pointer; }
#delete_img { background-image: url('../assets/delete.png'); background-size: cover; background-position: center; }
#update_img { background-image: url('../assets/update.png'); background-size: cover; background-position: center; }
#add_img    { margin-left: 1.9rem; background-image: url('../assets/add.png'); background-size: cover; background-position: center; }

.paginacao-externa {
  display: flex; align-items: center; justify-content: space-between;
  gap: .5rem; padding: .8rem 1rem 0; font-size: .85rem; margin-top: 2rem;
}
.paginacao-externa .controls { display: flex; gap: .4rem; flex-wrap: wrap; }
.paginacao-externa button {
  border: 1px solid #ccc; padding: .25rem .5rem; border-radius: .35rem;
  cursor: pointer; background: #fff;
}
.paginacao-externa button:disabled { opacity: .5; cursor: not-allowed; }
.paginacao-externa .num.active { font-weight: 700; text-decoration: underline; }

@media (max-width:1200px) {
  .card-table { left: 2rem;  width: calc(100vw - 16.5rem);/* border-radius: 0.6rem; */ }
  /* th, td { padding: 0.2rem 0.4rem; font-size: 0.7rem; } */
}
@media (max-width:900px) {
  .card-table { left: 1rem; width: calc(100vw - 15.5rem); /* border-radius: 0.6rem; */ }
/*   th, td { padding: 0.2rem 0.4rem; font-size: 0.7rem; }
  .button { width: 0.7rem; height: 0.7rem; } */
  #add_img { margin-left: 1.7rem; }
}
@media (max-width:700px) {
  .card-table { left: 0.5rem; width: calc(100vw - 13rem);/*  border-radius: 0.4rem; */ }
}
</style>
