<!-- SideBar.vue -->
<template>
  <div class="div_side_bar">
    <div class="logo">
      <div class="logo_image"></div>
      <h1>Anuncia Li</h1>
    </div>
    <ul>
      <li class="li_sidebar li_hover" @click="$emit('selecionarTabela', 'dashboard')">
        <div class="icones" id="dashboard"></div>
        <span>Dashboard</span>
      </li>
      <li class="li_sidebar">
        <DropdownTables @tabelaSelecionada="$emit('selecionarTabela', $event)" />
      </li>
      <li class="li_sidebar li_hover" @click="$emit('selecionarTabela', 'settings')">
        <div class="icones" id="settings"></div>
        <span>Settings</span>
      </li>
    </ul>
  </div>
</template>


<script>
import DropdownTables from './DropdownTables.vue';
export default {
  name: 'SideBar',
  components: {
    DropdownTables
  }
};
</script>

<style scoped>
.div_side_bar {
    position: fixed;/*  */
    top: 0rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 13rem;
    background-color: #222831;
    margin-top: 0rem;
    height: 100%;
}
.div_side_bar .logo {
    margin-top: 1rem;
    display: flex;
    align-items: center;
    border-bottom: 0.01rem solid #393E46;
    width: 11.5rem;
    padding-bottom: 1rem;
}
.div_side_bar .logo_image {
    width: 1.5rem;
    height: 1.5rem;
    background-image: url('../assets/speaker.png');
    background-size: contain;
    background-repeat: no-repeat;
    margin-right: 0.8rem;
    margin-left: 1rem;
}
h1 {
    color: #EEEEEE;
    font-size: 1.3rem;
    margin: 0rem;
    padding: 0rem;
    font-weight: 100;
    font-size: 1.1rem;
}
.li_sidebar {
    display: flex;
    align-items: center;
    
    color: #c4c5c8;
    font-size: 0.9rem;
    cursor: pointer;
    margin-top: 1rem;
    width: 11.5rem;
    border-radius: 0.2rem;
    transition: opacity 0.3s ease;
    font-size: 14px;
    transition: background-color 0.3s ease;
}
.li_hover{
    padding: 0.5rem 0rem;
}


.li_hover:hover {
   /*  background-color: #00ADB5; */
    background-color: rgba(47, 126, 245, 0.1);
    box-shadow: 0 0 1px rgba(47, 126, 245, 0.2);
}
.li_sidebar .icones {
    width: 1.1rem;
    height: 1.1rem;
    background-size: contain;
    background-repeat: no-repeat;
    margin-right: 1rem;
    margin-left: 0.8rem;                                                                                                                                      
}
#dashboard {
    background-image: url('../assets/dashboard.png');
}
#settings {
    background-image: url('../assets/setting.png');
}

/* Responsividade para telas médias e grandes */
/* @media (max-width: 1200px) {
    .div_side_bar {
        
        width: 11rem;
        min-width: 11rem;
        max-width: 11rem;
    }
    .div_side_bar .logo {
        width: 9.5rem;
    }
    
    .div_side_bar .logo_image {
        width: 1.2rem;
        height: 1.2rem;
        margin-left: 0.5rem;
    }
    h1 {
        font-size: 1rem;
    }
    .li_sidebar {
        font-size: 13px;
        width: 9.5rem;
    }
  .li_sidebar .icones {
   width: 0.9rem;
    height: 0.9rem;
    margin-right: 0.7rem;
    margin-left: 0.3rem;
    }
  
} */

/* Telas menores */
/* @media (max-width: 900px) {
    .div_side_bar {
      
        width: 9rem;
        min-width: 9rem;
        max-width: 9rem;
    }
    .div_side_bar .logo,
    .li_sidebar {
        width: 7.5rem;
    }
    .div_side_bar .logo_image {
        width: 1rem;
        height: 1rem;
        margin-left: 0.3rem;
    }
    h1 {
        font-size: 0.85rem;
    }
    .li_sidebar {
        font-size: 12px;
       
    }
    .li_sidebar .icones{
      width: 0.7rem;
    height: 0.7rem;
    margin-right: 0.3rem;
    margin-left: 0.2rem;
    }
} */

/* Telas pequenas */
@media (max-width: 700px) {
    .div_side_bar {
        
        width: 11rem;
        min-width: 11rem;
        max-width: 11rem;
    }
    .div_side_bar .logo {
        width: 9.5rem;
    }
    
    .div_side_bar .logo_image {
        width: 1.2rem;
        height: 1.2rem;
        margin-left: 0.5rem;
    }
    h1 {
        font-size: 1rem;
    }
    .li_sidebar {
        font-size: 13px;
        width: 9.5rem;
    }
  .li_sidebar .icones {
   width: 0.9rem;
    height: 0.9rem;
    margin-right: 0.7rem;
    margin-left: 0.3rem;
    }
}

/* Telas muito pequenas */
@media (max-width: 500px) {
    .div_side_bar {
        width: 3.2rem;
        min-width: 3.2rem;
        max-width: 3.2rem;
    }
    .div_side_bar .logo,
    .li_sidebar {
        width: 2.8rem;
    }
    .div_side_bar .logo_image {
        width: 0.6rem;
        height: 0.6rem;
        margin-left: 0;
    }
    h1 {
        font-size: 0.5rem;
    }
    .li_sidebar {
        font-size: 8px;
    }
}

</style>
