/** Dev playground entrypoint — full app with interactive controls */
import { createApp } from 'vue';
import PlaygroundApp from './playground/PlaygroundApp.vue';
import './styles/globals.css';

createApp(PlaygroundApp).mount('#app');
