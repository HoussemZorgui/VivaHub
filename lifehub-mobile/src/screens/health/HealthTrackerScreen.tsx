import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions, Switch, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { theme } from '../../theme';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const HealthTrackerScreen = () => {
    // Water State
    const [waterCount, setWaterCount] = useState(0);
    const [waterGoal] = useState(8); // 8 glasses
    const [remindersEnabled, setRemindersEnabled] = useState(false);

    // BMI State
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bmi, setBmi] = useState<number | null>(null);
    const [bmiCategory, setBmiCategory] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const savedWater = await AsyncStorage.getItem('@health:water_count');
            const savedReminders = await AsyncStorage.getItem('@health:reminders');
            if (savedWater) setWaterCount(parseInt(savedWater));
            if (savedReminders) setRemindersEnabled(savedReminders === 'true');
        } catch (e) {
            console.error(e);
        }
    };

    const saveWater = async (count: number) => {
        setWaterCount(count);
        await AsyncStorage.setItem('@health:water_count', count.toString());
    };

    const calculateBMI = () => {
        const h = parseFloat(height) / 100;
        const w = parseFloat(weight);
        if (h > 0 && w > 0) {
            const score = w / (h * h);
            setBmi(score);
            if (score < 18.5) setBmiCategory('Insuffisance pondérale');
            else if (score < 25) setBmiCategory('Poids normal');
            else if (score < 30) setBmiCategory('Surpoids');
            else setBmiCategory('Obésité');
        }
    };

    const toggleReminders = async (value: boolean) => {
        if (value) {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission requise', 'Veuillez activer les notifications pour les rappels.');
                return;
            }
            // Schedule a recurring reminder
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Hydratation 💧",
                    body: "C'est le moment de boire un grand verre d'eau !",
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: 60 * 60 * 2, // Every 2 hours
                    repeats: true,
                },
            });
        } else {
            await Notifications.cancelAllScheduledNotificationsAsync();
        }
        setRemindersEnabled(value);
        await AsyncStorage.setItem('@health:reminders', value.toString());
    };

    const renderWaterGlass = (index: number) => {
        const isActive = index < waterCount;
        return (
            <Animated.View
                key={index}
                entering={ZoomIn.delay(index * 50)}
                style={[styles.glassIcon, isActive && styles.glassActive]}
            >
                <Ionicons
                    name={isActive ? "water" : "water-outline"}
                    size={28}
                    color={isActive ? "#3b82f6" : "#333"}
                />
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#050505', '#111']} style={StyleSheet.absoluteFill} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Santé <Text style={{ color: theme.colors.accent.rose }}>Tracker</Text></Text>
                    <Text style={styles.subtitle}>Hydratation & Analyse Bio</Text>
                </View>

                {/* Water Tracker Section */}
                <Animated.View entering={FadeInDown.delay(200)} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.cardTitle}>Objectif Eau</Text>
                            <Text style={styles.cardInfo}>{waterCount} / {waterGoal} verres par jour</Text>
                        </View>
                        <Ionicons name="water" size={40} color="#3b82f6" opacity={0.3} />
                    </View>

                    <View style={styles.glassGrid}>
                        {Array.from({ length: 8 }).map((_, i) => renderWaterGlass(i))}
                    </View>

                    <View style={styles.waterActions}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => saveWater(Math.max(0, waterCount - 1))}
                        >
                            <Ionicons name="remove" size={24} color="#fff" />
                        </TouchableOpacity>

                        <View style={styles.progressCircle}>
                            <Text style={styles.progressText}>{Math.round((waterCount / waterGoal) * 100)}%</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}
                            onPress={() => saveWater(Math.min(12, waterCount + 1))}
                        >
                            <Ionicons name="add" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.reminderRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="notifications-outline" size={20} color="#666" style={{ marginRight: 10 }} />
                            <Text style={styles.reminderText}>Rappels intelligents</Text>
                        </View>
                        <Switch
                            value={remindersEnabled}
                            onValueChange={toggleReminders}
                            trackColor={{ false: '#222', true: '#3b82f6' }}
                            thumbColor="#fff"
                        />
                    </View>
                </Animated.View>

                {/* BMI Calculator Section */}
                <Animated.View entering={FadeInDown.delay(400)} style={[styles.card, { marginTop: 25 }]}>
                    <Text style={styles.cardTitle}>Calculateur d'IMC</Text>

                    <View style={styles.bmiInputs}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Taille (cm)</Text>
                            <TextInput
                                style={styles.textInput}
                                value={height}
                                onChangeText={setHeight}
                                keyboardType="numeric"
                                placeholder="175"
                                placeholderTextColor="#444"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Poids (kg)</Text>
                            <TextInput
                                style={styles.textInput}
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="numeric"
                                placeholder="70"
                                placeholderTextColor="#444"
                            />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.calcBtn} onPress={calculateBMI}>
                        <LinearGradient colors={[theme.colors.accent.rose, '#9f1239']} style={styles.btnGradient}>
                            <Text style={styles.btnText}>Calculer l'Analyse</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {bmi !== null && (
                        <Animated.View entering={ZoomIn} style={styles.resultBox}>
                            <Text style={styles.bmiVal}>{bmi.toFixed(1)}</Text>
                            <Text style={[styles.bmiCat, { color: theme.colors.accent.rose }]}>{bmiCategory}</Text>

                            <View style={styles.scale}>
                                <View style={[styles.scaleMarker, {
                                    left: `${Math.min(100, Math.max(0, (bmi - 15) * 4))}%`
                                }]} />
                                <LinearGradient
                                    colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.scaleBar}
                                />
                                <View style={styles.scaleLabels}>
                                    <Text style={styles.scaleLab}>18.5</Text>
                                    <Text style={styles.scaleLab}>25</Text>
                                    <Text style={styles.scaleLab}>30</Text>
                                </View>
                            </View>
                        </Animated.View>
                    )}
                </Animated.View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollContent: { padding: 25, paddingTop: 60 },
    header: { marginBottom: 30 },
    title: { fontSize: 32, fontWeight: '800', color: '#fff' },
    subtitle: { fontSize: 16, color: '#666', marginTop: 5 },

    card: {
        backgroundColor: '#121212',
        borderRadius: 30,
        padding: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        ...theme.shadows.premium,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    cardTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
    cardInfo: { fontSize: 14, color: '#666', marginTop: 3 },

    glassGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'center', marginBottom: 30 },
    glassIcon: {
        width: 50, height: 50, borderRadius: 15, backgroundColor: '#0a0a0a',
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1a1a1a'
    },
    glassActive: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)' },

    waterActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
    actionBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },
    progressCircle: { alignItems: 'center', justifyContent: 'center' },
    progressText: { color: '#fff', fontSize: 24, fontWeight: '900' },

    reminderRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 20, borderTopWidth: 1, borderTopColor: '#1a1a1a'
    },
    reminderText: { color: '#888', fontSize: 14, fontWeight: '600' },

    bmiInputs: { flexDirection: 'row', gap: 20, marginTop: 20, marginBottom: 25 },
    inputGroup: { flex: 1 },
    inputLabel: { color: '#666', fontSize: 12, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase' },
    textInput: {
        backgroundColor: '#0a0a0a', borderRadius: 15, padding: 15, color: '#fff',
        fontSize: 18, fontWeight: '700', borderWidth: 1, borderColor: '#1a1a1a'
    },
    calcBtn: { borderRadius: 15, overflow: 'hidden' },
    btnGradient: { paddingVertical: 18, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

    resultBox: { marginTop: 30, alignItems: 'center' },
    bmiVal: { fontSize: 56, fontWeight: '900', color: '#fff' },
    bmiCat: { fontSize: 18, fontWeight: '700', marginBottom: 25 },
    scale: { width: '100%', alignItems: 'center' },
    scaleBar: { width: '100%', height: 8, borderRadius: 4 },
    scaleMarker: {
        position: 'absolute', top: -10, width: 4, height: 20,
        backgroundColor: '#fff', borderRadius: 2, zIndex: 10
    },
    scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
    scaleLab: { color: '#444', fontSize: 12, fontWeight: '700' }
});
