import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Platform, 
  TouchableOpacity, 
  Image, 
  Alert,
  BackHandler,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    // Theo dõi trạng thái đăng nhập
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    // Vô hiệu hóa nút back phần cứng trên Android
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => {
      unsubscribe();
      backHandler.remove();
    };
  }, []);

  // Hàm đăng xuất và chuyển hướng về màn hình đăng nhập
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login'); // Chuyển về màn hình đăng nhập
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đăng xuất, vui lòng thử lại.");
      console.error("Lỗi đăng xuất:", error);
    }
  };

  // Hàm hiển thị hộp thoại xác nhận đăng xuất
  const confirmLogout = () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng xuất", style: "destructive", onPress: handleLogout }
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* Header chứa thông tin người dùng và nút đăng xuất */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {user ? (
            <>
              <Text style={styles.userName}>
                Chào, {user.email || user.phoneNumber || "Người dùng"}
              </Text>
              {user.photoURL && (
                <Image source={{ uri: user.photoURL }} style={styles.userPhoto} />
              )}
            </>
          ) : (
            <Text>Đang tải thông tin người dùng...</Text>
          )}
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ED190DFF" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Nội dung chính (ví dụ: phần camera và tab bar) */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.cameraContainer}>
          <View style={styles.videoFrame}>
            {/* Placeholder cho video */}
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoText}>Video Placeholder</Text>
            </View>
            <View style={styles.notification}>
              <Text style={styles.notificationText}>• Dừng bật báo động</Text>
              <Text style={styles.notificationText}>Smartlock Camera</Text>
              <Text style={styles.notificationText}>{new Date().toLocaleString()}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Cài đặt camera</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home-outline" size={24} color="gray" />
          <Text style={styles.tabLabel}>Thiết bị</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="images-outline" size={24} color="gray" />
          <Text style={styles.tabLabel}>Thư viện</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="wifi-outline" size={24} color="gray" />
          <Text style={styles.tabLabel}>Kết nối thông minh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoutButton: {
    padding: 8,
  },
  contentContainer: {
    flexGrow: 1,
  },
  cameraContainer: {
    padding: 16,
    flex: 1,
  },
  videoFrame: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    height: 200,
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: 'white',
    fontSize: 18,
  },
  notification: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    borderRadius: 5,
  },
  notificationText: {
    color: 'white',
    fontSize: 12,
  },
  editButton: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'black',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
  },
  tabItem: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    color: 'gray',
  },
});

export default HomeScreen;
