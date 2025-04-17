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
  SafeAreaView,
  TextInput,
  Image
} from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
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
import styles from '../styles/AdminHomeScreenStyles';

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDdjKUec0aGVzExn1dPk-LkIraK7VqUJxk",
  authDomain: "smartlock-ccd1d.firebaseapp.com",
  projectId: "smartlock-ccd1d",
  storageBucket: "smartlock-ccd1d.appspot.com",
  messagingSenderId: "360774980468",
  appId: "1:360774980468:android:6d217dcfc513b0ae9bd221",
};

// Khởi tạo Firebase App một lần duy nhất
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const db = getFirestore(app);
const auth = getAuth(app);
const rtdb = getDatabase(app);

// Mảng màu nền cho các thẻ người dùng
const userColors = ['#FFE4C4', '#FFD1B3', '#FFFAE1', '#FEE2E2', '#CDEAFE'];

const AdminHomeScreen = () => {
  // State lưu danh sách người dùng
  const [users, setUsers] = useState([]);
  // State điều khiển modal quản lý khách hàng
  const [userManagementVisible, setUserManagementVisible] = useState(false);
  // State điều khiển modal quản lý vân tay
  const [fingerprintManagementVisible, setFingerprintManagementVisible] = useState(false);
  // State điều khiển modal nhập ID vân tay
  const [isFingerprintInputVisible, setFingerprintInputVisible] = useState(false);
  // State lưu giá trị nhập của fingerprint ID
  const [fingerprintInput, setFingerprintInput] = useState('');
  // State lưu id của user đang được thêm vân tay
  const [selectedUserForFingerprint, setSelectedUserForFingerprint] = useState(null);

  // Hook điều hướng
  const navigation = useNavigation();

  // Mảng màu dùng cho hiệu ứng "nhấp nháy" cho text "Chào mừng Admin"
  const blinkingColors = ['red', 'green', 'blue'];
  // State lưu chỉ số màu hiện tại cho hiệu ứng nhấp nháy
  const [colorIndex, setColorIndex] = useState(0);

  // Lấy danh sách người dùng từ Firestore
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
    const onBackPress = () => true; // Trả về true để chặn chức năng back
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    };
  }, []);

  // Hiệu ứng nhấp nháy cho text "Chào mừng Admin"
  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex(prevIndex => (prevIndex + 1) % blinkingColors.length);
    }, 500); // Thay đổi màu mỗi 500ms
    return () => clearInterval(interval);
  }, []);

  // Style động cho hiệu ứng nhấp nháy dựa vào state colorIndex
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

  // Xác nhận đăng xuất với hộp thoại Alert
  const confirmLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng xuất", style: "destructive", onPress: handleLogout }
      ],
      { cancelable: true }
    );
  };

  // Hàm xem camera (chưa phát triển)
  const handleViewCamera = () => {
    Alert.alert("Xem camera", "Tính năng này sẽ được bổ sung sau!");
  };

  // Mở modal quản lý vân tay
  const handleAddFingerprint = () => {
    setFingerprintManagementVisible(true);
  };

  // Mở modal quản lý người dùng
  const openUserManagement = () => {
    setUserManagementVisible(true);
  };

  // Hàm xóa người dùng với xác nhận
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
              // Xóa user khỏi Firestore
              await deleteDoc(doc(db, 'users', userId));
              // Xóa user khỏi Realtime Database
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

  // Khi bấm thêm vân tay cho user, lưu lại id của user và mở modal nhập ID
  const doAddFingerprint = (userId) => {
    setSelectedUserForFingerprint(userId);
    setFingerprintInput('');
    setFingerprintInputVisible(true);
  };

  // Hàm xác nhận thêm vân tay, lưu ID dưới dạng number (không phải mảng)
  const handleFingerprintInputConfirm = async () => {
    const inputStr = fingerprintInput.trim();
    if (!inputStr) {
      Alert.alert("Lỗi", "Fingerprint ID không được để trống.");
      return;
    }
    // Chuyển chuỗi nhập sang số nguyên
    const fpIdNumber = parseInt(inputStr, 10);
    if (isNaN(fpIdNumber)) {
      Alert.alert("Lỗi", "Fingerprint ID phải là số nguyên.");
      return;
    }
    // Kiểm tra xem fingerprint đã tồn tại chưa (so sánh kiểu number)
    const fpExists = users.some(user => {
      const currentID = user.ID;
      return Number(currentID) === fpIdNumber;
    });
    if (fpExists) {
      Alert.alert("Lỗi", "Fingerprint ID đã tồn tại, vui lòng nhập lại.");
      return;
    }
    try {
      const userDocRef = doc(db, 'users', selectedUserForFingerprint);
      // Cập nhật Firestore và Realtime Database với giá trị số trực tiếp
      await updateDoc(userDocRef, { ID: fpIdNumber });
      await update(ref(rtdb, `users/${selectedUserForFingerprint}`), { ID: fpIdNumber });
      setFingerprintInputVisible(false);
    } catch (error) {
      Alert.alert("Error", "Unable to add fingerprint, please try again.");
    }
  };

  // Hàm thực hiện xóa vân tay: nếu Fingerprint ID trùng khớp thì set về null
  const doRemoveFingerprint = async (userId, fpId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const selectedUser = users.find(u => u.id === userId);
      if (selectedUser && selectedUser.ID != null) {
        if (Number(selectedUser.ID) === fpId) {
          await updateDoc(userDocRef, { ID: null });
          await update(ref(rtdb, `users/${userId}`), { ID: null });
        }
      }
    } catch (error) {
      Alert.alert("Error", "Unable to remove fingerprint, please try again.");
    }
  };

  // Hàm xác nhận xóa vân tay (hiển thị hộp thoại Alert)
  const confirmRemoveFingerprint = (userId, fpId) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa vân tay này?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: () => doRemoveFingerprint(userId, fpId) }
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header với nền gradient */}
        <LinearGradient
          colors={['#FE8C00', '#F83600']}
          style={styles.header}
        >
          <Text style={[styles.headerTitle, blinkingStyle]}>
            Chào mừng Admin
          </Text>
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

        {/* Danh sách camera */}
        <ScrollView contentContainerStyle={styles.cameraList}>
          <TouchableOpacity style={styles.cameraCard} onPress={handleViewCamera}>
            <Image
              source={{ uri: 'https://via.placeholder.com/350x200?text=Phòng+khách' }}
              style={styles.cameraImage}
              resizeMode="cover"
            />
            <Text style={styles.cameraLabel}>#Phòng khách</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraCard} onPress={handleViewCamera}>
            <Image
              source={{ uri: 'https://via.placeholder.com/350x200?text=Cam+nhà+cậu' }}
              style={styles.cameraImage}
              resizeMode="cover"
            />
            <Text style={styles.cameraLabel}>#Cam nhà cậu</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Thanh bottom tab */}
        <View style={styles.bottomTabContainer}>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="home-outline" size={22} color="#F83600" />
            <Text style={styles.tabText}>Trang chủ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={handleAddFingerprint}>
            <Ionicons name="finger-print-outline" size={22} color="#F83600" />
            <Text style={styles.tabText}>Vân tay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={openUserManagement}>
            <Ionicons name="people-outline" size={22} color="#F83600" />
            <Text style={styles.tabText}>Khách hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="notifications-outline" size={22} color="#F83600" />
            <Text style={styles.tabText}>Thông báo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="settings-outline" size={22} color="#F83600" />
            <Text style={styles.tabText}>Cài đặt</Text>
          </TouchableOpacity>
        </View>

        {/* Modal Quản lý người dùng */}
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

        {/* Modal Quản lý vân tay */}
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
                  // Nếu có Fingerprint ID (kiểu number) thì hiển thị trực tiếp
                  const fingerprint = user.ID;
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
                      {fingerprint != null && (
                        <View style={styles.fingerprintList}>
                          <View style={styles.fingerprintItem}>
                            <Text style={styles.fingerprintText}>ID: {fingerprint}</Text>
                            <TouchableOpacity
                              onPress={() => confirmRemoveFingerprint(user.id, fingerprint)}
                              style={styles.fpRemoveButton}
                            >
                              <Ionicons name="trash-outline" size={20} color="#fff" />
                            </TouchableOpacity>
                          </View>
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

        {/* Modal nhập ID vân tay */}
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
                placeholder="Nhập ID (số nguyên)"
                keyboardType="number-pad"
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

export default AdminHomeScreen;
