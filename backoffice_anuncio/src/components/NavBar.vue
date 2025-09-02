<template>
  <nav>
    <ul>
      <span class="title">{{ formatarTitulo(tabela) }}</span>
      <li><div class="search_bar"><div class="icon_search"></div></div></li>
      <li><div class="icon icon_notification"><div class="notification_count">9</div></div></li>
      <li>
        <div class="icon" id="icon_user"></div>
        <div class="user_info">
          <span class="user_name">{{ userName }}</span>
          <span class="user_role">{{ getPerfilNome(userPerfilId) }}</span>
        </div>
      </li>
      <li>
        <div class="icon btn_logout" @click="logout"></div>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  props: ['tabela'],
  data() {
    return {
      userName: '',
      userPerfilId: null
    };
  },
  created() {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      this.userName = parsed.nome || 'Utilizador';
      this.userPerfilId = parsed.perfil_id || null;
    }
  },
  methods: {
    formatarTitulo(tabela) {
      if (!tabela) return 'Dashboard';

      const especiais = {
        dashboard: 'Dashboard',
        settings: 'Settings'
      };

      if (especiais[tabela.toLowerCase()]) {
        return especiais[tabela.toLowerCase()];
      }

      return tabela
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    },
    getPerfilNome(perfilId) {
      const perfis = {
        1: "Utilizador",
        2: "Gestor",
        3: "Administrador"
      };
      return perfis[perfilId] || "Perfil indefinido";
    },
    logout() {
      localStorage.removeItem('user');
      location.reload(); // recarrega para forçar logout visualmente
    }
  }
};
</script>

<style scoped>
nav {
    position: relative;
    width: 100%; 
    color: #333;
    padding: 0.5rem 0rem;
    box-sizing: border-box;
}
ul {
    display: flex;
    align-items: center;
    justify-content: end;
    margin: 0;
    padding: 0;
}
li {
    display: flex;
    align-items: center;
    margin-right: 1rem;
    cursor: pointer;
}
.user_info {
    display: flex;
    flex-direction: column;
    align-items: start;
    color: #333;
    margin-left: 0.4rem;
}
.user_name {
    font-weight: 100;
    font-size: 0.8rem;
    color: #333;
}
.user_role {
    font-weight: 100;
    font-size: 0.65rem;
    color: #333333c6;
}
.icon {
    width: 1.2rem;
    height: 1.2rem;
    background-size: contain;
    background-repeat: no-repeat;
    cursor: pointer;
}
#icon_user {
    background-image: url('../assets/user.png');
  
}
.icon_notification{
    position: relative;
    background-image: url('../assets/notification.png');
}
.notification_count {
    position: absolute;
    bottom: 0.5rem;
    left: 0.6rem;
    background-color: #ff5757;
    color: #e7e7e7;
    border-radius: 50%;
    padding: 0.1rem 0.3rem;
    font-size: 0.7rem;
    box-shadow: 0 0 5px #ff5757;
}
.title{
   position: absolute;
   left: 1.5rem;
}
.search_bar{
    border: #333 1px solid;
    padding: 0.4rem 1rem;
    border-radius: 1rem;
    width: 10rem;
    height: 1rem;
}
.icon_search{
    background-size: contain;
    background-repeat: no-repeat;
    background-image: url('../assets/search.png');
    width: 1rem;
    height: 1rem;
}
.btn_logout {
  background-image: url('../assets/logout.png');
}

/* Responsividade */
/* @media (max-width: 1200px) {
    .search_bar {
        width: 7rem;
    }
    .title {
        font-size: 1.1rem;
    }
    li {
        margin-right: 0.7rem;
    }
}
@media (max-width: 900px) {
    nav {
        padding: 0.3rem 0;
    }
    .search_bar {
        width: 5rem;
        padding: 0.3rem 0.7rem;
    }
    .title {
        font-size: 1rem;
        left: 1rem;
    }
    .user_name, .user_role {
        font-size: 0.7rem;
    }
    #icon_user {
        width: 1.2rem;
        height: 1.1rem;
    }
} */
@media (max-width: 700px) {
    .title {
        position: static;
        margin-right: auto;
        margin-left: 0.5rem;
        font-size: 0.95rem;
    }
    li {
        margin-right: 0.5rem;
    }
    .search_bar {
        width: 100%;
        min-width: 4rem;
        max-width: 8rem;
    }
}
@media (max-width: 500px) {
    nav {
        min-height: 2.5rem;
    }
    .title {
        font-size: 0.85rem;
        margin-left: 0.2rem;
    }
    .user_info {
        margin-left: 0.2rem;
    }
    .user_name, .user_role {
        font-size: 0.6rem;
    }
    .search_bar {
        padding: 0.2rem 0.4rem;
        font-size: 0.8rem;
    }
    .icon, #icon_user {
        width: 0.9rem;
        height: 0.9rem;
    }
}
</style>
