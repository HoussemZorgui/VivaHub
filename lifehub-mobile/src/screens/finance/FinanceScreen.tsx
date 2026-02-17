import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { financeService } from '../../services/finance.service';

const { width } = Dimensions.get('window');

export const FinanceScreen = () => {
    const [marketData, setMarketData] = useState<any[]>([]);

    const [dashboardData, setDashboardData] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [marketRes, dashboardRes] = await Promise.all([
                financeService.getMarketOverview(),
                financeService.getDashboardData()
            ]);

            if (marketRes.success) {
                setMarketData(marketRes.data);
            }
            if (dashboardRes.success) {
                setDashboardData(dashboardRes.data);
            }
        } catch (error) {
            console.error('Failed to load finance data', error);
        }
    };

    const chartConfig = {
        backgroundGradientFrom: '#121212',
        backgroundGradientTo: '#121212',
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: theme.colors.primary[400],
        }
    };

    // Fallback data if no real data exists
    const incomeData = {
        labels: dashboardData?.chartData?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                data: dashboardData?.chartData?.income.some((v: number) => v > 0)
                    ? dashboardData.chartData.income
                    : [0, 0, 0, 0, 0, 0],
                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                strokeWidth: 2
            }
        ],
        legend: ['Revenus']
    };

    const pieData = dashboardData?.pieData?.length > 0 ? dashboardData.pieData : [
        {
            name: 'Aucune donnée',
            population: 100,
            color: '#333',
            legendFontColor: '#7F7F7F',
            legendFontSize: 12
        }
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={['#1a1a2e', '#050505']}
                style={styles.header}
            >
                <Animated.View entering={FadeInUp.delay(200)}>
                    <Text style={styles.headerTitle}>Tableau de Bord Financier</Text>
                    <View style={styles.balanceCard}>
                        <Text style={styles.balanceLabel}>Solde Total</Text>
                        <Text style={styles.balanceAmount}>{dashboardData?.balance?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) || '0,00 €'}</Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Ionicons name="arrow-up-circle" size={20} color="#10b981" />
                                <Text style={styles.statValue}>+{dashboardData?.income?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) || '0 €'}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons name="arrow-down-circle" size={20} color="#ef4444" />
                                <Text style={styles.statValue}>-{dashboardData?.expense?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) || '0 €'}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </LinearGradient>

            <View style={styles.content}>
                <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Évolution des Revenus</Text>
                    <View style={styles.chartCard}>
                        <LineChart
                            data={incomeData}
                            width={width - 50}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Dépenses par Catégorie</Text>
                    <View style={styles.chartCard}>
                        <PieChart
                            data={pieData}
                            width={width - 50}
                            height={220}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(800)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Transactions Récentes</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>Voir tout</Text>
                        </TouchableOpacity>
                    </View>

                    {dashboardData?.transactions?.length > 0 ? (
                        dashboardData.transactions.map((item: any) => (
                            <View key={item._id} style={styles.transactionCard}>
                                <View style={[styles.iconBox, { backgroundColor: item.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                                    <Ionicons
                                        name={item.type === 'income' ? "arrow-up" : "cart-outline"}
                                        size={24}
                                        color={item.type === 'income' ? "#10b981" : "#ef4444"}
                                    />
                                </View>
                                <View style={styles.transactionInfo}>
                                    <Text style={styles.transactionName}>{item.category}</Text>
                                    <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
                                </View>
                                <Text style={[styles.transactionAmount, { color: item.type === 'income' ? "#10b981" : "#fff" }]}>
                                    {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                </Text>
                            </View>
                        ))) : (
                        <Text style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Aucune transaction récente</Text>
                    )}
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(1000)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Marché Crypto</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>Voir tout</Text>
                        </TouchableOpacity>
                    </View>

                    {marketData.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -5 }}>
                            {marketData.map((item, index) => (
                                <TouchableOpacity key={item.id} style={styles.cryptoCard}>
                                    <View style={styles.cryptoHeader}>
                                        <Image source={{ uri: item.image }} style={styles.cryptoIcon} />
                                        <View>
                                            <Text style={styles.cryptoSymbol}>{item.symbol.toUpperCase()}</Text>
                                            <Text style={styles.cryptoName}>{item.name}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.cryptoPrice}>${(item.current_price || 0).toLocaleString()}</Text>
                                    <Text style={[
                                        styles.cryptoChange,
                                        { color: (item.price_change_percentage_24h || 0) > 0 ? '#10b981' : '#ef4444' }
                                    ]}>
                                        {(item.price_change_percentage_24h || 0) > 0 ? '+' : ''}
                                        {(item.price_change_percentage_24h || 0).toFixed(2)}%
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : (
                        <Text style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 10 }}>Chargement du marché...</Text>
                    )}
                </Animated.View>
            </View>
            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050505' },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 25,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 15,
        textAlign: 'center'
    },
    balanceCard: {
        alignItems: 'center',
        padding: 20,
    },
    balanceLabel: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 5,
    },
    balanceAmount: {
        fontSize: 42,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -1,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 15,
    },
    statValue: {
        color: '#fff',
        marginLeft: 8,
        fontWeight: '700',
        fontSize: 14,
    },
    content: { padding: 25 },
    section: { marginBottom: 30 },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 15,
    },
    seeAll: {
        color: theme.colors.primary[400],
        fontWeight: '700',
        fontSize: 14,
    },
    chartCard: {
        backgroundColor: '#121212',
        borderRadius: 25,
        padding: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        ...theme.shadows.glass,
        alignItems: 'center'
    },
    chart: {
        borderRadius: 16,
        marginVertical: 8,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121212',
        padding: 15,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    transactionInfo: { flex: 1 },
    transactionName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    transactionDate: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        marginTop: 2,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '800',
    },
    cryptoCard: {
        backgroundColor: '#121212',
        borderRadius: 20,
        padding: 15,
        marginHorizontal: 5,
        width: 150,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        ...theme.shadows.glass,
    },
    cryptoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    cryptoIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    cryptoSymbol: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: '700',
    },
    cryptoName: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    cryptoPrice: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 5,
    },
    cryptoChange: {
        fontSize: 12,
        fontWeight: '600',
    },
});
