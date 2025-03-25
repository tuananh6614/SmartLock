// CameraStream.js
import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import styles from '../styles/CameraStreamStyles';

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

export default CameraStream;
