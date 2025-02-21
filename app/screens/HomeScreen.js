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
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('devices');
  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => {
      unsubscribe();
      backHandler.remove();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đăng xuất, vui lòng thử lại.");
      console.error("Lỗi đăng xuất:", error);
    }
  };

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

  const renderTabItem = (tabName, iconName, label) => (
    <TouchableOpacity 
      style={styles.tabItem} 
      onPress={() => setActiveTab(tabName)}
    >
      <Ionicons 
        name={iconName} 
        size={28} 
        color={activeTab === tabName ? "#1E90FF" : "gray"} 
      />
      <Text style={[styles.tabLabel, activeTab === tabName && styles.activeTabLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header với nền gradient */}
      <LinearGradient 
        colors={['#1E90FF', '#00BFFF']} 
        start={[0, 0]} 
        end={[1, 0]} 
        style={styles.header}
      >
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
            <Text style={styles.loadingText}>Đang tải thông tin người dùng...</Text>
          )}
        </View>
        {/* Nút đăng xuất nổi bật */}
        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
          <Ionicons 
            name="log-out-outline" 
            size={20} 
            color="#fff" 
            style={{ marginRight: 8 }} 
          />
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Nội dung chính */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.cameraContainer}>
          <View style={styles.videoFrame}>
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

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {renderTabItem('devices', 'home-outline', 'Thiết bị')}
        {renderTabItem('gallery', 'images-outline', 'Thư viện')}
        {renderTabItem('smart', 'wifi-outline', 'Kết nối')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 16,
    paddingBottom: 10,
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
    fontWeight: '600',
    color: '#fff',
    marginRight: 10,
  },
  loadingText: {
    color: '#fff',
  },
  userPhoto: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ED1C24', // Màu đỏ nổi bật
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },
  cameraContainer: {
    marginBottom: 80,
  },
  videoFrame: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    height: 220,
    backgroundColor: '#000',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#fff',
    fontSize: 20,
  },
  notification: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  notificationText: {
    color: '#fff',
    fontSize: 12,
  },
  editButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  tabItem: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    color: 'gray',
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#1E90FF',
    fontWeight: '600',
  },
});

export default HomeScreen;
