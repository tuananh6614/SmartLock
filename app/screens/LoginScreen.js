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
  ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

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

// ========== Ảnh nền ==========
const backgroundImageUrl =
  'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=1170&q=80';

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

  // Hiệu ứng nhấn nút
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
    <ImageBackground source={{ uri: backgroundImageUrl }} style={styles.backgroundImage}>
      {/* Lớp phủ mờ */}
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animatable.View animation="fadeInDown" duration={600} style={styles.headerContainer}>
            <Text style={styles.title}>Đăng nhập ngay</Text>
            <Text style={styles.subtitle}>Chào mừng bạn đến với SmartLock</Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={800} delay={200} style={styles.formContainer}>
            {/* Email / SĐT */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errorMessages.identifier && styles.inputError]}
                placeholder="Email hoặc Số điện thoại"
                placeholderTextColor="#ddd"
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
                placeholderTextColor="#ddd"
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
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

// =============================
//         STYLES
// =============================
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Phủ lớp mờ
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.1)', // Form bán trong suốt
    borderRadius: 10,
    padding: 20,
    // Shadow
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  inputIcon: {
    color: '#fff',
    marginRight: 8,
  },
  inputIconRight: {
    color: '#fff',
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    padding: 0,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 8,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4,
  },
  animatedButtonContainer: {
    marginTop: 10,
  },
  loginButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
    marginTop: 20,
  },
});

export default LoginScreen;
