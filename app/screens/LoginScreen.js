import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import styles from '../styles/LoginScreenStyles';

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
const auth = getAuth(app);

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [buttonScale] = useState(new Animated.Value(1));
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState({ identifier: null, password: null });
  const [identifierValid, setIdentifierValid] = useState(false);

  // Kiểm tra định dạng Email / SĐT
  const validateIdentifier = (text) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\d{10,11}$/;
    if (emailPattern.test(text) || phonePattern.test(text)) {
      setErrorMessages((prev) => ({ ...prev, identifier: null }));
      setIdentifierValid(true);
    } else {
      setErrorMessages((prev) => ({
        ...prev,
        identifier: 'Vui lòng nhập email hoặc số điện thoại hợp lệ.',
      }));
      setIdentifierValid(false);
    }
  };

  // Xử lý đăng nhập
  const handleLogin = async () => {
    // Kiểm tra input trống
    if (!identifier) {
      setErrorMessages((prev) => ({
        ...prev,
        identifier: 'Vui lòng nhập email hoặc số điện thoại.',
      }));
      return;
    }
    if (!password) {
      setErrorMessages((prev) => ({
        ...prev,
        password: 'Vui lòng nhập mật khẩu.',
      }));
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
      const user = userCredential.user;

      // Kiểm tra tài khoản admin (hard-code email admin)
      const adminEmail = 'admin@smartlock.com';
      if (user.email === adminEmail) {
        Alert.alert('Đăng nhập Admin thành công', `Chào mừng Admin ${user.email}`);
        navigation.navigate('AdminHomeScreen'); // Màn hình Admin
      } else {
        Alert.alert('Đăng nhập thành công', `Chào mừng ${user.email || user.phoneNumber}`);
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Email không đúng định dạng.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Không tìm thấy tài khoản với email/số điện thoại này.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mật khẩu không chính xác.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Đăng nhập quá nhiều lần. Vui lòng thử lại sau.';
          break;
        default:
          break;
      }
      setErrorMessages((prev) => ({ ...prev, password: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  // Hiệu ứng nhấn nút (Animation)
  const handlePressIn = () => {
    Animated.timing(buttonScale, {
      toValue: 0.95,
      duration: 100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Logo hình tròn nhỏ ở trên đầu */}
      <View style={styles.logoWrapper}>
        <View style={styles.logoCircle}>
          {/* Thay thế bằng ảnh logo của bạn (URL hoặc require) */}
          <Image
            source={require('../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animatable.View animation="fadeInDown" duration={600} style={styles.formWrapper}>
          {/* Phần tiêu đề được đưa lên gần logo bằng cách giảm khoảng cách */}
          <Text style={styles.title}>Đăng nhập ngay</Text>
          <Text style={styles.subtitle}>Chào mừng bạn đến với SmartLock</Text>

          <Animatable.View animation="fadeInUp" duration={800} delay={200} style={styles.formContainer}>
            {/* Email / SĐT */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errorMessages.identifier && styles.inputError]}
                placeholder="Email hoặc Số điện thoại"
                placeholderTextColor="#999"
                onChangeText={(text) => {
                  setIdentifier(text);
                  validateIdentifier(text);
                }}
                value={identifier}
              />
              {/* Hiển thị icon xác thực */}
              {identifierValid && !errorMessages.identifier && (
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={styles.inputIconRight} />
              )}
              {errorMessages.identifier && (
                <Ionicons name="close-circle" size={20} color="#F44336" style={styles.inputIconRight} />
              )}
            </View>
            {errorMessages.identifier && (
              <Text style={styles.errorText}>{errorMessages.identifier}</Text>
            )}

            {/* Mật khẩu */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errorMessages.password && styles.inputError]}
                placeholder="Mật khẩu"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMessages((prev) => ({ ...prev, password: null }));
                }}
                value={password}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  style={styles.inputIconRight}
                />
              </TouchableOpacity>
            </View>
            {errorMessages.password && <Text style={styles.errorText}>{errorMessages.password}</Text>}

            {/* Nút đăng nhập */}
            <Animated.View style={[styles.animatedButtonContainer, { transform: [{ scale: buttonScale }] }]}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Đăng nhập</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Link đăng ký */}
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerText}>Chưa có tài khoản? Đăng ký</Text>
            </TouchableOpacity>
          </Animatable.View>
        </Animatable.View>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;
