import { registerRootComponent } from 'expo';
import App from './app/App'; // Đường dẫn chính xác đến App.js
import { enableScreens } from 'react-native-screens';
enableScreens();
registerRootComponent(App);