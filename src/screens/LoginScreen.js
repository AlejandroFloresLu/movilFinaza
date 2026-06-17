import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userStr = await AsyncStorage.getItem('userData');
        if (token && userStr) {
          navigation.replace('Dashboard', { user: JSON.parse(userStr) });
        }
      } catch (error) {
        console.error('Error al verificar el token:', error);
      }
    };
    checkToken();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
        username,
        password
      });
      
      const token = response.data.data?.token || response.data.token;
      const user = response.data.data?.user || response.data.user;

      if (token) {
        await AsyncStorage.setItem('userToken', token);
        if (user) {
          await AsyncStorage.setItem('userData', JSON.stringify(user));
        }
        navigation.replace('Dashboard', { user: user || { nombre_completo: 'Usuario' } });
      }
    } catch (error) {
      let errorMsg = 'Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo.';
      
      if (error.response) {
        const serverMessage = (error.response.data?.error || error.response.data?.message || '').toLowerCase();
        
        if (serverMessage.includes('usuario') || serverMessage.includes('user not found') || serverMessage.includes('no existe')) {
          errorMsg = 'El usuario no existe.';
        } else if (serverMessage.includes('contraseña') || serverMessage.includes('password') || serverMessage.includes('credenciales') || serverMessage.includes('invalid credentials')) {
          errorMsg = 'Contraseña incorrecta.';
        } else if (serverMessage) {
          errorMsg = error.response.data?.error || error.response.data?.message;
        } else if (error.response.status === 401 || error.response.status === 404) {
          errorMsg = 'Usuario no existe o contraseña incorrecta.';
        }
      } else if (error.request) {
        errorMsg = 'Error de red. Verifica tu conexión a internet.';
      }

      Alert.alert('Error de Inicio de Sesión', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Curved Background Header */}
      <View style={styles.headerBackground}>
        <View style={styles.headerCurve} />
      </View>

      <View style={styles.contentContainer}>
        {/* Avatar / Logo Area */}
        <View style={styles.logoContainer}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={45} color="#6366F1" />
          </View>
          <Text style={styles.welcomeText}>¡Bienvenido!</Text>
          <Text style={styles.subtitleText}>Inicia sesión en MiFinanza</Text>
        </View>

        {/* Input Card */}
        <View style={styles.card}>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Usuario"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>INGRESAR</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signupContainer}>
          <Text style={styles.signupText}>¿No tienes cuenta? <Text style={styles.signupTextBold}>Regístrate</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: height * 0.45,
    backgroundColor: '#6366F1', // Primary Purple/Indigo
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    overflow: 'hidden',
  },
  headerCurve: {
    position: 'absolute',
    top: -height * 0.15,
    right: -width * 0.3,
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    backgroundColor: '#4F46E5', // Darker shade for depth
    opacity: 0.4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: height * 0.1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 16,
    color: '#E0E7FF',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    paddingHorizontal: 20,
    marginBottom: 20,
    height: 60,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 35,
  },
  forgotText: {
    color: '#6366F1',
    fontWeight: '700',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 50,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  signupContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  signupText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
  signupTextBold: {
    color: '#6366F1',
    fontWeight: '800',
  }
});
