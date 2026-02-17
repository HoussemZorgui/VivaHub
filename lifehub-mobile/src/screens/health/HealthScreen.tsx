import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TextInput, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { BarChart, ContributionGraph } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { healthService } from '../../services/health.service';

const { width } = Dimensions.get('window');

export const HealthScreen = () => {
    const chartConfig = {
        backgroundGradientFrom: '#121212',
        backgroundGradientTo: '#121212',
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.6,
        useShadowColorFromDataset: false,
    };

    const stepData = {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [
            {
                data: [6500, 8200, 4800, 10500, 9200, 12000, 8000],
            }
        ]
    };

    const activityData = [
        { date: "2026-01-02", count: 1 },
        { date: "2026-01-03", count: 2 },
        { date: "2026-01-04", count: 3 },
        { date: "2026-01-05", count: 4 },
        { date: "2026-01-06", count: 5 },
        { date: "2026-01-30", count: 2 },
        { date: "2026-01-31", count: 3 },
        { date: "2026-03-01", count: 2 },
        { date: "2026-04-02", count: 4 },
        { date: "2026-05-05", count: 2 },
        { date: "2026-02-16", count: 5 },
    ];

    const [searchQuery, setSearchQuery] = React.useState('');
    const [foodData, setFoodData] = React.useState<any>(null);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        // Use the newly created healthService
        const result = await healthService.getNutrients(searchQuery);
        if (result.success && result.data?.foods?.[0]) {
            setFoodData(result.data.foods[0]);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={['#10b981', '#050505']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.header}
            >
                <Animated.View entering={FadeInUp.delay(200)} style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Santé & Performance</Text>

                    {/* Nutritional Search Area */}
                    <View style={styles.searchContainer}>
                        <TextInput
                            placeholder="Rechercher un aliment (ex: pomme)..."
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                        />
                        <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
                            <Ionicons name="search" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {foodData ? (
                        <View style={styles.foodCard}>
                            <Image source={{ uri: foodData.photo.thumb }} style={styles.foodImage} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.foodName}>{foodData.food_name}</Text>
                                <View style={styles.macroRow}>
                                    <Text style={styles.macroText}>{Math.round(foodData.nf_calories)} kcal</Text>
                                    <Text style={styles.macroText}>P: {Math.round(foodData.nf_protein)}g</Text>
                                    <Text style={styles.macroText}>C: {Math.round(foodData.nf_total_carbohydrate)}g</Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.mainScore}>
                            <Text style={styles.scoreText}>8,420</Text>
                            <Text style={styles.scoreLabel}>PAS AUJOURD'HUI</Text>
                        </View>
                    )}

                    <View style={styles.quickStats}>
                        <View style={styles.statBox}>
                            <Ionicons name="flame" size={20} color="#f59e0b" />
                            <Text style={styles.statVal}>{foodData ? Math.round(foodData.nf_calories) : 452}</Text>
                            <Text style={styles.statLab}>kcal</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBox}>
                            <Ionicons name="timer" size={20} color="#10b981" />
                            <Text style={styles.statVal}>45</Text>
                            <Text style={styles.statLab}>min</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBox}>
                            <Ionicons name="map" size={20} color="#3b82f6" />
                            <Text style={styles.statVal}>5.2</Text>
                            <Text style={styles.statLab}>km</Text>
                        </View>
                    </View>
                </Animated.View>
            </LinearGradient>

            <View style={styles.content}>
                <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Activité Hebdomadaire</Text>
                    <View style={styles.chartCard}>
                        <BarChart
                            data={stepData}
                            width={width - 50}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={chartConfig}
                            verticalLabelRotation={0}
                            style={styles.chart}
                        />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Consistance (Derniers 90 jours)</Text>
                    <View style={styles.chartCard}>
                        <ContributionGraph
                            values={activityData}
                            endDate={new Date("2026-02-16")}
                            numDays={90}
                            width={width - 50}
                            height={220}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                            }}
                            tooltipDataAttrs={() => ({})}
                        />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(800)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Analyse du Sommeil</Text>
                    <View style={styles.sleepCard}>
                        <View style={styles.sleepInfo}>
                            <View>
                                <Text style={styles.sleepTime}>7h 45min</Text>
                                <Text style={styles.sleepQuality}>Qualité Excellente</Text>
                            </View>
                            <Ionicons name="moon" size={32} color="#818cf8" />
                        </View>
                        <View style={styles.sleepBar}>
                            <View style={[styles.sleepProgress, { width: '85%', backgroundColor: '#818cf8' }]} />
                        </View>
                        <View style={styles.sleepStats}>
                            <Text style={styles.sleepStatText}>Profond: 2h 15m</Text>
                            <Text style={styles.sleepStatText}>Léger: 5h 30m</Text>
                        </View>
                    </View>
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
        paddingBottom: 40,
        paddingHorizontal: 25,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    headerContent: { alignItems: 'center' },
    headerTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 20,
    },
    mainScore: {
        alignItems: 'center',
        marginBottom: 30,
    },
    scoreText: {
        fontSize: 64,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -2,
    },
    scoreLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.6)',
        marginTop: -5,
    },
    quickStats: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        width: '100%',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statVal: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        marginTop: 5,
    },
    statLab: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    content: { padding: 25 },
    section: { marginBottom: 30 },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 15,
    },
    chartCard: {
        backgroundColor: '#121212',
        borderRadius: 30,
        padding: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        ...theme.shadows.glass,
        alignItems: 'center',
        overflow: 'hidden'
    },
    chart: {
        borderRadius: 16,
        marginVertical: 8,
    },
    sleepCard: {
        backgroundColor: '#121212',
        borderRadius: 30,
        padding: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        ...theme.shadows.glass,
    },
    sleepInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sleepTime: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
    },
    sleepQuality: {
        color: '#818cf8',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
    },
    sleepBar: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 4,
        marginBottom: 15,
    },
    sleepProgress: {
        height: '100%',
        borderRadius: 4,
    },
    sleepStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sleepStatText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: '500',
    },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 5, marginBottom: 20, width: '100%' },
    searchInput: { flex: 1, color: '#fff', fontSize: 14, height: 45 },
    searchBtn: { padding: 10 },
    foodCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 30, width: '100%' },
    foodImage: { width: 60, height: 60, borderRadius: 15, marginRight: 15 },
    foodName: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 5, textTransform: 'capitalize' },
    macroRow: { flexDirection: 'row', gap: 10 },
    macroText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' }
});
