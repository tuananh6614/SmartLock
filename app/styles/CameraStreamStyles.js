import { StyleSheet, Dimensions } from 'react-native';

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  webview: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default styles; 