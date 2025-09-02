<template>
  <div class="popup-backdrop" @click.self="$emit('fechar')">
    <div class="popup-content" :class="{ wide: isSplit }">
      <h2>{{ isEditing ? 'Editar' : 'Adicionar' }} {{ titulo }}</h2>
      <div class="btn_fechar" @click="$emit('fechar')"></div>

      <form @submit.prevent="submeterFormulario">
        <div v-if="!isSplit">
          <ul class="field-list">
            <li v-for="campo in campos" :key="campo">
              <select
                v-if="choices[campo]"
                class="input"
                v-model="formulario[campo]"
                required
              >
                <option value="" disabled hidden>Selecione {{ formatarPlaceholder(campo) }}</option>
                <option v-for="opcao in choices[campo]" :key="opcao" :value="opcao">{{ opcao }}</option>
              </select>

              <select
                v-else-if="isRelacional(campo)"
                class="input"
                v-model.number="formulario[campo]"
                :required="!(titulo === 'anuncios' && campo === 'user_id')"
                @change="onRelacionalChange(campo)"
              >
                <option value="" disabled hidden>Selecione {{ formatarPlaceholder(campo) }}</option>
                <option v-for="op in (opcoesRelacionadas[campo] || [])" :key="op.id" :value="op.id">
                  {{ op.__label }}
                </option>
              </select>

              <input
                v-else
                class="input"
                :type="tipoInput(campo)"
                :placeholder="formatarPlaceholder(campo)"
                v-model="formulario[campo]"
                required
              />
            </li>
          </ul>
        </div>

        <div v-else class="two-cols">
          <ul class="field-list">
            <li v-for="campo in col1Campos" :key="campo">
              <select v-if="choices[campo]" class="input" v-model="formulario[campo]" required>
                <option value="" disabled hidden>Selecione {{ formatarPlaceholder(campo) }}</option>
                <option v-for="opcao in choices[campo]" :key="opcao" :value="opcao">{{ opcao }}</option>
              </select>

              <select
                v-else-if="isRelacional(campo)"
                class="input"
                v-model.number="formulario[campo]"
                :required="!(titulo === 'anuncios' && campo === 'user_id')"
                @change="onRelacionalChange(campo)"
              >
                <option value="" disabled hidden>Selecione {{ formatarPlaceholder(campo) }}</option>
                <option v-for="op in (opcoesRelacionadas[campo] || [])" :key="op.id" :value="op.id">
                  {{ op.__label }}
                </option>
              </select>

              <input v-else class="input" :type="tipoInput(campo)" :placeholder="formatarPlaceholder(campo)" v-model="formulario[campo]" required />
            </li>
          </ul>

          <ul class="field-list">
            <li v-for="campo in col2Campos" :key="campo">
              <select v-if="choices[campo]" class="input" v-model="formulario[campo]" required>
                <option value="" disabled hidden>Selecione {{ formatarPlaceholder(campo) }}</option>
                <option v-for="opcao in choices[campo]" :key="opcao" :value="opcao">{{ opcao }}</option>
              </select>

              <select
                v-else-if="isRelacional(campo)"
                class="input"
                v-model.number="formulario[campo]"
                :required="!(titulo === 'anuncios' && campo === 'user_id')"
                @change="onRelacionalChange(campo)"
              >
                <option value="" disabled hidden>Selecione {{ formatarPlaceholder(campo) }}</option>
                <option v-for="op in (opcoesRelacionadas[campo] || [])" :key="op.id" :value="op.id">
                  {{ op.__label }}
                </option>
              </select>

              <input v-else class="input" :type="tipoInput(campo)" :placeholder="formatarPlaceholder(campo)" v-model="formulario[campo]" required />
            </li>
          </ul>
        </div>

        <button class="btn_adicionar" :class="{ editar: isEditing }" type="submit">
          {{ isEditing ? 'Editar' : 'Adicionar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

const RELATION_ENDPOINTS = {
  perfil_id: 'perfis',
  user_id: 'users',
  minuta_id: 'minutas',
  anuncio_id: 'anuncios',
  cartao_id: 'cartoes',
  pagamento_id: 'pagamentos',
};

const RELATION_LABELS = {
  perfis: 'tipo',
  users: 'nome',
  minutas: 'tipo',
  anuncios: 'conteudo',
  cartoes: 'numero',
  pagamentos: 'valor_total'
};

export default {
  name: 'AddPopup',
  props: {
    titulo: String,
    colunas: Array,          // já vem filtradas do CardTable
    registro: { type: Object, default: null }
  },
  data() {
    return {
      formulario: {},
      opcoesRelacionadas: {},
      choices: {
        horario: ['12:30', '18:30'],
        regiao: ['Barlavento', 'Sotavento'],
        canal: ['RCV', 'RCV+', 'TCV'],
        estado: ['Pendente', 'Concluído'],
        vezes: [1, 2, 3, 4, 5],
      },
    };
  },
  computed: {
    campos() { return this.colunas.filter(c => c !== 'id'); },
    isSplit() { return this.campos.length > 11; },
    col1Campos() { return this.isSplit ? this.campos.slice(0, 6) : this.campos; },
    col2Campos() { return this.isSplit ? this.campos.slice(6, 12) : []; },
    isEditing() { return !!(this.registro && this.registro.id); }
  },
  created() {
    // inicializa
    this.campos.forEach(campo => { this.formulario[campo] = ''; });
    if (this.isEditing) this.preencherComRegistro(this.registro);
    this.carregarRelacoes();
  },
  watch: {
    registro(novo) {
      this.campos.forEach(campo => { this.formulario[campo] = ''; });
      if (novo && novo.id) this.preencherComRegistro(novo);
    }
  },
  methods: {
    preencherComRegistro(reg) {
      this.campos.forEach((campo) => {
        if (/_id$/.test(campo)) {
          if (reg[campo] != null) {
            this.formulario[campo] = reg[campo];
          } else {
            const base = campo.replace(/_id$/, '');
            if (reg[base] && reg[base].id != null) this.formulario[campo] = reg[base].id;
          }
        } else {
          this.formulario[campo] = reg[campo] ?? '';
        }
      });
    },

    formatarPlaceholder(campo) { return campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); },
    isRelacional(campo) { return campo.endsWith('_id'); },
    endpointParaCampo(campo) {
      if (RELATION_ENDPOINTS[campo]) return RELATION_ENDPOINTS[campo];
      const base = campo.replace(/_id$/, '');
      return base.endsWith('s') ? base : `${base}s`;
    },
    labelKeyParaEndpoint(endpoint) { return RELATION_LABELS[endpoint] || null; },
    tipoInput(campo) {
      const c = campo.toLowerCase();
      if (c.includes('email')) return 'email';
      if (c.includes('password')) return 'password';
      if (c.includes('valor') || c === 'vezes') return 'number';
      if (c.startsWith('data')) return 'date';
      return 'text';
    },
    criarRotulo(item, labelKey) {
      if (labelKey && item[labelKey] != null && item[labelKey] !== '') {
        if (labelKey === 'valor_total') return String(item[labelKey]);
        if (labelKey === 'numero') return String(item[labelKey]);
        return item[labelKey];
      }
      if (item.nome) return item.nome;
      if (item.tipo) return item.tipo;
      if (item.numero) return `****${String(item.numero).slice(-4)}`;
      if (item.valor_total != null) return String(item.valor_total);
      return `#${item.id}`;
    },
    normalizarRespostaLista(data) {
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return [];
    },
    async carregarRelacoes() {
      const relacionais = this.campos.filter(this.isRelacional);
      if (!relacionais.length) return;

      await Promise.all(relacionais.map(async (campo) => {
        const endpoint = this.endpointParaCampo(campo);
        const labelKey = this.labelKeyParaEndpoint(endpoint);
        try {
          const { data } = await axios.get(`${API_BASE}/${endpoint}/`);
          const lista = this.normalizarRespostaLista(data);
          const normalizado = lista.map(item => ({
            id: item.id,
            __label: this.criarRotulo(item, labelKey),
            _raw: item,
          }));
          this.$set ? this.$set(this.opcoesRelacionadas, campo, normalizado)
                    : (this.opcoesRelacionadas[campo] = normalizado);
        } catch (e) {
          console.error(`Erro ao carregar ${endpoint}:`, e);
          this.opcoesRelacionadas[campo] = [];
        }
      }));
    },

    onRelacionalChange(campo) {
      if (this.titulo === 'anuncios' && campo === 'user_id') {
        const userId = this.formulario.user_id;
        const lista = this.opcoesRelacionadas.user_id || [];
        const selecionado = lista.find(x => x.id === userId);
        if (selecionado && selecionado._raw) {
          const u = selecionado._raw;
          this.formulario.nome = u.nome || '';
          this.formulario.email = u.email || '';
          this.formulario.telefone = u.telefone || '';
        } else {
          this.formulario.nome = '';
          this.formulario.email = '';
          this.formulario.telefone = '';
        }
      }
    },

    async submeterFormulario() {
      try {
        if (this.isEditing) {
          const resp = await fetch(`${API_BASE}/${this.titulo}/update/${this.registro.id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.formulario)
          });
          if (!resp.ok) throw new Error(JSON.stringify(await resp.json()));
          alert('Registo atualizado com sucesso!');
        } else {
          const resp = await fetch(`${API_BASE}/${this.titulo}/create/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.formulario)
          });
          if (!resp.ok) throw new Error(JSON.stringify(await resp.json()));
          alert('Registo adicionado com sucesso!');
        }
        this.$emit('salvou');
      } catch (erro) {
        alert('Erro ao salvar: ' + (erro.message || erro));
      }
    }
  }
};
</script>

