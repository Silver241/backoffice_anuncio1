<template>
  <div class="dropdown-wrapper">
    <div class="dropdown-header" @click="toggleDropdown">
      <div class="icon"></div>
      <span>Tables</span>
      <div class="arrow" :class="{ open: dropdownOpen }"></div>
    </div>
    <transition name="dropdown">
      <div v-show="dropdownOpen" class="dropdown-options">
        <div
          class="dropdown-option"
          v-for="option in options"
          :key="option"
          @click="$emit('tabelaSelecionada', option.toLowerCase())"
        >
          {{ option }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'DropdownTables',
  data() {
    return {
      dropdownOpen: false,
      options: ['anuncios', 'cartoes', 'faturas', 'minutas', 'pagamentos', 'perfis', 'users', 'user_cartoes']
    };
  },
  methods: {
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    }
  }
};
</script>

<style scoped>
.dropdown-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.dropdown-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 100%;
  color: #c4c5c8;
  font-size: 14px;
  border-radius: 0.2rem;
  height: 100%;
  padding: 0.5rem 0rem;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}
.dropdown-header:hover {
  background-color: rgba(47, 126, 245, 0.1);
  box-shadow: 0 0 1px rgba(47, 126, 245, 0.2);
} 

.icon {
  
  width: 1.1rem;
  height: 1.1rem;
  background-image: url('../assets/table.png');
  background-size: contain;
  background-repeat: no-repeat;
  margin-right: 1rem;
  margin-left: 0.8rem;
}

.arrow {
  width: 0.8rem;
  height: 0.8rem;
  background-image: url('../assets/arrow.png');
  background-size: contain;
  background-repeat: no-repeat;
  margin-left: auto;
  margin-right: 1rem;
  transform: rotate(0deg);
  transition: transform 0.3s ease;
}
.arrow.open {
  transform: rotate(180deg); 
}

.dropdown-options {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: 0.3rem;
  margin-left: 1.5rem; /* alinha com texto */
}

.dropdown-option {
  border-radius: 0.2rem;
  padding: 0.3rem 2rem 0.3rem 1.5rem;
  font-size: 13px;
  color: #a0a0a0;
  cursor: pointer;
  transition: color 0.3s ease, background-color 0.3s ease;
  
}

.dropdown-option:hover {
  color: #ffffff;
  background-color: rgba(47, 126, 245, 0.1);
  box-shadow: 0 0 1px rgba(47, 126, 245, 0.2);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.dropdown-enter-to,
.dropdown-leave-from {
  max-height: 500px; /* valor grande suficiente para conter todas as opções */
  opacity: 1;
}

/* Responsividade para telas médias e grandes */
/* @media (max-width: 1200px) {
.icon{
  width: 0.9rem;
  height: 0.9rem;
  margin-right: 0.7rem;
  margin-left: 0.3rem;
}
 
  .arrow {
    width: 0.7rem;
    height: 0.7rem;
    margin-right: 0.7rem;
  }
  .dropdown-option {
    font-size: 12px;
    padding: 0.25rem 1.5rem 0.25rem 1rem;
  }
  .dropdown-options {
    margin-left: 1rem;
  }
  .dropdown-header{
    font-size: 13px;
  }
} */

/* @media (max-width: 900px) {
  .icon{
  width: 0.7rem;
    height: 0.7rem;
    margin-right: 0.3rem;
    margin-left: 0.2rem;
}
  .arrow {
    width: 0.6rem;
    height: 0.6rem;
    margin-right: 0.1rem;
  }
  .dropdown-option {
    font-size: 11px;
    padding: 0.2rem 1rem 0.2rem 0.7rem;
  }
  .dropdown-options {
    margin-left: 0.7rem;
  }
   .dropdown-header{
     font-size: 12px;
  }
} */

@media (max-width: 700px) {
  
  .icon{
  width: 0.9rem;
  height: 0.9rem;
  margin-right: 0.7rem;
  margin-left: 0.3rem;
}
 
  .arrow {
    width: 0.7rem;
    height: 0.7rem;
    margin-right: 0.7rem;
  }
  .dropdown-option {
    font-size: 12px;
    padding: 0.25rem 1.5rem 0.25rem 1rem;
  }
  .dropdown-options {
    margin-left: 1rem;
  }
  .dropdown-header{
    font-size: 13px;
  }
}

@media (max-width: 500px) {
  
  .arrow {
    width: 0.4rem;
    height: 0.4rem;
    margin-right: 0.1rem;
  }
  .dropdown-option {
    font-size: 9px;
    padding: 0.1rem 0.4rem 0.1rem 0.2rem;
  }
  .dropdown-options {
    margin-left: 0.1rem;
  }
  .dropdown-header{
     font-size: 8px;
  }
}

</style>