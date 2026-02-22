import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, RefreshControl, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { financeService } from '../../services/finance.service';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const CATEGORIES = ['Alimentation', 'Loyer', 'Loisirs', 'Transport', 'Shopping', 'Santé', 'Salaire', 'Autre'];

export const FinanceScreen = () => {
    const navigation = useNavigation<any>();
    const [marketData, setMarketData] = useState<any[]>([]);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Autre');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const handleAddTransaction = async () => {
        const cleanAmount = amount.replace(',', '.');
        if (!cleanAmount || isNaN(Number(cleanAmount))) {
            Alert.alert("Attention", "Veuillez entrer un montant valide.");
            return;
        }

        setSubmitting(true);
        try {
            await financeService.addTransaction({
                type: transactionType,
                amount: Number(cleanAmount),
                category,
                description,
                date: new Date()
            });
            Alert.alert("Succès", "La transaction a été enregistrée !");
            setModalVisible(false);
            setAmount('');
            setCategory('Autre');
            setDescription('');
            loadData();
        } catch (error) {
            console.error('Failed to add transaction', error);
            Alert.alert("Erreur", "Impossible d'enregistrer la transaction.");
        } finally {
            setSubmitting(false);
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

    const incomeData = {
        labels: dashboardData?.chartData?.labels?.length > 0 ? dashboardData.chartData.labels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                data: dashboardData?.chartData?.income?.some((v: number) => v > 0)
                    ? dashboardData.chartData.income
                    : [0, 0, 0, 0, 0, 0],
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                strokeWidth: 2
            },
            {
                data: dashboardData?.chartData?.expenses?.some((v: number) => v > 0)
                    ? dashboardData.chartData.expenses
                    : [0, 0, 0, 0, 0, 0],
                color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                strokeWidth: 2
            }
        ],
        legend: ['Revenus', 'Dépenses']
    };

    const pieData = dashboardData?.pieData?.length > 0 ? dashboardData.pieData : [
        {
            name: 'Pas de données',
            population: 100,
            color: '#333',
            legendFontColor: '#7F7F7F',
            legendFontSize: 12
        }
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#050505' }}>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadData} tintColor={theme.colors.primary[400]} />
                }
            >
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
                        <Text style={styles.sectionTitle}>Flux de Trésorerie</Text>
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
                            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
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
                            <TouchableOpacity onPress={() => navigation.navigate('CryptoMarket')}>
                                <Text style={styles.seeAll}>Voir tout</Text>
                            </TouchableOpacity>
                        </View>

                        {marketData.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -5 }}>
                                {marketData.map((item) => (
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

            {/* Add Transaction FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
            >
                <LinearGradient colors={[theme.colors.primary[400], theme.colors.primary[600]]} style={styles.fabGradient}>
                    <Ionicons name="add" size={32} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>

            {/* Transaction Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
                    <Animated.View entering={FadeInDown.duration(300)} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Nouvelle Opération</Text>
                                <Text style={styles.modalSubtitle}>Gérez votre budget librement</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                            <View style={styles.typeSelector}>
                                <TouchableOpacity
                                    style={[styles.typeBtn, transactionType === 'expense' && styles.typeBtnActiveExpense]}
                                    onPress={() => setTransactionType('expense')}
                                >
                                    <Text style={[styles.typeText, transactionType === 'expense' && styles.typeTextActive]}>Dépense</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeBtn, transactionType === 'income' && styles.typeBtnActiveIncome]}
                                    onPress={() => setTransactionType('income')}
                                >
                                    <Text style={[styles.typeText, transactionType === 'income' && styles.typeTextActive]}>Revenu</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.formLabel}>Montant (€)</Text>
                            <TextInput
                                style={styles.amountInput}
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                                placeholder="0.00"
                                placeholderTextColor="#333"
                                selectionColor={theme.colors.primary[400]}
                            />

                            <Text style={styles.formLabel}>Catégorie</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ paddingBottom: 10 }}>
                                {CATEGORIES.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.catChip, category === cat && styles.catChipActive]}
                                        onPress={() => setCategory(cat)}
                                    >
                                        <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.formLabel}>Description</Text>
                            <TextInput
                                style={styles.descInput}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Diner, Loyer Janvier..."
                                placeholderTextColor="#333"
                                selectionColor={theme.colors.primary[400]}
                            />

                            <TouchableOpacity
                                style={[styles.submitBtn, (!amount || submitting) && { opacity: 0.5 }]}
                                onPress={handleAddTransaction}
                                disabled={!amount || submitting}
                            >
                                <LinearGradient colors={[theme.colors.primary[400], theme.colors.primary[600]]} style={styles.submitGradient}>
                                    {submitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitText}>Enregistrer</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </KeyboardAvoidingView>
                    </Animated.View>
                </View>
            </Modal>
        </View>
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
    // FAB
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 25,
        width: 60,
        height: 60,
        borderRadius: 30,
        ...theme.shadows.premium,
        elevation: 8,
    },
    fabGradient: {
        flex: 1,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#111',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        padding: 25,
        paddingBottom: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        zIndex: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 25,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '800',
    },
    modalSubtitle: {
        color: '#666',
        fontSize: 14,
        marginTop: 2,
    },
    closeBtn: {
        width: 36,
        height: 36,
        backgroundColor: '#222',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: '#0a0a0a',
        borderRadius: 20,
        padding: 5,
        marginBottom: 25,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 15,
    },
    typeBtnActiveExpense: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    typeBtnActiveIncome: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    typeText: {
        color: '#666',
        fontWeight: '700',
    },
    typeTextActive: {
        color: '#fff',
    },
    formLabel: {
        color: '#888',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 10,
        letterSpacing: 1,
    },
    amountInput: {
        backgroundColor: '#0a0a0a',
        borderRadius: 20,
        padding: 20,
        color: '#fff',
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    catScroll: {
        marginBottom: 25,
    },
    catChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 15,
        backgroundColor: '#0a0a0a',
        borderWidth: 1,
        borderColor: '#1a1a1a',
        marginRight: 10,
    },
    catChipActive: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
    },
    catText: {
        color: '#666',
        fontWeight: '600',
    },
    catTextActive: {
        color: theme.colors.primary[400],
    },
    descInput: {
        backgroundColor: '#0a0a0a',
        borderRadius: 15,
        padding: 15,
        color: '#fff',
        fontSize: 16,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    submitBtn: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    submitGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    submitText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
});
