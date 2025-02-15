// AdminHomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Cấu hình Firebase (đảm bảo dùng cấu hình của dự án bạn)
const firebaseConfig = {
  apiKey: "AIzaSyDdjKUec0aGVzExn1dPk-LkIraK7VqUJxk",
  authDomain: "smartlock-ccd1d.firebaseapp.com",
  projectId: "smartlock-ccd1d",
  storageBucket: "smartlock-ccd1d.appspot.com",
  messagingSenderId: "360774980468",
  appId: "1:360774980468:android:6d217dcfc513b0ae9bd221",
};

// Khởi tạo Firebase App và Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const AdminHomeScreen = () => {
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Lấy tất cả document từ collection "users"
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllUsers(usersList);
      } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Trang Quản Trị</Text>
      <Text style={styles.subtitle}>Danh sách người dùng đã đăng ký</Text>
      {allUsers.length === 0 ? (
        <Text>Không có người dùng nào.</Text>
      ) : (
        allUsers.map(user => (
          <View key={user.id} style={styles.userItem}>
            <Text style={styles.userName}>Tên: {user.displayName || "N/A"}</Text>
            <Text>Email: {user.email || "N/A"}</Text>
            <Text>SĐT: {user.phone || "N/A"}</Text>
            <Text>Ngày sinh: {user.dob || "N/A"}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  userItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  userName: {
    fontWeight: 'bold',
  },
});

export default AdminHomeScreen;