<style scoped>
.popup-backdrop {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4);
  display: flex; align-items: center; justify-content: center; z-index: 999;
}
.popup-content {
  position: relative; background: white; padding: 2rem; border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); width: 25rem; max-width: 90vw;
}
.popup-content.wide { width: 48rem; }
.btn_fechar {
  position: absolute; width: 0.7rem; height: 0.7rem; top: 1rem; right: 1rem; cursor: pointer;
  background-image: url('../assets/close.png'); background-size: contain; background-repeat: no-repeat; background-position: center;
}

.two-cols { display: flex; gap: 1rem; }
.field-list { list-style: none; padding: 0; margin: 0 0 0.5rem 0; width: 100%; }
.field-list li { margin-bottom: 0.35rem; }

.input {
  width: 100%; padding: 0.5rem; margin-bottom: 0.3rem; border: 1px solid #ccc;
  border-radius: 0.5rem; font-size: 1rem; transition: border-color 0.3s, box-shadow 0.3s; box-sizing: border-box;
}
.input:focus { border-color: #707070; box-shadow: #707070 0 0 0.2rem; outline: none; }

.btn_adicionar {
  width: 100%; padding: 0.7rem; background-color: #3f51b5; color: white; text-align: center;
  border-radius: 0.5rem; cursor: pointer; font-weight: bold; transition: background-color 0.3s;
}
.btn_adicionar:hover { background-color: #303f9f; }

/* estado Edição */
.btn_adicionar.editar { background-color: #f0c419; color: #222; }
.btn_adicionar.editar:hover { background-color: #e0b20b; }

/* Selects */
select.input { color: #333; }
select.input:invalid { color: #707070; }
select.input option { color: #333; }
</style>
