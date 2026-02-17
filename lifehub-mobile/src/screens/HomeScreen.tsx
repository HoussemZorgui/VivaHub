import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInLeft, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { theme } from '../theme';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');

import { useNavigation } from '@react-navigation/native';

export const HomeScreen = () => {
    const { user } = useAuthStore();
    const navigation = useNavigation<any>();
    const [weather, setWeather] = React.useState<any>(null);

    React.useEffect(() => {
        loadWeather();
    }, []);

    const loadWeather = async () => {
        // Paris coordinates default
        const response = await weatherService.getWeather(48.8566, 2.3522);
        if (response.success) {
            setWeather(response.data);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
            {/* Glass Header Navigation */}
            <View style={styles.glassHeaderContainer}>
                <View style={styles.headerGlass}>
                    <Image source={require('../../assets/images/logo.png')} style={styles.headerLogo} resizeMode="contain" />
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileBtn}>
                        <Ionicons name="person-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.content}>
                {/* Hero Greeting */}
                <Animated.View entering={FadeInLeft.duration(800)} style={styles.heroSection}>
                    <Text style={styles.greetingText}>Content de vous revoir,</Text>
                    <Text style={styles.userNameText}>{user?.firstName || 'Innovateur'} ✨</Text>
                </Animated.View>

                {/* Weather Widget */}
                {weather && (
                    <Animated.View entering={FadeInUp.delay(200)} style={styles.weatherCard}>
                        <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.weatherGradient}>
                            <View>
                                <Text style={styles.weatherTemp}>{Math.round(weather.main.temp)}°</Text>
                                <Text style={styles.weatherCity}>{weather.name}</Text>
                                <Text style={styles.weatherDesc}>{weather.weather[0].description}</Text>
                            </View>
                            <Image
                                source={{ uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png` }}
                                style={{ width: 80, height: 80 }}
                            />
                        </LinearGradient>
                    </Animated.View>
                )}

                {/* 3D Stat Row */}
                <View style={[styles.statGrid, { marginTop: 20 }]}>
                    <Animated.View entering={FadeInUp.delay(300)} style={styles.statusCardLarge}>
                        <LinearGradient colors={['#7c3aed', '#4f46e5']} style={styles.cardGradient}>
                            <View style={styles.cardTop}>
                                <Ionicons name="flash" size={28} color="#fff" />
                                <Text style={styles.cardTag}>Productivité</Text>
                            </View>
                            <Text style={styles.cardBigValue}>84%</Text>
                            <Text style={styles.cardSubText}>Objectifs atteints ce mois-ci</Text>
                        </LinearGradient>
                    </Animated.View>

                    <View style={styles.statColumn}>
                        <Animated.View entering={FadeInRight.delay(400)} style={styles.miniCard}>
                            <Ionicons name="wallet-outline" size={20} color={theme.colors.accent.emerald} />
                            <Text style={styles.miniCardValue}>+12.4%</Text>
                        </Animated.View>
                        <Animated.View entering={FadeInRight.delay(600)} style={styles.miniCard}>
                            <Ionicons name="heart-outline" size={20} color={theme.colors.accent.rose} />
                            <Text style={styles.miniCardValue}>72 bpm</Text>
                        </Animated.View>
                    </View>
                </View>

                {/* Module Exploration */}
                <Text style={styles.sectionTitle}>Modules d'Elite</Text>
                <Animated.View entering={FadeInUp.delay(800)} style={styles.moduleGrid}>
                    {[
                        { title: 'Finance Pro', icon: 'trending-up', color: theme.colors.accent.emerald, desc: 'Analyses 3D', target: 'Finance' },
                        { title: 'Tâches Sync', icon: 'list-outline', color: '#a855f7', desc: 'Gestion Élite', target: 'Tasks' },
                        { title: 'Santé Plus', icon: 'fitness-outline', color: theme.colors.accent.rose, desc: 'Bio-Sync', target: 'Health' },
                        { title: 'Neural AI', icon: 'sparkles-outline', color: theme.colors.primary[400], desc: 'Hugging Face GPT', target: 'AI' },
                    ].map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.moduleSquare}
                            onPress={() => item.target && navigation.navigate(item.target as any)}
                        >
                            <View style={[styles.moduleIconContainer, { backgroundColor: item.color + '15' }]}>
                                <Ionicons name={item.icon as any} size={28} color={item.color} />
                            </View>
                            <Text style={styles.moduleLabel}>{item.title}</Text>
                            <Text style={styles.moduleDesc}>{item.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                {/* AI Predictive Insight */}
                <Animated.View entering={FadeInUp.delay(1000)} style={styles.aiInsightBox}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                        style={styles.insightGradient}
                    >
                        <View style={styles.insightHeader}>
                            <Ionicons name="sparkles" size={20} color={theme.colors.primary[400]} />
                            <Text style={styles.insightTitle}>Insight AI</Text>
                        </View>
                        <Text style={styles.insightText}>
                            "La météo est idéale aujourd'hui. Parfait pour une séance de course à pied vers 18h."
                        </Text>
                    </LinearGradient>
                </Animated.View>
                <View style={{ height: 100 }} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050505' },
    glassHeaderContainer: { paddingTop: 50, paddingHorizontal: 20 },
    headerGlass: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 65,
        backgroundColor: 'rgba(20, 20, 20, 0.7)',
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    headerLogo: { width: 100, height: 35 },
    profileBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    notifBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.accent.rose,
        borderWidth: 1.5,
        borderColor: '#000',
    },
    content: { padding: 25 },
    heroSection: { marginBottom: 35 },
    greetingText: { color: theme.colors.text.secondary, fontSize: 16, fontWeight: '500' },
    userNameText: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 5 },
    statGrid: { flexDirection: 'row', gap: 15, marginBottom: 35 },
    statusCardLarge: { flex: 2, borderRadius: 28, overflow: 'hidden', ...theme.shadows.premium },
    cardGradient: { padding: 20, height: 180, justifyContent: 'space-between' },
    cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cardTag: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
    cardBigValue: { color: '#fff', fontSize: 42, fontWeight: '900' },
    cardSubText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500' },
    statColumn: { flex: 1, gap: 15 },
    miniCard: {
        flex: 1,
        backgroundColor: '#121212',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    miniCardValue: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 5 },
    sectionTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 20 },
    moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 35 },
    moduleSquare: {
        width: (width - 65) / 2,
        backgroundColor: '#121212',
        padding: 20,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    moduleIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    moduleLabel: { color: '#fff', fontSize: 15, fontWeight: '700' },
    moduleDesc: { color: theme.colors.text.muted, fontSize: 12, marginTop: 4 },
    aiInsightBox: { borderRadius: 28, overflow: 'hidden' },
    insightGradient: { padding: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    weatherCard: { borderRadius: 28, overflow: 'hidden', marginBottom: 20 },
    weatherGradient: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    weatherTemp: { fontSize: 48, fontWeight: '900', color: '#fff' },
    weatherCity: { fontSize: 18, fontWeight: '700', color: '#fff', marginTop: 5 },
    weatherDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textTransform: 'capitalize', marginTop: 2 },
    insightTitle: { color: theme.colors.primary[400], fontWeight: '800', fontSize: 14, textTransform: 'uppercase' },
    insightText: { color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 22, fontWeight: '500' },
});
