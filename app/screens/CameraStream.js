// CameraStream.js
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const CameraStream = () => {
  // Thay đổi IP và endpoint cho phù hợp với cấu hình của ESP32-CAM
  const streamUrl = 'http://192.168.0.102';

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: streamUrl }}
        style={styles.webview}
        // Có thể cấu hình thêm nếu cần (ví dụ: set javaScriptEnabled, etc.)
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  webview: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default CameraStream;
