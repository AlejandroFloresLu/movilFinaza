import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Dimensions, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { getCuentas, addCuenta, deleteCuenta } from '../services/financeService';

const { width, height } = Dimensions.get('window');

export default function CuentasScreen({ navigation }) {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaCuentaNombre, setNuevaCuentaNombre] = useState('');
  const [padreId, setPadreId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCuentas();
  }, [navigation]);

  const loadCuentas = async () => {
    setLoading(true);
    try {
      const data = await getCuentas();
      setCuentas(data.data || []);
    } catch (error) {
      console.error('Error cargando cuentas', error);
      Alert.alert('Error', 'No se pudieron cargar las cuentas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCuenta = async () => {
    if (!nuevaCuentaNombre.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la cuenta');
      return;
    }

    setSaving(true);
    try {
      const data = { nombre: nuevaCuentaNombre.trim(), tipo: 'banco' };
      if (padreId) {
        data.padreId = parseInt(padreId); // Se asume ID numérico
      }
      await addCuenta(data);
      setModalVisible(false);
      setNuevaCuentaNombre('');
      setPadreId('');
      loadCuentas(); // Recargar la lista
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Eliminar Cuenta",
      "¿Estás seguro de que deseas eliminar esta cuenta? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCuenta(id);
              loadCuentas();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la cuenta. Verifica que no tenga transacciones asociadas.');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.cuentaItem}>
      <View style={styles.iconCircle}>
        <Ionicons name="wallet-outline" size={24} color="#6366F1" />
      </View>
      <View style={styles.cuentaDetails}>
        <Text style={styles.cuentaName}>{item.nombre}</Text>
        <Text style={styles.cuentaType}>Cuenta de {item.tipo || 'Ahorros/Corriente'}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Curved Background Header */}
      <View style={styles.headerBackground}>
        <View style={styles.headerCurve} />
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mis Cuentas</Text>
          <Text style={styles.headerSubtitle}>Gestiona tus cuentas bancarias y de efectivo</Text>
        </View>
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={cuentas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="card-outline" size={60} color="#D1D5DB" />
                <Text style={styles.emptyText}>No tienes cuentas registradas.</Text>
                <Text style={styles.emptySubtext}>Crea una para comenzar a registrar movimientos.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity 
          style={styles.bottomActionBtn}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.bottomActionBtnText}>Nueva Cuenta</Text>
        </TouchableOpacity>
      </View>

      {/* Add Cuenta Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Cuenta</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="business-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre (ej. Banco Pichincha)"
                placeholderTextColor="#9CA3AF"
                value={nuevaCuentaNombre}
                onChangeText={setNuevaCuentaNombre}
                autoFocus
              />
            </View>

            <View style={styles.pickerWrapper}>
              <Ionicons name="folder-open-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <Picker
                selectedValue={padreId}
                onValueChange={(itemValue) => setPadreId(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Es una cuenta principal (Sin categoría)" value="" />
                {cuentas.map(cuenta => (
                  <Picker.Item key={cuenta.id} label={`Subcuenta de: ${cuenta.nombre}`} value={cuenta.id.toString()} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleAddCuenta}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>CREAR CUENTA</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerBackground: {
    width: '100%',
    backgroundColor: '#6366F1',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 40,
  },
  headerCurve: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.2,
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    backgroundColor: '#4F46E5',
    opacity: 0.5,
  },
  headerContent: {
    paddingHorizontal: 25,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -20, // Empieza sobre la cabecera
  },
  flatListContent: {
    paddingBottom: 130, // Mucho espacio al final para que el botón flotante (+) no tape el basurero
  },
  cuentaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cuentaDetails: {
    flex: 1,
  },
  cuentaName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  cuentaType: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  emptyText: {
    color: '#4B5563',
    fontSize: 18,
    marginTop: 15,
    fontWeight: 'bold',
  },
  emptySubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    backgroundColor: 'rgba(243, 244, 246, 0.95)',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  bottomActionBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 15,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomActionBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.6)', // Dark semi-transparent
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 25,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
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
    marginBottom: 20,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    paddingLeft: 10, // Un poco menos de padding para el picker
    height: 55,
    marginBottom: 25,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  picker: {
    flex: 1,
    height: 55,
    color: '#1F2937',
  },
  saveButton: {
    backgroundColor: '#6366F1',
    borderRadius: 50,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});
