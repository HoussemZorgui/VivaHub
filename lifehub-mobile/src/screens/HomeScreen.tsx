import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInLeft, FadeInRight, FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { theme } from '../theme';
import { useAuthStore } from '../store/authStore';
import { useNavigation } from '@react-navigation/native';
import { weatherService } from '../services/weather.service';
import { useTaskStore } from '../store/taskStore';

const { width } = Dimensions.get('window');

// Reusable 3D Glass Card Component - Improved Visibility
const GlassCard = ({ children, style, delay = 0, onPress }: any) => (
    <Animated.View entering={FadeInUp.delay(delay).springify()} style={[styles.glassCardWrapper, style]}>
        <TouchableOpacity activeOpacity={0.7} onPress={onPress} disabled={!onPress} style={{ flex: 1 }}>
            <LinearGradient
                colors={['#252525', '#101010']} // Lighter dark grey to define card shape
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.glassCardInner}
            >
                {/* 3D Highlight Border Top/Left */}
                <View style={styles.glassBorderTop} />
                {children}
            </LinearGradient>
        </TouchableOpacity>
    </Animated.View>
);

export const HomeScreen = () => {
    const { user } = useAuthStore();
    const navigation = useNavigation<any>();
    const [weather, setWeather] = React.useState<any>(null);

    React.useEffect(() => {
        loadWeather();
    }, []);

    const loadWeather = async () => {
        const response = await weatherService.getWeather(48.8566, 2.3522);
        if (response.success) {
            setWeather(response.data);
        }
    };

    const { tasks } = useTaskStore();
    const productivity = tasks.length > 0
        ? Math.round((tasks.filter((t: any) => t.completed).length / tasks.length) * 100)
        : 0;

    const modules = [
        { title: 'Finance Pro', icon: 'trending-up', color: theme.colors.accent.emerald, desc: 'Analyses 3D', target: 'Finance' },
        { title: 'Tâches Sync', icon: 'list-outline', color: '#a855f7', desc: 'Gestion Élite', target: 'Tasks' },
        { title: 'Santé Plus', icon: 'fitness-outline', color: theme.colors.accent.rose, desc: 'Bio-Sync', target: 'Health' },
        { title: 'Neural AI', icon: 'sparkles-outline', color: theme.colors.primary[400], desc: 'Hugging Face GPT', target: 'AI' },
    ];

    return (
        <View style={styles.container}>
            {/* ... Background remains same ... */}
            <LinearGradient
                colors={['#000000', '#0a0510', '#050505']}
                style={StyleSheet.absoluteFill}
            />
            {/* Ambient Glow Orbs */}
            <View style={[styles.glowOrb, { top: -100, left: -50, backgroundColor: theme.colors.primary[500] }]} />
            <View style={[styles.glowOrb, { bottom: 100, right: -50, backgroundColor: '#8b5cf6' }]} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header ... */}
                <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
                    <Image source={require('../../assets/images/logo.png')} style={styles.headerLogo} resizeMode="contain" />
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileBtn}>
                        <LinearGradient colors={['#333', '#111']} style={styles.profileGradient}>
                            <Ionicons name="person" size={20} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {/* Hero Greeting ... */}
                <View style={styles.heroSection}>
                    <Animated.Text entering={FadeInLeft.delay(200)} style={styles.greetingText}>Bonjour,</Animated.Text>
                    <Animated.Text entering={FadeInLeft.delay(400)} style={styles.userNameText}>
                        {user?.firstName || 'User'} <Text style={{ color: theme.colors.primary[400] }}>Pro</Text>
                    </Animated.Text>
                </View>

                {/* Weather ... */}
                {weather && (
                    <Animated.View entering={ZoomIn.delay(300)} style={styles.weatherContainer}>
                        <LinearGradient
                            colors={['#3b82f6', '#1d4ed8']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.weatherCard3D}
                        >
                            <View style={styles.weatherInfo}>
                                <Text style={styles.weatherTemp}>{Math.round(weather.main.temp)}°</Text>
                                <View>
                                    <Text style={styles.weatherCity}>{weather.name}</Text>
                                    <Text style={styles.weatherDesc}>{weather.weather[0].description}</Text>
                                </View>
                            </View>
                            <Image
                                source={{ uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png` }}
                                style={styles.weatherIcon}
                            />
                        </LinearGradient>
                    </Animated.View>
                )}

                {/* KPI Dashboard Grid */}
                <View style={styles.kpiGrid}>
                    <GlassCard delay={400} style={{ flex: 2 }}>
                        <LinearGradient colors={['rgba(124, 58, 237, 0.2)', 'rgba(0,0,0,0)']} style={styles.kpiContent}>
                            <View style={styles.kpiHeader}>
                                <View style={[styles.iconBox, { backgroundColor: '#7c3aed' }]}>
                                    <Ionicons name="flash" size={16} color="#fff" />
                                </View>
                                <Text style={styles.kpiLabel}>Productivité</Text>
                            </View>
                            <Text style={styles.kpiValue}>{productivity}%</Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${productivity}%` }]} />
                            </View>
                        </LinearGradient>
                    </GlassCard>

                    <View style={styles.kpiColumn}>
                        <GlassCard delay={500} style={{ flex: 1 }}>
                            <View style={[styles.kpiContent, { padding: 15, justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="heart" size={24} color={theme.colors.accent.rose} />
                                <Text style={styles.miniKpiValue}>72 <Text style={{ fontSize: 12, color: '#888' }}>bpm</Text></Text>
                            </View>
                        </GlassCard>
                        <GlassCard delay={600} style={{ flex: 1 }}>
                            <View style={[styles.kpiContent, { padding: 15, justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="wallet" size={24} color={theme.colors.accent.emerald} />
                                <Text style={styles.miniKpiValue}>+12%</Text>
                            </View>
                        </GlassCard>
                    </View>
                </View>

                {/* Modules 3D Grid */}
                <Text style={styles.sectionTitle}>Modules d'Elite</Text>
                <View style={styles.moduleGrid}>
                    {modules.map((item, index) => (
                        <GlassCard
                            key={index}
                            delay={700 + (index * 100)}
                            style={styles.moduleCard}
                            onPress={() => item.target && navigation.navigate(item.target)}
                        >
                            <View style={styles.moduleContent}>
                                <View style={[styles.moduleIcon, { backgroundColor: item.color + '20', borderColor: item.color + '40' }]}>
                                    <Ionicons name={item.icon as any} size={28} color={item.color} />
                                </View>
                                <Text style={styles.moduleTitle}>{item.title}</Text>
                                <Text style={styles.moduleSubtitle}>{item.desc}</Text>
                            </View>
                        </GlassCard>
                    ))}
                </View>

                {/* AI Insight Pill */}
                <GlassCard delay={1200} style={styles.aiPill}>
                    <View style={styles.aiContent}>
                        <LinearGradient colors={[theme.colors.primary[400], theme.colors.primary[600]]} style={styles.aiIconBadge}>
                            <Ionicons name="sparkles" size={16} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.aiText} numberOfLines={1}>
                            "Suggestion : 20min de méditation ce soir ?"
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </View>
                </GlassCard>

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollContent: { paddingTop: 60, paddingHorizontal: 20 },

    // Ambient Glow
    glowOrb: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.15,
        filter: 'blur(80px)', // Will work on supported platforms
    },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    headerLogo: { width: 220, height: 80 },
    profileBtn: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', ...theme.shadows.premium },
    profileGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333', borderRadius: 25 },

    // Text
    heroSection: { marginBottom: 30 },
    greetingText: { color: '#888', fontSize: 20, fontWeight: '500' },
    userNameText: { color: '#fff', fontSize: 36, fontWeight: '800' },
    sectionTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 20, marginTop: 10, letterSpacing: 0.5 },

    // Glass Card Helpers
    glassCardWrapper: {
        borderRadius: 24,
        overflow: 'hidden',
        // Removed opaque background to let gradient shine
        ...theme.shadows.premium,
        marginVertical: 5, // Spacing
    },
    glassCardInner: { padding: 0, flex: 1 }, // Ensure full fill
    glassBorderTop: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 1.5,
        backgroundColor: 'rgba(255,255,255,0.2)', // Brighter highlight
    },

    // Weather
    weatherContainer: { marginBottom: 30, borderRadius: 30, ...theme.shadows.premium },
    weatherCard3D: {
        borderRadius: 30, padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    weatherInfo: { justifyContent: 'center' },
    weatherTemp: { fontSize: 52, fontWeight: '900', color: '#fff' },
    weatherCity: { fontSize: 18, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
    weatherDesc: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' },
    weatherIcon: { width: 100, height: 100 },

    // KPI Grid
    kpiGrid: { flexDirection: 'row', gap: 15, height: 160, marginBottom: 30 },
    kpiColumn: { flex: 1, gap: 15, justifyContent: 'space-between' },
    kpiContent: { flex: 1, padding: 20, justifyContent: 'space-between' },
    kpiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconBox: { width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    kpiLabel: { color: '#888', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
    kpiValue: { color: '#fff', fontSize: 38, fontWeight: '800' },
    miniKpiValue: { color: '#fff', fontSize: 22, fontWeight: '800' },
    progressBar: { height: 6, backgroundColor: '#222', borderRadius: 3, marginTop: 10, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#7c3aed', borderRadius: 3 },

    // Modules
    moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
    moduleCard: { width: (width - 55) / 2, height: 160 },
    moduleContent: { padding: 20, flex: 1, justifyContent: 'center', alignItems: 'center' },
    moduleIcon: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 1 },
    moduleTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 5 },
    moduleSubtitle: { color: '#666', fontSize: 12 },

    // AI Pill
    aiPill: { marginTop: 30, borderRadius: 20 },
    aiContent: { flexDirection: 'row', padding: 15, alignItems: 'center', gap: 15 },
    aiIconBadge: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    aiText: { flex: 1, color: '#ccc', fontStyle: 'italic', fontSize: 13 },
});
