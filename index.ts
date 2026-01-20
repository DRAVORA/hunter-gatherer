// ============================================================================
// CRITICAL: This import MUST be first!
// ============================================================================
// Polyfills crypto.getRandomValues() for React Native
// Required by the uuid package
import "react-native-get-random-values";

// ============================================================================
// APP REGISTRATION
// ============================================================================
import { registerRootComponent } from "expo";
import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
