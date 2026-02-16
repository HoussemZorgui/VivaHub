import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export const FinanceScreen = () => {
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

    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                data: [2500, 3200, 2800, 4500, 3900, 5200],
                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                strokeWidth: 2
            }
        ],
        legend: ['Revenus']
    };

    const pieData = [
        {
            name: 'Logement',
            population: 35,
            color: '#6366f1',
            legendFontColor: '#7F7F7F',
            legendFontSize: 12
        },
        {
            name: 'Alimentation',
            population: 20,
            color: '#10b981',
            legendFontColor: '#7F7F7F',
            legendFontSize: 12
        },
        {
            name: 'Transport',
            population: 15,
            color: '#f59e0b',
            legendFontColor: '#7F7F7F',
            legendFontSize: 12
        },
        {
            name: 'Loisirs',
            population: 20,
            color: '#ec4899',
            legendFontColor: '#7F7F7F',
            legendFontSize: 12
        },
        {
            name: 'Autres',
            population: 10,
            color: '#6b7280',
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
                        <Text style={styles.balanceAmount}>12,450.80 €</Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Ionicons name="arrow-up-circle" size={20} color="#10b981" />
                                <Text style={styles.statValue}>+2,100 €</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons name="arrow-down-circle" size={20} color="#ef4444" />
                                <Text style={styles.statValue}>-850 €</Text>
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
                            data={data}
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

                    {[1, 2, 3].map((item) => (
                        <View key={item} style={styles.transactionCard}>
                            <View style={[styles.iconBox, { backgroundColor: item === 2 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                                <Ionicons
                                    name={item === 2 ? "business-outline" : "cart-outline"}
                                    size={24}
                                    color={item === 2 ? "#10b981" : "#ef4444"}
                                />
                            </View>
                            <View style={styles.transactionInfo}>
                                <Text style={styles.transactionName}>{item === 2 ? "Salaire Mensuel" : "Supermarché City"}</Text>
                                <Text style={styles.transactionDate}>16 Fév 2026</Text>
                            </View>
                            <Text style={[styles.transactionAmount, { color: item === 2 ? "#10b981" : "#fff" }]}>
                                {item === 2 ? "+3,200.00 €" : "-45.20 €"}
                            </Text>
                        </View>
                    ))}
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
});
