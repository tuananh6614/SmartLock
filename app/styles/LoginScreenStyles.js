import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8EFE3FF', // Màu nền pastel nhẹ (đồng bộ với RegisterScreen)
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 0,
    justifyContent: 'center',
  },
  // Logo Wrapper: chứa logo và giảm khoảng cách xuống dưới để tiêu đề hiển thị gần hơn
  logoWrapper: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 100 : 100,       // Giá trị khác nhau cho iOS và Android
    marginBottom: Platform.OS === 'ios' ? -230 : -100,// Giảm marginBottom từ 10 xuống 5 để phần tiêu đề gần logo hơn
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    // Đổ bóng nhẹ kiểu Neumorphism
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  formWrapper: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    // Không thêm marginTop để tiêu đề hiển thị gần logo
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    // Hiệu ứng nổi (Neumorphism)
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
    // Đổ bóng nhẹ
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  inputIcon: {
    color: '#888',
    marginRight: 8,
  },
  inputIconRight: {
    color: '#888',
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
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
  animatedButtonContainer: {
    marginTop: 10,
  },
  loginButton: {
    backgroundColor: '#ff9966', // Màu cam nhạt/gradient đồng bộ
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    // Bóng nhẹ
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerText: {
    color: '#333',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default styles; 