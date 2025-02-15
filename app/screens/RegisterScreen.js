import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const backgroundImageUrl =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1170&q=80';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [emailCheckIcon, setEmailCheckIcon] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });
  const [inputErrors, setInputErrors] = useState({});
  const auth = getAuth();

  useEffect(() => {
    if (email) {
      setEmailCheckIcon(emailValid ? 'checkmark-circle' : 'close-circle');
    } else {
      setEmailCheckIcon(null);
    }
  }, [email, emailValid]);

  const onChangeDob = (event, selectedDate) => {
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setDob(dateString);
    }
    setShowDatePicker(false);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(re.test(email));
    setInputErrors((prev) => ({
      ...prev,
      email: re.test(email) ? null : 'Email không hợp lệ.',
    }));
  };

  const validatePassword = (password) => {
    const strength = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#\$%^&*(),.?":{}|<>~`]/.test(password),
    };
    setPasswordStrength(strength);

    const isStrong = Object.values(strength).every(Boolean);
    setInputErrors((prev) => ({
      ...prev,
      password: isStrong ? null : 'Mật khẩu không đạt yêu cầu.',
    }));
  };

  const handleRegister = async () => {
    const errors = {};
    if (!emailValid) errors.email = 'Email không hợp lệ.';
    const { length, upper, lower, number, special } = passwordStrength;
    if (!(length && upper && lower && number && special)) {
      errors.password = 'Mật khẩu không đạt yêu cầu.';
    }
    if (!name) errors.name = 'Vui lòng nhập họ và tên.';
    if (!phone) errors.phone = 'Vui lòng nhập số điện thoại.';
    if (!dob) errors.dob = 'Vui lòng chọn ngày sinh.';

    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name,
        phoneNumber: phone,
      });

      Alert.alert('Đăng ký thành công', 'Bạn đã đăng ký thành công!');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email này đã được sử dụng.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email không hợp lệ.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn.';
          break;
        default:
          break;
      }
      Alert.alert('Lỗi đăng ký', errorMessage);
    }
  };

  return (
    <ImageBackground source={{ uri: backgroundImageUrl }} style={styles.backgroundImage}>
      {/* Overlay mờ để dễ nhìn form */}
      <View style={styles.overlay}>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animatable.View animation="fadeInDown" duration={600} style={styles.formWrapper}>
            {/* Tiêu đề */}
            <Text style={styles.title}>Register Now</Text>
            <Text style={styles.subtitle}>Create your account</Text>

            {/* Form đăng ký */}
            <Animatable.View animation="fadeInUp" duration={800} delay={200} style={styles.formContainer}>
              {/* Email */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, inputErrors.email && styles.inputError]}
                  placeholder="Email"
                  placeholderTextColor="#ddd"
                  onChangeText={(value) => {
                    setEmail(value);
                    validateEmail(value);
                  }}
                  value={email}
                  keyboardType="email-address"
                />
                {emailCheckIcon && (
                  <Ionicons
                    name={emailCheckIcon}
                    size={20}
                    style={[
                      styles.inputIconRight,
                      { color: emailValid ? '#4CAF50' : '#F44336' },
                    ]}
                  />
                )}
              </View>
              {inputErrors.email && <Text style={styles.errorText}>{inputErrors.email}</Text>}

              {/* Họ và tên */}
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, inputErrors.name && styles.inputError]}
                  placeholder="Họ và tên"
                  placeholderTextColor="#ddd"
                  onChangeText={setName}
                  value={name}
                />
              </View>
              {inputErrors.name && <Text style={styles.errorText}>{inputErrors.name}</Text>}

              {/* Số điện thoại */}
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, inputErrors.phone && styles.inputError]}
                  placeholder="Số điện thoại"
                  placeholderTextColor="#ddd"
                  onChangeText={setPhone}
                  value={phone}
                  keyboardType="phone-pad"
                />
              </View>
              {inputErrors.phone && <Text style={styles.errorText}>{inputErrors.phone}</Text>}

              {/* Ngày sinh */}
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }, inputErrors.dob && styles.inputError]}
                  placeholder="Ngày sinh (YYYY-MM-DD)"
                  placeholderTextColor="#ddd"
                  value={dob}
                  editable={false}
                />
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <Ionicons name="chevron-down-outline" size={20} style={styles.inputIconRight} />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={dob ? new Date(dob) : new Date()}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onChangeDob}
                  />
                )}
              </View>
              {inputErrors.dob && <Text style={styles.errorText}>{inputErrors.dob}</Text>}

              {/* Mật khẩu */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, inputErrors.password && styles.inputError]}
                  placeholder="Mật khẩu"
                  placeholderTextColor="#ddd"
                  onChangeText={(value) => {
                    setPassword(value);
                    validatePassword(value);
                  }}
                  value={password}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    style={styles.inputIconRight}
                  />
                </TouchableOpacity>
              </View>
              {inputErrors.password && <Text style={styles.errorText}>{inputErrors.password}</Text>}

              {/* Checklist mật khẩu */}
              <View style={styles.passwordChecklist}>
                <Text style={[styles.checkItem, passwordStrength.length && styles.checkItemValid]}>
                  • Tối thiểu 8 ký tự
                </Text>
                <Text style={[styles.checkItem, passwordStrength.upper && styles.checkItemValid]}>
                  • Ít nhất 1 chữ cái in hoa
                </Text>
                <Text style={[styles.checkItem, passwordStrength.lower && styles.checkItemValid]}>
                  • Ít nhất 1 chữ cái thường
                </Text>
                <Text style={[styles.checkItem, passwordStrength.number && styles.checkItemValid]}>
                  • Ít nhất 1 số
                </Text>
                <Text style={[styles.checkItem, passwordStrength.special && styles.checkItemValid]}>
                  • Ít nhất 1 ký tự đặc biệt
                </Text>
              </View>

              {/* Nút đăng ký */}
              <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                <Text style={styles.registerButtonText}>Đăng ký</Text>
              </TouchableOpacity>

              {/* Link chuyển sang Login */}
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>Đã có tài khoản? Đăng nhập</Text>
              </TouchableOpacity>
            </Animatable.View>
          </Animatable.View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

// ========================
//        STYLES
// ========================
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', // Để ảnh nền cover toàn màn hình
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Lớp phủ mờ để dễ nhìn form
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formWrapper: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)', // Form trong suốt
    borderRadius: 10,
    padding: 20,
    // Shadow (Android + iOS)
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
    borderColor: '#F44336',
    borderWidth: 1,
    borderRadius: 8,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4,
  },
  passwordChecklist: {
    marginBottom: 20,
    paddingLeft: 5,
  },
  checkItem: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 3,
  },
  checkItemValid: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default RegisterScreen;
