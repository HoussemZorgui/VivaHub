import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, RefreshControl, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { financeService } from '../../services/finance.service';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export const CryptoMarketScreen = () => {
    const navigation = useNavigation();
    const [marketData, setMarketData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await financeService.getMarketOverview();
            if (response.success) {
                setMarketData(response.data);
                setFilteredData(response.data);
            }
        } catch (error) {
            console.error('Failed to load crypto market', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredData(marketData);
        } else {
            const filtered = marketData.filter(item =>
                item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.symbol.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredData(filtered);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#1a1a2e', '#050505']} style={styles.header}>
                <View style={styles.navBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Marché Crypto</Text>
                    <TouchableOpacity onPress={loadData}>
                        <Ionicons name="settings-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher une crypto..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadData} tintColor={theme.colors.primary[400]} />
                }
            >
                {loading && marketData.length === 0 ? (
                    <ActivityIndicator size="large" color={theme.colors.primary[400]} style={{ marginTop: 50 }} />
                ) : (
                    filteredData.map((item, index) => (
                        <Animated.View
                            key={item.id}
                            entering={FadeInDown.delay(index * 50)}
                        >
                            <TouchableOpacity style={styles.cryptoItem}>
                                <View style={styles.leftInfo}>
                                    <Text style={styles.rank}>#{item.market_cap_rank}</Text>
                                    <Image source={{ uri: item.image }} style={styles.cryptoIcon} />
                                    <View>
                                        <Text style={styles.cryptoName}>{item.name}</Text>
                                        <Text style={styles.cryptoSymbol}>{item.symbol.toUpperCase()}</Text>
                                    </View>
                                </View>
                                <View style={styles.rightInfo}>
                                    <Text style={styles.cryptoPrice}>${(item.current_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                                    <View style={[
                                        styles.changeBadge,
                                        { backgroundColor: (item.price_change_percentage_24h || 0) > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
                                    ]}>
                                        <Text style={[
                                            styles.changeText,
                                            { color: (item.price_change_percentage_24h || 0) > 0 ? '#10b981' : '#ef4444' }
                                        ]}>
                                            {(item.price_change_percentage_24h || 0) > 0 ? '+' : ''}
                                            {(item.price_change_percentage_24h || 0).toFixed(2)}%
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))
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
        marginBottom: 25,
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 45,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    searchIcon: { marginRight: 10 },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    cryptoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#111',
        padding: 15,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    leftInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rank: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        fontWeight: '700',
        marginRight: 10,
        width: 25,
    },
    cryptoIcon: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        marginRight: 12,
    },
    cryptoName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    cryptoSymbol: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: '600',
    },
    rightInfo: {
        alignItems: 'flex-end',
    },
    cryptoPrice: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 4,
    },
    changeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    changeText: {
        fontSize: 12,
        fontWeight: '700',
    },
});
