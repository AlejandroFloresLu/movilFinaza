import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getCuentas, addTransaction } from '../services/financeService';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function AddTransactionScreen({ route, navigation }) {
  const { tipo } = route.params || { tipo: 'ingreso' };
  const isIngreso = tipo === 'ingreso';
  const mainColor = isIngreso ? '#10B981' : '#EF4444'; // Emerald for Income, Red for Expense
  const darkColor = isIngreso ? '#059669' : '#DC2626';

  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cuentaId, setCuentaId] = useState('');
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCuentas, setLoadingCuentas] = useState(true);

  useEffect(() => {
    // Dynamic header styling based on type
    navigation.setOptions({
      headerStyle: {
        backgroundColor: mainColor,
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });

    const fetchCuentas = async () => {
      try {
        const response = await getCuentas();
        if (response.data && response.data.length > 0) {
          setCuentas(response.data);
          setCuentaId(response.data[0].id.toString());
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar las cuentas');
      } finally {
        setLoadingCuentas(false);
      }
    };
    fetchCuentas();
  }, [navigation, mainColor]);

  const handleSave = async () => {
    if (!monto || !descripcion || !cuentaId) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const data = {
        tipo,
        cuentaId: parseInt(cuentaId, 10),
        fecha: new Date().toISOString(),
        montoTotal: parseFloat(monto),
        detalles: [
          {
            descripcion,
            monto: parseFloat(monto)
          }
        ]
      };
      
      await addTransaction(data);
      Alert.alert('Éxito', 'Transacción guardada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Error al guardar la transacción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        
        {/* Curved Background Header */}
        <View style={[styles.headerBackground, { backgroundColor: mainColor }]}>
          <View style={[styles.headerCurve, { backgroundColor: darkColor }]} />
          
          <View style={styles.headerIconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons 
                name={isIngreso ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'} 
                size={40} 
                color="#FFFFFF" 
              />
            </View>
            <Text style={styles.headerTitle}>
              {isIngreso ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
            </Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Form Card */}
          <View style={styles.card}>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Monto</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={[styles.input, styles.amountInput, { color: mainColor }]}
                  placeholder="0.00"
                  placeholderTextColor="#D1D5DB"
                  keyboardType="numeric"
                  value={monto}
                  onChangeText={setMonto}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Descripción</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="document-text-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Sueldo, Comida, etc."
                  placeholderTextColor="#9CA3AF"
                  value={descripcion}
                  onChangeText={setDescripcion}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Cuenta Destino</Text>
              {loadingCuentas ? (
                <ActivityIndicator size="small" color={mainColor} style={{ marginTop: 10 }} />
              ) : cuentas.length > 0 ? (
                <View style={styles.pickerWrapper}>
                  <Ionicons name="wallet-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <Picker
                    style={styles.picker}
                    selectedValue={cuentaId}
                    onValueChange={(itemValue) => setCuentaId(itemValue)}
                    dropdownIconColor="#9CA3AF"
                  >
                    {cuentas.map(c => (
                      <Picker.Item key={c.id.toString()} label={c.nombre} value={c.id.toString()} color="#1F2937" />
                    ))}
                  </Picker>
                </View>
              ) : (
                <Text style={styles.errorText}>No hay cuentas disponibles</Text>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: mainColor, shadowColor: mainColor }]} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>GUARDAR TRANSACCIÓN</Text>
              )}
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerBackground: {
    width: '100%',
    height: height * 0.35,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    zIndex: 0,
  },
  headerCurve: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.2,
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    opacity: 0.3,
  },
  headerIconContainer: {
    alignItems: 'center',
    paddingTop: height * 0.05,
  },
  iconCircle: {
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: height * 0.20, // Overlaps the header slightly
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    paddingHorizontal: 15,
    height: 55,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    paddingLeft: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 8,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9CA3AF',
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '800',
  },
  picker: {
    flex: 1,
    height: 55,
    color: '#1F2937',
  },
  errorText: {
    color: '#EF4444',
    fontStyle: 'italic',
    marginTop: 8,
  },
  button: {
    borderRadius: 50,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});
