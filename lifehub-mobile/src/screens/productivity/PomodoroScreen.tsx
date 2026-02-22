import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Vibration, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown, useAnimatedStyle, withSpring, withRepeat, withTiming, useSharedValue } from 'react-native-reanimated';
import * as Notifications from 'expo-notifications';
import { theme } from '../../theme';

const { width } = Dimensions.get('window');

const MODES = {
    FOCUS: { name: 'Focus', time: 25 * 60, color: '#ef4444', icon: 'rocket-outline' },
    SHORT_BREAK: { name: 'Pause', time: 5 * 60, color: '#10b981', icon: 'cafe-outline' },
    LONG_BREAK: { name: 'Repos', time: 15 * 60, color: '#3b82f6', icon: 'bed-outline' }
};

export const PomodoroScreen = () => {
    const [mode, setMode] = useState('FOCUS');
    const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.time);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Animation
    const scale = useSharedValue(1);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleTimerComplete();
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const handleTimerComplete = async () => {
        setIsActive(false);
        Vibration.vibrate([0, 500, 200, 500]);

        await Notifications.scheduleNotificationAsync({
            content: {
                title: mode === 'FOCUS' ? "C'est l'heure de la pause ! ☕️" : "Retour au travail ! 🚀",
                body: "Le temps est écoulé. LifeHub veille sur votre productivité.",
                sound: true,
            },
            trigger: null,
        });

        Alert.alert(
            "Temps écoulé !",
            mode === 'FOCUS' ? "Félicitations pour votre session de travail !" : "Prêt à repartir ?",
            [{ text: "OK", onPress: resetTimer }]
        );
    };

    const toggleTimer = () => {
        setIsActive(!isActive);
        scale.value = withSpring(isActive ? 1 : 1.05);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(MODES[mode as keyof typeof MODES].time);
        scale.value = withSpring(1);
    };

    const changeMode = (newMode: string) => {
        setIsActive(false);
        setMode(newMode);
        setTimeLeft(MODES[newMode as keyof typeof MODES].time);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#050505', '#111']} style={StyleSheet.absoluteFill} />

            <View style={styles.header}>
                <Text style={styles.title}>Pomodoro <Text style={{ color: MODES[mode as keyof typeof MODES].color }}>Pro</Text></Text>
                <Text style={styles.subtitle}>Optimisez chaque seconde</Text>
            </View>

            <View style={styles.modeSelector}>
                {Object.entries(MODES).map(([key, value]) => (
                    <TouchableOpacity
                        key={key}
                        style={[styles.modeBtn, mode === key && { backgroundColor: value.color + '20', borderColor: value.color }]}
                        onPress={() => changeMode(key)}
                    >
                        <Ionicons name={value.icon as any} size={20} color={mode === key ? value.color : '#444'} />
                        <Text style={[styles.modeText, mode === key && { color: value.color }]}>{value.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Animated.View entering={FadeInUp.delay(300)} style={[styles.timerContainer, animatedStyle]}>
                <LinearGradient
                    colors={[MODES[mode as keyof typeof MODES].color, '#000']}
                    style={styles.timerGlow}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1.5 }}
                />
                <View style={styles.timerCircle}>
                    <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                    <Text style={styles.timerLabel}>{isActive ? 'Mise au point...' : 'Prêt ?'}</Text>
                </View>
            </Animated.View>

            <View style={styles.controls}>
                <TouchableOpacity style={styles.controlBtn} onPress={resetTimer}>
                    <Ionicons name="refresh" size={30} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.playBtn, { backgroundColor: MODES[mode as keyof typeof MODES].color }]}
                    onPress={toggleTimer}
                    activeOpacity={0.8}
                >
                    <Ionicons name={isActive ? "pause" : "play"} size={40} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtn}>
                    <Ionicons name="settings-outline" size={30} color="#666" />
                </TouchableOpacity>
            </View>

            <Animated.View entering={FadeInDown.delay(500)} style={styles.quoteCard}>
                <Ionicons name="chatbox-ellipses-outline" size={24} color="#333" />
                <Text style={styles.quoteText}>
                    "Votre travail va remplir une grande partie de votre vie, et la seule façon d'être pleinement satisfait est de faire ce que vous croyez être du bon travail."
                </Text>
                <Text style={styles.quoteAuthor}>— Steve Jobs</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', padding: 25, paddingTop: 60 },
    header: { alignItems: 'center', marginBottom: 40 },
    title: { fontSize: 32, fontWeight: '800', color: '#fff' },
    subtitle: { fontSize: 16, color: '#666', marginTop: 5 },

    modeSelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 50,
        backgroundColor: '#0a0a0a',
        padding: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#1a1a1a'
    },
    modeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    modeText: { color: '#444', fontWeight: '700', marginLeft: 8 },

    timerContainer: {
        width: width * 0.75,
        height: width * 0.75,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 60
    },
    timerGlow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: width * 0.4,
        opacity: 0.2,
        transform: [{ scale: 1.2 }]
    },
    timerCircle: {
        width: '100%',
        height: '100%',
        borderRadius: width * 0.4,
        borderWidth: 8,
        borderColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#050505'
    },
    timerText: { fontSize: 64, fontWeight: '900', color: '#fff', letterSpacing: 2 },
    timerLabel: { color: '#666', fontSize: 14, fontWeight: '600', marginTop: 5, textTransform: 'uppercase' },

    controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 40, marginBottom: 50 },
    controlBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1a1a1a' },
    playBtn: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', ...theme.shadows.premium },

    quoteCard: {
        backgroundColor: '#0a0a0a',
        borderRadius: 25,
        padding: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1a1a1a'
    },
    quoteText: { color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: 15, lineHeight: 22, fontSize: 14 },
    quoteAuthor: { color: '#444', fontSize: 12, fontWeight: '700', marginTop: 10, alignSelf: 'flex-end' }
});
