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
import styles from '../styles/HomeScreenStyles';

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

export default HomeScreen;
