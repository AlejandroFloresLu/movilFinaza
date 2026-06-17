import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Dimensions, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTransactions } from '../services/financeService';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function DashboardScreen({ route, navigation }) {
  const { user } = route.params || { user: { nombre_completo: 'Usuario' } };
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data.data || []);
    } catch (error) {
      console.error('Error cargando transacciones', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    navigation.replace('Login');
  };

  const getMesActualNombre = () => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[new Date().getMonth()];
  };

  const calculateFinances = () => {
    let totalAcumulado = 0;
    let ingresosMes = 0;
    let gastosMes = 0;
    
    const mesActual = new Date().getMonth();
    const añoActual = new Date().getFullYear();

    transactions.forEach(curr => {
      const monto = parseFloat(curr.montoTotal || 0);
      const fechaTx = curr.fecha ? new Date(curr.fecha) : new Date();
      
      // Balance total histórico
      if (curr.tipo === 'ingreso') {
        totalAcumulado += monto;
      } else {
        totalAcumulado -= monto;
      }

      // Resumen exclusivo del mes actual
      if (fechaTx.getMonth() === mesActual && fechaTx.getFullYear() === añoActual) {
        if (curr.tipo === 'ingreso') {
          ingresosMes += monto;
        } else {
          gastosMes += monto;
        }
      }
    });

    // Calcular porcentaje de ingresos gastados (máx 100% para la barra visual)
    let porcentajeGastado = ingresosMes > 0 ? (gastosMes / ingresosMes) * 100 : (gastosMes > 0 ? 100 : 0);
    if (porcentajeGastado > 100) porcentajeGastado = 100;

    return { total: totalAcumulado, ingresosMes, gastosMes, porcentajeGastado };
  };

  const finances = calculateFinances();

  const renderItem = ({ item }) => {
    const isIngreso = item.tipo === 'ingreso';
    return (
      <View style={styles.transactionItem}>
        <View style={[styles.iconCircle, { backgroundColor: isIngreso ? '#D1FAE5' : '#FEE2E2' }]}>
          <Ionicons 
            name={isIngreso ? 'arrow-up-outline' : 'arrow-down-outline'} 
            size={24} 
            color={isIngreso ? '#10B981' : '#EF4444'} 
          />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionType}>{isIngreso ? 'Ingreso' : 'Gasto'}</Text>
          <Text style={styles.transactionDate}>{item.fecha ? item.fecha.split('T')[0] : ''}</Text>
        </View>
        <Text style={[styles.transactionAmount, { color: isIngreso ? '#10B981' : '#EF4444' }]}>
          {isIngreso ? '+' : '-'}${parseFloat(item.montoTotal).toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Curved Background Header */}
      <View style={styles.headerBackground}>
        <View style={styles.headerCurve} />
        
        {/* Header Content */}
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View>
              <Text style={styles.greetingText}>¡Hola,</Text>
              <Text style={styles.userNameText}>{user.nombre_completo}!</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Floating Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>Mi Dinero Disponible</Text>
        <Text style={styles.balanceAmount}>
          ${finances.total.toFixed(2)}
        </Text>
        
        {/* Income and Expense Monthly Summary */}
        <View style={styles.financeSummary}>
          <Text style={styles.summaryMonthTitle}>Resumen de {getMesActualNombre()}</Text>
          
          <View style={styles.financeRow}>
            <View style={styles.financeItem}>
              <View style={[styles.financeIconCircle, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="arrow-up" size={16} color="#10B981" />
              </View>
              <View>
                <Text style={styles.financeLabel}>Ingresos</Text>
                <Text style={styles.financeValueIngreso}>${finances.ingresosMes.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.financeDivider} />

            <View style={styles.financeItem}>
              <View style={[styles.financeIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="arrow-down" size={16} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.financeLabel}>Gastos</Text>
                <Text style={styles.financeValueGasto}>${finances.gastosMes.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Budget Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  width: `${finances.porcentajeGastado}%`, 
                  backgroundColor: finances.porcentajeGastado > 85 ? '#EF4444' : (finances.porcentajeGastado > 60 ? '#F59E0B' : '#10B981') 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {finances.porcentajeGastado.toFixed(0)}% de tus ingresos mensuales gastados
          </Text>

        </View>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity 
          style={[styles.quickActionBtn, { backgroundColor: '#D1FAE5' }]} 
          onPress={() => navigation.navigate('AddTransaction', { tipo: 'ingreso' })}
        >
          <Ionicons name="add-circle" size={20} color="#10B981" />
          <Text style={[styles.quickActionText, { color: '#10B981' }]}>Nuevo Ingreso</Text>
        </TouchableOpacity>
        <View style={{width: 15}} />
        <TouchableOpacity 
          style={[styles.quickActionBtn, { backgroundColor: '#FEE2E2' }]} 
          onPress={() => navigation.navigate('AddTransaction', { tipo: 'gasto' })}
        >
          <Ionicons name="remove-circle" size={20} color="#EF4444" />
          <Text style={[styles.quickActionText, { color: '#EF4444' }]}>Nuevo Gasto</Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Actividad Reciente</Text>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={50} color="#D1D5DB" />
                <Text style={styles.emptyText}>No hay transacciones aún.</Text>
              </View>
            }
          />
        )}
      </View>
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
    backgroundColor: '#6366F1', // Primary Indigo
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 90, // Creates space for the card to overlap without hitting the text
  },
  headerCurve: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.2,
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    backgroundColor: '#4F46E5', // Darker shade
    opacity: 0.5,
  },
  headerContent: {
    paddingHorizontal: 30,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 15,
    color: '#E0E7FF',
    fontWeight: '500',
    marginBottom: 2, 
  },
  userNameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 50,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, 
    padding: 20,
    marginHorizontal: 20,
    marginTop: -50, // Pulls the card up to overlap the header cleanly
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    alignItems: 'center',
    zIndex: 1,
  },
  balanceTitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 20,
  },
  financeSummary: {
    width: '100%',
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryMonthTitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  financeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  financeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  financeIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  financeLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  financeValueIngreso: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  financeValueGasto: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  financeDivider: {
    width: 1,
    height: 35,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 10,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15, // Spaced out
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 20, 
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  quickActionText: {
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15, // Reduced padding
    borderRadius: 16, // Softer corners
    marginBottom: 12, // More spacing between items
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 10,
    fontWeight: '500',
  }
});
