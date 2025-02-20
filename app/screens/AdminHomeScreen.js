import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  BackHandler,
  Modal
} from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const firebaseConfig = {
  apiKey: "AIzaSyDdjKUec0aGVzExn1dPk-LkIraK7VqUJxk",
  authDomain: "smartlock-ccd1d.firebaseapp.com",
  projectId: "smartlock-ccd1d",
  storageBucket: "smartlock-ccd1d.appspot.com",
  messagingSenderId: "360774980468",
  appId: "1:360774980468:android:6d217dcfc513b0ae9bd221",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Mảng màu để phân biệt các user item
const userColors = ['#FFCCCC', '#06A406FF', '#7F7FA3FF', '#CECE2EFF', '#51E9E9FF'];

const AdminHomeScreen = () => {
  const [users, setUsers] = useState([]);
  const [adminMenuVisible, setAdminMenuVisible] = useState(false);
  const [userManagementVisible, setUserManagementVisible] = useState(false);
  const navigation = useNavigation();

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const onBackPress = () => true;
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert("Error", "Unable to logout, please try again.");
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Đăng xuất ",
      "Bạn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng xuất", style: "destructive", onPress: handleLogout }
      ],
      { cancelable: true }
    );
  };

  // Các chức năng trong menu nhỏ
  const handleViewCamera = () => {
    Alert.alert("thêm sau ", "😈");
  };

  const handleAddFingerprint = () => {
    Alert.alert("thêm sau ", "😈");
  };

  const openUserManagement = () => {
    setAdminMenuVisible(false);
    setUserManagementVisible(true);
  };

  const handleDeleteUser = (userId, userName) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có muốn xóa ${userName}?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa ", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', userId));
              fetchUsers();
            } catch (error) {
              Alert.alert("Error", "Unable to delete user, please try again.");
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* Header với gradient xanh dương - vàng */}
      <LinearGradient colors={['#1E90FF', '#FFD700']} style={styles.header}>
        {/* Nút logout ở góc phải */}
        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trang quản lý</Text>
        {/* Nút menu (hình vuông) ở góc trái */}
        <TouchableOpacity style={styles.menuButton} onPress={() => setAdminMenuVisible(true)}>
          <Ionicons name="menu" size={24} color="#1E90FF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Nội dung chính của Admin */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.mainText}>Welcome, Admin!</Text>
      </ScrollView>

      {/* Modal Admin Menu */}
      <Modal
        visible={adminMenuVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setAdminMenuVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setAdminMenuVisible(false)}>
          <View style={styles.menuModal}>
            <TouchableOpacity style={styles.menuItem} onPress={handleViewCamera}>
              <Ionicons name="videocam-outline" size={20} color="#1E90FF" />
              <Text style={styles.menuItemText}>Xem cam </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleAddFingerprint}>
              <Ionicons name="finger-print-outline" size={20} color="#1E90FF" />
              <Text style={styles.menuItemText}>Quản lý vân tay </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={openUserManagement}>
              <Ionicons name="people-outline" size={20} color="#1E90FF" />
              <Text style={styles.menuItemText}>Thông tin khách hàng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal User Management - full screen */}
      <Modal
        visible={userManagementVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setUserManagementVisible(false)}
      >
        <View style={styles.userManagementContainer}>
          <LinearGradient colors={['#1E90FF', '#FFD700']} style={styles.umHeader}>
            <Text style={styles.umHeaderTitle}>Quản lý khách hàng</Text>
            <TouchableOpacity style={styles.umCloseButton} onPress={() => setUserManagementVisible(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
          <ScrollView contentContainerStyle={styles.umContent}>
            {users.length === 0 ? (
              <Text style={styles.noUserText}>No users found.</Text>
            ) : (
              users.map((user, index) => (
                <View key={user.id} style={[styles.userItem, { backgroundColor: userColors[index % userColors.length] }]}>
                  <View style={styles.userInfoContainer}>
                    <Text style={styles.userName}>Name: {user.displayName || "N/A"}</Text>
                    <Text style={styles.userInfo}>Email: {user.email || "N/A"}</Text>
                    <Text style={styles.userInfo}>Phone: {user.phone || "N/A"}</Text>
                    <Text style={styles.userInfo}>DOB: {user.dob || "N/A"}</Text>
                    <Text style={styles.userInfo}>password: {user.password || "N/A"}</Text>
                  </View>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteUser(user.id, user.displayName)}>
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  
  container: { 
    flex: 1, 
    backgroundColor: '#f0f0f5' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    position: 'relative',
  },
  
  logoutButton: {
    position: 'absolute',
    right: 10,
    top: 15,
    padding: 10,
    zIndex: 2,
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  menuButton: {
    position: 'absolute',
    left: 10,
    top: 15,
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  content: {
    padding: 16,
    paddingTop: 80,
  },
  mainText: {
    fontSize: 18,
    color: '#1E90FF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  menuModal: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    margin: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  menuItemText: {
    marginLeft: 8,
    color: '#1E90FF',
    fontSize: 14,
  },
  userManagementContainer: {
    flex: 1,
    backgroundColor: '#f0f0f5',
  },
  umHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    position: 'relative',
  },
  umHeaderTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  umCloseButton: {
    position: 'absolute',
    right: 10,
    top: 15,
    padding: 10,
  },
  umContent: {
    padding: 16,
    paddingTop: 20,
  },
  noUserText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
  userInfo: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FF6347',
    padding: 8,
    borderRadius: 4,
    marginLeft: 10,
  },
});

export default AdminHomeScreen;
