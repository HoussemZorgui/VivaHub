import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useToastStore } from '../../store/toastStore';

const { width } = Dimensions.get('window');

export const Toast = () => {
    const { visible, message, type } = useToastStore();
    const translateY = useSharedValue(-100);

    useEffect(() => {
        if (visible) {
            translateY.value = withSpring(Platform.OS === 'ios' ? 60 : 40, {
                damping: 15,
                stiffness: 100,
            });
        } else {
            translateY.value = withTiming(-150, { duration: 400 });
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: translateY.value <= -100 ? 0 : 1,
    }));

    const getIcon = (): any => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'alert-circle';
            case 'warning': return 'warning';
            default: return 'information-circle';
        }
    };

    const getColor = () => {
        switch (type) {
            case 'success': return theme.colors.accent.emerald;
            case 'error': return theme.colors.accent.rose;
            case 'warning': return theme.colors.accent.amber;
            default: return theme.colors.primary[400];
        }
    };

    if (!visible && translateY.value <= -100) return null;

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <BlurView intensity={80} tint="dark" style={[styles.glass, { borderColor: getColor() + '40' }]}>
                <View style={[styles.iconContainer, { backgroundColor: getColor() + '20' }]}>
                    <Ionicons name={getIcon()} size={22} color={getColor()} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.typeText}>{type.toUpperCase()}</Text>
                    <Text style={styles.message} numberOfLines={2}>{message}</Text>
                </View>
                <View style={[styles.indicator, { backgroundColor: getColor() }]} />
            </BlurView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
        paddingHorizontal: 20,
    },
    glass: {
        width: '100%',
        maxWidth: 420,
        borderRadius: 24,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        overflow: 'hidden',
        ...theme.shadows.premium,
    },
    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    typeText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: 2,
    },
    message: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 18,
    },
    indicator: {
        width: 3,
        height: 24,
        borderRadius: 2,
        marginLeft: 12,
    },
});
