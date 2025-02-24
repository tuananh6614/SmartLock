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
  TextInput,
  Image
} from 'react-native';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { getDatabase, ref, remove, update } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDdjKUec0aGVzExn1dPk-LkIraK7VqUJxk",
  authDomain: "smartlock-ccd1d.firebaseapp.com",
  projectId: "smartlock-ccd1d",
  storageBucket: "smartlock-ccd1d.appspot.com",
  messagingSenderId: "360774980468",
  appId: "1:360774980468:android:6d217dcfc513b0ae9bd221",
};

// Khởi tạo app và các dịch vụ Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const rtdb = getDatabase(app);

// Mảng màu nền luân phiên cho các thẻ user
const userColors = ['#FFE4C4', '#FFD1B3', '#FFFAE1', '#FEE2E2', '#CDEAFE'];

const AdminHomeScreen = () => {
  // State lưu danh sách người dùng
  const [users, setUsers] = useState([]);
  // State điều khiển Modal Quản lý User
  const [userManagementVisible, setUserManagementVisible] = useState(false);
  // State điều khiển Modal Quản lý Vân tay
  const [fingerprintManagementVisible, setFingerprintManagementVisible] = useState(false);
  // State điều khiển Modal nhập ID vân tay
  const [isFingerprintInputVisible, setFingerprintInputVisible] = useState(false);
  // State lưu ID vân tay người dùng nhập
  const [fingerprintInput, setFingerprintInput] = useState('');
  // State lưu user nào đang thêm ID vân tay
  const [selectedUserForFingerprint, setSelectedUserForFingerprint] = useState(null);

  // Dùng để điều hướng
  const navigation = useNavigation();

  // 1) Tạo mảng màu để hiển thị hiệu ứng "nhấp nháy" RGB
  const blinkingColors = ['/#FFB6C1', '#DDA0DD', '#FFFF00'];
  // 2) State để lưu chỉ số màu hiện tại
  const [colorIndex, setColorIndex] = useState(0);

  // Lấy danh sách user từ Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (querySnapshot) => {
        const usersList = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setUsers(usersList);
      },
      (error) => {
        console.error("Error fetching users:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Chặn nút Back trên Android
  useEffect(() => {
    const onBackPress = () => true; // true = chặn quay lui
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    };
  }, []);

  // 3) Dùng useEffect để tự động đổi màu text tiêu đề (tạo hiệu ứng nhấp nháy)
  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex(prevIndex => (prevIndex + 1) % blinkingColors.length);
    }, 500); // 500ms đổi màu một lần
    return () => clearInterval(interval);
  }, []);

  // 4) Tạo style động cho text (đổi color theo state colorIndex)
  const blinkingStyle = {
    color: blinkingColors[colorIndex],
  };

  // Hàm đăng xuất
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert("Error", "Unable to logout, please try again.");
    }
  };

  // Xác nhận đăng xuất
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

  // Hàm xem camera (chưa phát triển)
  const handleViewCamera = () => {
    Alert.alert("Xem camera", "Tính năng này sẽ được bổ sung sau!");
  };

  // Hàm mở modal Quản lý vân tay
  const handleAddFingerprint = () => {
    setFingerprintManagementVisible(true);
  };

  // Hàm mở modal Quản lý người dùng
  const openUserManagement = () => {
    setUserManagementVisible(true);
  };

  // Hàm xóa người dùng
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
              // Xóa user trong Firestore
              await deleteDoc(doc(db, 'users', userId));
              // Xóa user trong Realtime Database
              await remove(ref(rtdb, 'users/' + userId));
            } catch (error) {
              Alert.alert("Error", "Unable to delete user, please try again.");
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  // Khi bấm thêm vân tay cho user nào đó
  const doAddFingerprint = (userId) => {
    setSelectedUserForFingerprint(userId);
    setFingerprintInput('');
    setFingerprintInputVisible(true);
  };

  // Xác nhận thêm vân tay (sau khi nhập ID)
  const handleFingerprintInputConfirm = async () => {
    const fpId = fingerprintInput.trim();
    if (!fpId) {
      Alert.alert("Lỗi", "Fingerprint ID không được để trống.");
      return;
    }

    // Kiểm tra ID đã tồn tại trong hệ thống chưa
    const fpExists = users.some(user => {
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
      // Lấy doc user cần thêm ID
      const userDocRef = doc(db, 'users', selectedUserForFingerprint);
      const selectedUser = users.find(u => u.id === selectedUserForFingerprint);

      // Gom ID vân tay cũ + ID mới
      let newIDs = [];
      if (selectedUser && selectedUser.ID) {
        const currentIDs = Array.isArray(selectedUser.ID)
          ? selectedUser.ID
          : (typeof selectedUser.ID === 'string' ? [selectedUser.ID] : []);
        newIDs = [...currentIDs, fpId];
      } else {
        newIDs = [fpId];
      }

      // Cập nhật Firestore
      await updateDoc(userDocRef, { ID: newIDs });
      // Cập nhật Realtime Database
      await update(ref(rtdb, `users/${selectedUserForFingerprint}`), { ID: newIDs });

      // Ẩn modal nhập ID
      setFingerprintInputVisible(false);
    } catch (error) {
      Alert.alert("Error", "Unable to add fingerprint, please try again.");
    }
  };

  // Hàm xóa ID vân tay của user
  const doRemoveFingerprint = async (userId, fpId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const selectedUser = users.find(u => u.id === userId);

      if (selectedUser && selectedUser.ID) {
        const currentIDs = Array.isArray(selectedUser.ID)
          ? selectedUser.ID
          : (typeof selectedUser.ID === 'string' ? [selectedUser.ID] : []);
        const updatedIDs = currentIDs.filter(id => id !== fpId);

        // Cập nhật Firestore
        await updateDoc(userDocRef, { ID: updatedIDs });
        // Cập nhật Realtime Database
        await update(ref(rtdb, `users/${userId}`), { ID: updatedIDs });
      }
    } catch (error) {
      Alert.alert("Error", "Unable to remove fingerprint, please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header với nền gradient */}
        <LinearGradient
          colors={['#FAF1E6FF', '#AADFF0FF']}
          style={styles.header}
        >
          {/*
            Đã loại bỏ nút 3 gạch (hamburger) bên trái
            Thay đổi text thành "Chào mừng Admin" với hiệu ứng RGB nhấp nháy
          */}
          <Text style={[styles.headerTitle, blinkingStyle]}>
            Chào mừng Admin
          </Text>

          {/* Nút đăng xuất nằm bên phải */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={confirmLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#F83600" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Vùng "Địa điểm mặc định" */}
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>
            Địa điểm mặc định: Nhấn để chuyển nhanh đến địa điểm khác
          </Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#F83600" />
        </View>

        {/* Danh sách camera (dạng ScrollView) */}
        <ScrollView contentContainerStyle={styles.cameraList}>
          {/* Camera 1 */}
          <TouchableOpacity style={styles.cameraCard} onPress={handleViewCamera}>
            <Image
              source={{ uri: 'https://via.placeholder.com/350x200?text=Phòng+khách' }}
              style={styles.cameraImage}
              resizeMode="cover"
            />
            <Text style={styles.cameraLabel}>#Phòng khách</Text>
          </TouchableOpacity>

          {/* Camera 2 */}
          <TouchableOpacity style={styles.cameraCard} onPress={handleViewCamera}>
            <Image
              source={{ uri: 'https://via.placeholder.com/350x200?text=Cam+nhà+cậu' }}
              style={styles.cameraImage}
              resizeMode="cover"
            />
            <Text style={styles.cameraLabel}>#Cam nhà cậu</Text>
          </TouchableOpacity>
        </ScrollView>

        {/*
          Thanh bottom tab, đã loại bỏ "Khoảnh khắc" và "Quản lý",
          thay vào đó thêm "Quản lý vân tay" và "Quản lý khách hàng"
        */}
        <View style={styles.bottomTabContainer}>

          {/* Trang chủ (chưa gắn logic gì) */}
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="home-outline" size={22} color="#F83600" />
            <Text style={styles.tabText}>Trang chủ</Text>
          </TouchableOpacity>

          {/* Quản lý vân tay */}
          <TouchableOpacity style={styles.tabItem} onPress={handleAddFingerprint}>
            <Ionicons name="finger-print-outline" size={22} color="#F83600" />
            <Text style={styles.tabText}>Vân tay</Text>
          </TouchableOpacity>

          {/* Quản lý khách hàng */}
          <TouchableOpacity style={styles.tabItem} onPress={openUserManagement}>
            <Ionicons name="people-outline" size={22} color="#F83600" />
            <Text style={styles.tabText}>Khách hàng</Text>
          </TouchableOpacity>

          {/* Thông báo (chưa gắn logic) */}
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="notifications-outline" size={22} color="#F83600" />
            <Text style={styles.tabText}>Thông báo</Text>
          </TouchableOpacity>

          {/* Cài đặt (chưa gắn logic) */}
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="settings-outline" size={22} color="#F83600" />
            <Text style={styles.tabText}>Cài đặt</Text>
          </TouchableOpacity>
        </View>

        {/*
          Modal Quản lý người dùng
          Bật/tắt bằng userManagementVisible
        */}
        <Modal
          visible={userManagementVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setUserManagementVisible(false)}
        >
          <SafeAreaView style={styles.userManagementContainer}>
            <LinearGradient
              colors={['#FE8C00', '#F83600']}
              style={styles.umHeader}
            >
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

        {/*
          Modal Quản lý vân tay
          Bật/tắt bằng fingerprintManagementVisible
        */}
        <Modal
          visible={fingerprintManagementVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setFingerprintManagementVisible(false)}
        >
          <SafeAreaView style={styles.fingerprintContainer}>
            <LinearGradient
              colors={['#FE8C00', '#F83600']}
              style={styles.fpHeader}
            >
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
                  // Lấy danh sách ID vân tay (nếu có)
                  const ids = Array.isArray(user.ID)
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
                        <TouchableOpacity
                          style={styles.fpAddButton}
                          onPress={() => doAddFingerprint(user.id)}
                        >
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

        {/*
          Modal nhập ID vân tay (hiện khi isFingerprintInputVisible = true)
        */}
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
                  <Text style={{ color: '#fff' }}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleFingerprintInputConfirm}
                  style={styles.modalButton}
                >
                  <Text style={{ color: '#fff' }}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

// CSS (StyleSheet)
const styles = StyleSheet.create({
  // Vùng an toàn cho iOS
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF7EC',
  },
  // Container tổng
  container: {
    flex: 1,
    backgroundColor: '#FFF7EC',
  },
  // Header
  header: {
    flexDirection: 'row',             // Sắp xếp ngang
    alignItems: 'center',             // Canh giữa theo trục dọc
    justifyContent: 'center',         // Canh giữa theo trục ngang
    paddingVertical: Platform.OS === 'ios' ? 20 : 15,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 20,       // Bo góc dưới bên trái
    borderBottomRightRadius: 20,      // Bo góc dưới bên phải
    position: 'relative',
  },
  headerTitle: {
    color: '#fff',
    fontSize: Platform.OS === 'ios' ? 22 : 20,
    fontWeight: 'bold',
  },
  // Nút đăng xuất (góc phải)
  logoutButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // Hiệu ứng đổ bóng
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 2,
  },

  // Khu vực "Địa điểm mặc định"
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFF',
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    // Đổ bóng nhẹ
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  locationText: {
    flex: 1,
    color: '#F83600',
    fontSize: 14,
    marginRight: 8,
  },

  // Danh sách camera (dạng ScrollView)
  cameraList: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 80, // Chừa chỗ cho bottom tab
  },
  cameraCard: {
    backgroundColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    // Đổ bóng
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraImage: {
    width: '100%',
    height: 200,
  },
  cameraLabel: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  // Thanh bottom tab
  bottomTabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // Đổ bóng
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    marginTop: 2,
    color: '#F83600',
  },

  // Modal chung (overlay)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
  },
  // User Management
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
    // Đổ bóng
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
    color: '#333',
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#EB5757',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  // Fingerprint Management
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
    // Đổ bóng
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  fpUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
  fpActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  fpAddButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fpRemoveButton: {
    backgroundColor: '#EB5757',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // Modal nhập Fingerprint ID
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