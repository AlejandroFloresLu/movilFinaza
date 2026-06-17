import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getTransactions, getCuentas } from '../services/financeService';

const { width, height } = Dimensions.get('window');

export default function ReportsScreen() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);
  const [totalGastosMes, setTotalGastosMes] = useState(0);
  const isFocused = useIsFocused();

  const loadData = async () => {
    setLoading(true);
    try {
      const [txsData, cuentasData] = await Promise.all([
        getTransactions(),
        getCuentas()
      ]);

      const transacciones = txsData.data || [];
      const cuentas = cuentasData.data || [];
      
      const cuentasMap = {};
      cuentas.forEach(c => {
        cuentasMap[c.id] = c.nombre;
      });

      const mesActual = new Date().getMonth();
      const añoActual = new Date().getFullYear();

      // Only count expenses for the current month
      let totalGastos = 0;
      const gastosPorCuenta = {};

      transacciones.forEach(tx => {
        const fechaTx = tx.fecha ? new Date(tx.fecha) : new Date();
        
        if (tx.tipo === 'gasto' && fechaTx.getMonth() === mesActual && fechaTx.getFullYear() === añoActual) {
          const monto = parseFloat(tx.montoTotal || 0);
          totalGastos += monto;
          
          const cuentaId = tx.cuentaId;
          const cuentaNombre = cuentasMap[cuentaId] || 'Sin Categoría';

          if (!gastosPorCuenta[cuentaNombre]) {
            gastosPorCuenta[cuentaNombre] = 0;
          }
          gastosPorCuenta[cuentaNombre] += monto;
        }
      });

      setTotalGastosMes(totalGastos);

      // Convert to array and sort by amount descending
      const reportArray = Object.keys(gastosPorCuenta).map(nombre => ({
        id: nombre,
        nombre: nombre,
        monto: gastosPorCuenta[nombre],
        porcentaje: totalGastos > 0 ? (gastosPorCuenta[nombre] / totalGastos) * 100 : 0
      })).sort((a, b) => b.monto - a.monto);

      setReportData(reportArray);

    } catch (error) {
      console.error('Error cargando reportes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const getMesActualNombre = () => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[new Date().getMonth()];
  };

  const renderItem = ({ item, index }) => {
    // Generate a different color for each category based on index
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    const barColor = colors[index % colors.length];

    return (
      <View style={styles.categoryItem}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryName}>{item.nombre}</Text>
          <Text style={styles.categoryAmount}>${item.monto.toFixed(2)}</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${item.porcentaje}%`, backgroundColor: barColor }]} />
        </View>
        <Text style={styles.percentageText}>{item.porcentaje.toFixed(1)}% del total</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBackground}>
        <View style={styles.headerCurve} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Análisis de Gastos</Text>
          <Text style={styles.headerSubtitle}>Desglose del mes de {getMesActualNombre()}</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Total Gastado</Text>
        <Text style={styles.summaryAmount}>${totalGastosMes.toFixed(2)}</Text>
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={reportData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="pie-chart-outline" size={60} color="#D1D5DB" />
                <Text style={styles.emptyText}>No hay gastos registrados este mes.</Text>
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
    backgroundColor: '#6366F1',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    paddingTop: 70,
    paddingBottom: 90,
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: -60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    alignItems: 'center',
    zIndex: 1,
  },
  summaryTitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  summaryAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#EF4444',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  flatListContent: {
    paddingBottom: 40,
  },
  categoryItem: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#374151',
  },
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 15,
    marginTop: 15,
    fontWeight: '500',
  }
});
