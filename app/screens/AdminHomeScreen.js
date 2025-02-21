import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  BackHandler,
  Modal,
  Platform,
  SafeAreaView,
  TextInput
} from 'react-native';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { getDatabase, ref, remove, update } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// ========== Firebase config ==========
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
const rtdb = getDatabase(app); // Khởi tạo Firebase Realtime Database

// Mảng màu minh họa cho các thẻ user
const userColors = ['#FFE4C4', '#FFD1B3', '#FFFAE1', '#FEE2E2', '#CDEAFE'];

const AdminHomeScreen = () => {
  const [users, setUsers] = useState([]);
  const [adminMenuVisible, setAdminMenuVisible] = useState(false);
  const [userManagementVisible, setUserManagementVisible] = useState(false);
  const [fingerprintManagementVisible, setFingerprintManagementVisible] = useState(false);
  // --- State cho modal nhập Fingerprint ID ---
  const [isFingerprintInputVisible, setFingerprintInputVisible] = useState(false);
  const [fingerprintInput, setFingerprintInput] = useState('');
  const [selectedUserForFingerprint, setSelectedUserForFingerprint] = useState(null);

  const navigation = useNavigation();

  // Lấy danh sách users từ Firestore
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

  // Xử lý logout
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
      "Đăng xuất",
      "Bạn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: handleLogout
        }
      ],
      { cancelable: true }
    );
  };

  // =========================
  // Các hàm mở modal
  // =========================
  const handleViewCamera = () => {
    Alert.alert("thêm sau ", "😈");
  };

  const handleAddFingerprint = () => {
    setAdminMenuVisible(false);
    setFingerprintManagementVisible(true);
  };

  const openUserManagement = () => {
    setAdminMenuVisible(false);
    setUserManagementVisible(true);
  };

  // =========================
  // Xử lý xóa user (đồng bộ Firestore và Realtime Database)
  // =========================
  const handleDeleteUser = (userId, userName) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có muốn xóa ${userName}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', userId));
              await remove(ref(rtdb, 'users/' + userId));
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

  // =========================
  // Các hàm quản lý vân tay
  // =========================

  // Khi nhấn nút "+" của user, mở modal nhập Fingerprint ID
  const doAddFingerprint = (userId) => {
    setSelectedUserForFingerprint(userId);
    setFingerprintInput('');
    setFingerprintInputVisible(true);
  };

  // Xác nhận nhập Fingerprint ID
  const handleFingerprintInputConfirm = async () => {
    const fpId = fingerprintInput.trim();
    if (!fpId) {
      Alert.alert("Lỗi", "Fingerprint ID không được để trống.");
      return;
    }
    // Kiểm tra xem ID đã tồn tại chưa (trong tất cả user) trong trường "ID"
    const fpExists = users.some(user => {
      // Nếu user.ID không phải là mảng mà là string thì chuyển đổi thành mảng 1 phần tử
      const ids = Array.isArray(user.ID)
        ? user.ID
        : (typeof user.ID === 'string' ? [user.ID] : []);
      return ids.includes(fpId);
    });
    if (fpExists) {
      Alert.alert("Lỗi", "Fingerprint ID đã tồn tại, vui lòng nhập lại.");
      return;
    }
    try {
      const userDocRef = doc(db, 'users', selectedUserForFingerprint);
      const selectedUser = users.find(user => user.id === selectedUserForFingerprint);
      let newIDs = [];
      if (selectedUser && selectedUser.ID) {
        // Nếu không phải mảng thì chuyển đổi thành mảng
        const currentIDs = Array.isArray(selectedUser.ID)
          ? selectedUser.ID
          : (typeof selectedUser.ID === 'string' ? [selectedUser.ID] : []);
        newIDs = [...currentIDs, fpId];
      } else {
        newIDs = [fpId];
      }
      // Cập nhật Firestore và Realtime Database với field 'ID'
      await updateDoc(userDocRef, { ID: newIDs });
      await update(ref(rtdb, `users/${selectedUserForFingerprint}`), { ID: newIDs });
      fetchUsers();
      setFingerprintInputVisible(false);
    } catch (error) {
      Alert.alert("Error", "Unable to add fingerprint, please try again.");
    }
  };

  // Xóa một fingerprint cụ thể của user
  const doRemoveFingerprint = async (userId, fpId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const selectedUser = users.find(user => user.id === userId);
      if (selectedUser && selectedUser.ID) {
        const currentIDs = Array.isArray(selectedUser.ID)
          ? selectedUser.ID
          : (typeof selectedUser.ID === 'string' ? [selectedUser.ID] : []);
        const updatedIDs = currentIDs.filter(id => id !== fpId);
        await updateDoc(userDocRef, { ID: updatedIDs });
        await update(ref(rtdb, `users/${userId}`), { ID: updatedIDs });
        fetchUsers();
      }
    } catch (error) {
      Alert.alert("Error", "Unable to remove fingerprint, please try again.");
    }
  };

  // =========================
  // Giao diện
  // =========================
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient colors={['#FE8C00', '#F83600']} style={styles.header}>
          <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Trang quản lý</Text>

          <TouchableOpacity style={styles.menuButton} onPress={() => setAdminMenuVisible(true)}>
            <Ionicons name="menu" size={24} color="#F83600" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Nội dung chính */}
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.mainText}>Chào mừng Admin!</Text>
        </ScrollView>

        {/* Modal Admin Menu */}
        <Modal
          visible={adminMenuVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setAdminMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setAdminMenuVisible(false)}
            activeOpacity={1}
          >
            <View style={styles.menuModal}>
              <TouchableOpacity style={styles.menuItem} onPress={handleViewCamera}>
                <Ionicons name="videocam-outline" size={20} color="#F83600" />
                <Text style={styles.menuItemText}>Xem camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleAddFingerprint}>
                <Ionicons name="finger-print-outline" size={20} color="#F83600" />
                <Text style={styles.menuItemText}>Quản lý vân tay</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={openUserManagement}>
                <Ionicons name="people-outline" size={20} color="#F83600" />
                <Text style={styles.menuItemText}>Thông tin khách hàng</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal Quản lý Khách hàng */}
        <Modal
          visible={userManagementVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setUserManagementVisible(false)}
        >
          <SafeAreaView style={styles.userManagementContainer}>
            <LinearGradient colors={['#FE8C00', '#F83600']} style={styles.umHeader}>
              <Text style={styles.umHeaderTitle}>Quản lý khách hàng</Text>
              <TouchableOpacity
                style={styles.umCloseButton}
                onPress={() => setUserManagementVisible(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            <ScrollView contentContainerStyle={styles.umContent}>
              {users.length === 0 ? (
                <Text style={styles.noUserText}>Chưa có người dùng nào.</Text>
              ) : (
                users.map((user, index) => (
                  <View
                    key={user.id}
                    style={[
                      styles.userItem,
                      { backgroundColor: userColors[index % userColors.length] }
                    ]}
                  >
                    <View style={styles.userInfoContainer}>
                      <Text style={styles.userName}>
                        {user.displayName || "Chưa có tên"}
                      </Text>
                      <Text style={styles.userInfo}>
                        Email: {user.email || "N/A"}
                      </Text>
                      <Text style={styles.userInfo}>
                        Phone: {user.phone || "N/A"}
                      </Text>
                      <Text style={styles.userInfo}>
                        DOB: {user.dob || "N/A"}
                      </Text>
                      <Text style={styles.userInfo}>
                        Password: {user.password || "N/A"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteUser(user.id, user.displayName)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Modal Quản lý Vân tay */}
        <Modal
          visible={fingerprintManagementVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setFingerprintManagementVisible(false)}
        >
          <SafeAreaView style={styles.fingerprintContainer}>
            <LinearGradient colors={['#FE8C00', '#F83600']} style={styles.fpHeader}>
              <Text style={styles.fpHeaderTitle}>Quản lý vân tay</Text>
              <TouchableOpacity
                style={styles.fpCloseButton}
                onPress={() => setFingerprintManagementVisible(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            <ScrollView contentContainerStyle={styles.fpContent}>
              {users.length === 0 ? (
                <Text style={styles.noUserText}>Chưa có người dùng nào.</Text>
              ) : (
                users.map((user, index) => {
                  // Nếu user.ID không phải là mảng, kiểm tra nếu là string thì chuyển thành mảng, ngược lại dùng mảng rỗng.
                  const ids =
                    Array.isArray(user.ID)
                      ? user.ID
                      : (typeof user.ID === 'string' ? [user.ID] : []);
                  return (
                    <View
                      key={user.id}
                      style={[
                        styles.fpUserItem,
                        { backgroundColor: userColors[index % userColors.length] }
                      ]}
                    >
                      <Text style={styles.fpUserName}>
                        {user.displayName || "Chưa có tên"}
                      </Text>
                      {ids.length > 0 && (
                        <View style={styles.fingerprintList}>
                          {ids.map((id, idx) => (
                            <View key={idx} style={styles.fingerprintItem}>
                              <Text style={styles.fingerprintText}>ID: {id}</Text>
                              <TouchableOpacity
                                onPress={() => doRemoveFingerprint(user.id, id)}
                                style={styles.fpRemoveButton}
                              >
                                <Ionicons name="trash-outline" size={20} color="#fff" />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}
                      <View style={styles.fpActionButtons}>
                        <TouchableOpacity style={styles.fpAddButton} onPress={() => doAddFingerprint(user.id)}>
                          <Ionicons name="add" size={24} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Modal Nhập Fingerprint ID */}
        <Modal
          visible={isFingerprintInputVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setFingerprintInputVisible(false)}
        >
          <View style={styles.fingerprintInputModalContainer}>
            <View style={styles.fingerprintInputModal}>
              <Text style={styles.modalTitle}>Nhập Fingerprint ID</Text>
              <TextInput
                style={styles.input}
                value={fingerprintInput}
                onChangeText={setFingerprintInput}
                placeholder="Nhập ID (string)"
                keyboardType="default"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setFingerprintInputVisible(false)}
                  style={styles.modalButton}
                >
                  <Text>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleFingerprintInputConfirm}
                  style={styles.modalButton}
                >
                  <Text>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
};

// ===================== STYLES =====================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF7EC',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF7EC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'ios' ? 20 : 15,
    paddingHorizontal: 10,
    position: 'relative',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  logoutButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 10,
    zIndex: 2,
  },
  headerTitle: {
    color: '#fff',
    fontSize: Platform.OS === 'ios' ? 22 : 20,
    fontWeight: 'bold',
  },
  menuButton: {
    position: 'absolute',
    left: 15,
    top: 15,
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  content: {
    padding: 16,
    paddingTop: 30,
  },
  mainText: {
    fontSize: 18,
    color: '#F83600',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
  },
  menuModal: {
    backgroundColor: '#fff',
    marginHorizontal: 30,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  menuItemText: {
    marginLeft: 8,
    color: '#F83600',
    fontSize: 16,
    fontWeight: '500',
  },
  userManagementContainer: {
    flex: 1,
    backgroundColor: '#FFF7EC',
  },
  umHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'ios' ? 20 : 15,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: 'relative',
  },
  umHeaderTitle: {
    color: '#fff',
    fontSize: Platform.OS === 'ios' ? 22 : 20,
    fontWeight: 'bold',
  },
  umCloseButton: {
    position: 'absolute',
    right: 15,
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
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FE6E00',
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#EB5757',
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  fingerprintContainer: {
    flex: 1,
    backgroundColor: '#FFF7EC',
  },
  fpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'ios' ? 20 : 15,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: 'relative',
  },
  fpHeaderTitle: {
    color: '#fff',
    fontSize: Platform.OS === 'ios' ? 22 : 20,
    fontWeight: 'bold',
  },
  fpCloseButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 10,
  },
  fpContent: {
    padding: 16,
    paddingTop: 20,
  },
  fpUserItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  fpUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FE6E00',
  },
  fpActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  fpAddButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 8,
  },
  fpRemoveButton: {
    backgroundColor: '#EB5757',
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  fingerprintList: {
    marginTop: 8,
  },
  fingerprintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#555',
    padding: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  fingerprintText: {
    color: '#fff',
    marginRight: 8,
  },
  fingerprintInputModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fingerprintInputModal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F83600',
    borderRadius: 8,
  },
});

export default AdminHomeScreen;
