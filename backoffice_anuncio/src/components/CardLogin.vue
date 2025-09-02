<template>
  <div v-if="!isLoggedIn" class="div_background">
    <div class="div_form">
      <a class="logo" href="/"></a>
      <h1 class="title">Login</h1>
      <form class="form_estructure" @submit.prevent="handleLogin">
        <input
          class="input_text"
          placeholder="Email*"
          type="text"
          v-model="email"
          required
        />
        <input
          class="input_text"
          placeholder="Senha*"
          type="password"
          v-model="password"
          required
        />
        <a class="btn_esqueceu_senha" href="/signup">Esqueceu a senha?</a>
        <button class="btn_submit" type="submit">Login</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CardLogin',
  data() {
    return {
      email: '',
      password: '',
      isLoggedIn: false
    };
  },
  created() {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);

      // Só mantém a sessão se perfil_id for 3
      if (parsedUser.perfil_id === 3) {
        this.isLoggedIn = true;
        this.email = parsedUser.email;
      } else {
        localStorage.removeItem('user');
      }
    }
  },
  methods: {
    async handleLogin() {
      try {
        const response = await axios.post('http://127.0.0.1:8000/users/login/', {
          email: this.email,
          password: this.password
        });

        // Valida se perfil_id é 3
        if (response.data.perfil_id !== 3) {
          alert('Acesso não autorizado. Apenas utilizadores com perfil permitido podem entrar.');
          return;
        }

        // Armazena o utilizador no localStorage
        this.isLoggedIn = true;
        localStorage.setItem('user', JSON.stringify(response.data));

        // Emite evento de login com sucesso
        this.$emit('loginSuccess');

      } catch (error) {
        let msg = 'Erro ao fazer login: ';
        if (error.response?.data) {
          msg += JSON.stringify(error.response.data);
        } else {
          msg += error.message;
        }
        alert(msg);
      }
    }
  }
};
</script>


<style scoped>
.div_background {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #1a1d2e, #1c2b3a, #141414);
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
}

.div_form {
  position: absolute;
  top: 47%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  width: 24rem;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  z-index: 10;
}

.logo {
  background-image: url('../assets/speaker.png');
  background-size: contain;
  background-repeat: no-repeat;
  width: 3rem;
  height: 3rem;
  margin-bottom: 0.5rem;
}

.title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.form_estructure {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input_text {
  padding: 0.8rem 1rem;
  border: 1px solid #444;
  background-color: #2a2a3d;
  color: #eee;
  border-radius: 0.8rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.input_text:focus {
  border-color: #4a90e2;
  background-color: #2e2e45;
  box-shadow: 0 0 3px rgba(92, 107, 192, 0.5);
}

.btn_esqueceu_senha {
  font-size: 0.75rem;
  color: #1f63a3;
  text-align: left;
  margin-top: -0.5rem;
  text-decoration: underline;
}

.btn_submit {
  background-color: #3f51b5;
  color: white;
  padding: 0.8rem;
  width: 100%;
  border: none;
  border-radius: 2rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s ease;
}

.btn_submit:hover {
  background-color: #5c6bc0;
  box-shadow: 0 0 3px rgba(92, 107, 192, 0.5);
}
</style>
