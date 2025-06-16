import { createApp } from "vue";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import "./style.css";
import App from "./App.vue";

// Create Pinia store
const pinia = createPinia();

// Create Vuetify instance
const vuetify = createVuetify({
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#1976D2",
          secondary: "#424242",
          darkBlue: "#080027",
          skyBlue: "#01e8e8",
          darkBlueV2: "#14005c",
          purple: "#43337d",
          skyBlueV2: "#e6ffff",
          gray: "#f7f7f7",
          grayV2: "#7f7f7f",
          grayV3: "#a3a3a3",
          accent: "#82B1FF",
          error: "#FF5252",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#FFC107",
          // Custom colors for slot categories
          slotGreen: "#4CAF50",
          slotYellow: "#FF9800",
          slotRed: "#F44336",
        },
      },
    },
  },
  defaults: {
    global: {
      style: 'font-family: "Manrope", sans-serif;',
    },
  },
  icons: {
    defaultSet: "mdi",
  },
});

// Create and mount the app
createApp(App).use(pinia).use(vuetify).mount("#app");
