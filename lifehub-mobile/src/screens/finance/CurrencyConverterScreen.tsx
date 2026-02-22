import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { theme } from '../../theme';
import { financeService } from '../../services/finance.service';

const { width } = Dimensions.get('window');

const CURRENCY_LIST = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£' },
    { code: 'TND', name: 'Tunisian Dinar', flag: '🇹🇳', symbol: 'DT' },
    { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', symbol: 'SR' },
    { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', symbol: 'DH' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', symbol: '$' },
];

export const CurrencyConverterScreen = () => {
    const [amount, setAmount] = useState('1');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [rates, setRates] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [convertedAmount, setConvertedAmount] = useState<string>('0');

    useEffect(() => {
        loadRates();
    }, [fromCurrency]);

    useEffect(() => {
        calculateConversion();
    }, [amount, toCurrency, rates]);

    const loadRates = async () => {
        setLoading(true);
        try {
            const response = await financeService.getExchangeRates(fromCurrency);
            if (response.success) {
                setRates(response.data.rates);
            }
        } catch (error) {
            console.error('Failed to load rates', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateConversion = () => {
        if (!rates || !amount) return;
        const rate = rates[toCurrency];
        if (rate) {
            const result = (parseFloat(amount) * rate).toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            setConvertedAmount(result);
        }
    };

    const swapCurrencies = () => {
        const temp = fromCurrency;
        setFromCurrency(toCurrency);
        setToCurrency(temp);
    };

    const renderCurrencySelector = (current: string, onSelect: (val: string) => void) => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
            {CURRENCY_LIST.map((item) => (
                <TouchableOpacity
                    key={item.code}
                    onPress={() => onSelect(item.code)}
                    style={[
                        styles.currencyTab,
                        current === item.code && styles.currencyTabActive
                    ]}
                >
                    <Text style={styles.tabFlag}>{item.flag}</Text>
                    <Text style={[styles.tabCode, current === item.code && styles.tabCodeActive]}>
                        {item.code}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#000', '#0a0a0a']} style={StyleSheet.absoluteFill} />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header Minimalist */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => { }} style={styles.backBtn}>
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Convertisseur</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Main Input Section */}
                    <Animated.View entering={FadeInDown.duration(600)} style={styles.inputSection}>
                        <Text style={styles.label}>Vous envoyez</Text>
                        <View style={styles.amountRow}>
                            <TextInput
                                style={styles.inputAmount}
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor="#333"
                                selectionColor={theme.colors.primary[400]}
                            />
                            <View style={styles.currencyBadge}>
                                <Text style={styles.badgeFlag}>{CURRENCY_LIST.find(c => c.code === fromCurrency)?.flag}</Text>
                                <Text style={styles.badgeCode}>{fromCurrency}</Text>
                            </View>
                        </View>
                        {renderCurrencySelector(fromCurrency, setFromCurrency)}
                    </Animated.View>

                    {/* Middle Action / Divider */}
                    <View style={styles.dividerSection}>
                        <View style={styles.dividerLine} />
                        <TouchableOpacity onPress={swapCurrencies} style={styles.swapCircle}>
                            <Ionicons name="swap-vertical" size={22} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Result Section */}
                    <Animated.View entering={FadeInUp.duration(600)} style={styles.resultSection}>
                        <Text style={styles.label}>Ils reçoivent</Text>
                        <View style={styles.amountRow}>
                            <Text style={styles.resultAmount} numberOfLines={1}>
                                {loading ? '...' : convertedAmount}
                            </Text>
                            <View style={[styles.currencyBadge, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                <Text style={styles.badgeFlag}>{CURRENCY_LIST.find(c => c.code === toCurrency)?.flag}</Text>
                                <Text style={styles.badgeCode}>{toCurrency}</Text>
                            </View>
                        </View>
                        {renderCurrencySelector(toCurrency, setToCurrency)}
                    </Animated.View>

                    {/* Conversion Rate Info */}
                    {!loading && rates && (
                        <Animated.View entering={ZoomIn} style={styles.rateCard}>
                            <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary[400]} />
                            <Text style={styles.rateText}>
                                1 {fromCurrency} = {rates[toCurrency]?.toFixed(4)} {toCurrency}
                            </Text>
                        </Animated.View>
                    )}

                    {/* Simple Quick List */}
                    <View style={styles.footer}>
                        <Text style={styles.footerLabel}>Taux actualisés à l'instant • Source Élite</Text>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollContent: { paddingHorizontal: 25, paddingTop: 60 },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#111', justifyContent: 'center', alignItems: 'center'
    },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },

    label: { color: '#666', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },

    inputSection: {
        backgroundColor: '#0a0a0a',
        padding: 0
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    inputAmount: {
        fontSize: 48,
        fontWeight: '700',
        color: '#fff',
        flex: 1,
        padding: 0
    },
    resultAmount: {
        fontSize: 48,
        fontWeight: '700',
        color: theme.colors.primary[400],
        flex: 1
    },
    currencyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#222'
    },
    badgeFlag: { fontSize: 18, marginRight: 8 },
    badgeCode: { color: '#fff', fontWeight: '700', fontSize: 14 },

    selectorScroll: { marginTop: 10 },
    currencyTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#080808',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#111'
    },
    currencyTabActive: {
        backgroundColor: theme.colors.primary[400],
        borderColor: theme.colors.primary[400]
    },
    tabFlag: { fontSize: 16, marginRight: 6 },
    tabCode: { color: '#666', fontWeight: '700', fontSize: 13 },
    tabCodeActive: { color: '#fff' },

    dividerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 40
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#151515' },
    swapCircle: {
        width: 46, height: 46, borderRadius: 23,
        backgroundColor: '#111', justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#222',
        marginHorizontal: 15
    },

    resultSection: { marginTop: 0 },

    rateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(98, 0, 238, 0.05)',
        padding: 15,
        borderRadius: 16,
        marginTop: 40,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: 'rgba(98, 0, 238, 0.1)'
    },
    rateText: { color: theme.colors.primary[400], fontSize: 14, fontWeight: '600', marginLeft: 8 },

    footer: { marginTop: 60, alignItems: 'center', marginBottom: 40 },
    footerLabel: { color: '#333', fontSize: 12, fontWeight: '500' }
});
