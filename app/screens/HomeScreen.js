import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import onAuthStateChanged

const HomeScreen = () => {
    const [user, setUser] = useState(null); // State để lưu thông tin người dùng

    useEffect(() => {
        const auth = getAuth(); // Lấy instance auth
        const unsubscribe = onAuthStateChanged(auth, (user) => { // Sử dụng onAuthStateChanged
            setUser(user); // Cập nhật state khi trạng thái đăng nhập thay đổi
        });

        return () => unsubscribe(); // Hủy đăng ký listener khi component unmount
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}> {/* Thêm header để hiển thị thông tin người dùng */}
                {user ? (
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>Chào, {user.email || user.phoneNumber || "Người dùng"}</Text> {/* Hiển thị email hoặc số điện thoại */}
                        {user.photoURL && <Image source={{ uri: user.photoURL }} style={styles.userPhoto} />}
                    </View>
                ) : (
                    <Text>Đang tải thông tin người dùng...</Text>
                )}
            </View>
            <View style={styles.cameraContainer}>
                <View style={styles.videoFrame}>
                    {/* Placeholder cho video */}
                    <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: 'white' }}>Video Placeholder</Text>
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
    header: { // Style cho header
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
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
        backgroundColor: 'white'
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