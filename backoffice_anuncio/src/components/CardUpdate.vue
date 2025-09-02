<template>
    <div class="card_update">
        <ul class="card_header">
            <li>#</li>
            <li>Nome</li>
            <li>Email</li>
            <li>Telefone</li>
            <li>Perfil</li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: 'CardUpdate',
    };
</script>

<style scoped>
.card_update {
    position: absolute;
    top: 5rem;
    left: 17rem;
    width: 45rem;
    height: 20rem;
    display: flex;
    flex-direction: column;
    
    border-radius: 1rem;
    box-shadow: 0 10px 10px rgba(0, 0, 0, 0.3);
    z-index: 1;
    background-color: #fff;
}

.card_header {
  display: flex;
  flex-direction: row;
  border-radius: 1rem 1rem 0rem 0rem;
  padding: 1rem;
  color: #333;
  font-weight: 200;
  background-color: #fff;
  align-items: center;
  gap: 1rem;
  z-index: 1;
}
</style>