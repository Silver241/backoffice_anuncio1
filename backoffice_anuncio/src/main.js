import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';

// 🎨 CSS correto (tema + base + ícones)
import 'primevue/resources/themes/lara-light-blue/theme.css'; 
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

// 📦 Componentes PrimeVue
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';

const app = createApp(App);

app.use(PrimeVue);

// ✅ nomes multi-palavra para evitar erro ESLint
app.component('AppCard', Card);
app.component('AppTag', Tag);
app.component('AppSkeleton', Skeleton);

app.mount('#app');
