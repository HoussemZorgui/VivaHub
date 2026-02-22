import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { financeService } from '../../services/finance.service';
import { useNavigation } from '@react-navigation/native';

export const TransactionsScreen = () => {
    const navigation = useNavigation();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await financeService.getTransactions();
            if (response.success) {
                setTransactions(response.data);
            }
        } catch (error) {
            console.error('Failed to load transactions', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#1a1a2e', '#050505']} style={styles.header}>
                <View style={styles.navBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Historique</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadData} tintColor={theme.colors.primary[400]} />
                }
            >
                {loading && transactions.length === 0 ? (
                    <ActivityIndicator size="large" color={theme.colors.primary[400]} style={{ marginTop: 50 }} />
                ) : transactions.length > 0 ? (
                    transactions.map((item, index) => (
                        <Animated.View
                            key={item._id}
                            entering={FadeInDown.delay(index * 30)}
                        >
                            <View style={styles.transactionCard}>
                                <View style={[styles.iconBox, { backgroundColor: item.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                                    <Ionicons
                                        name={item.type === 'income' ? "arrow-up" : "cart-outline"}
                                        size={24}
                                        color={item.type === 'income' ? "#10b981" : "#ef4444"}
                                    />
                                </View>
                                <View style={styles.transactionInfo}>
                                    <Text style={styles.transactionName}>{item.category}</Text>
                                    <Text style={styles.transactionDesc}>{item.description || 'Pas de description'}</Text>
                                    <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                </View>
                                <Text style={[styles.transactionAmount, { color: item.type === 'income' ? "#10b981" : "#fff" }]}>
                                    {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                </Text>
                            </View>
                        </Animated.View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>Aucune transaction enregistrée</Text>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050505' },
    header: {
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
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
    transactionDesc: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginTop: 2,
    },
    transactionDate: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 11,
        marginTop: 4,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '800',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        marginTop: 100,
        fontSize: 16,
    }
});
