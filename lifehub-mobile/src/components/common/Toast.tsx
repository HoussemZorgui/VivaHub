import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useToastStore, ToastType } from '../../store/toastStore';

const { width } = Dimensions.get('window');

export const Toast = () => {
    const { visible, message, type, hideToast } = useToastStore();
    const translateY = useSharedValue(-100);

    useEffect(() => {
        if (visible) {
            translateY.value = withSpring(Platform.OS === 'ios' ? 60 : 40, {
                damping: 12,
                stiffness: 90,
            });
        } else {
            translateY.value = withTiming(-100, { duration: 300 });
        }
    }, [visible]);

    if (!visible && translateY.value === -100) return null;

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

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <View style={[styles.glass, { borderColor: getColor() + '30' }]}>
                <View style={[styles.iconContainer, { backgroundColor: getColor() + '15' }]}>
                    <Ionicons name={getIcon()} size={22} color={getColor()} />
                </View>
                <Text style={styles.message} numberOfLines={2}>{message}</Text>
                <View style={[styles.indicator, { backgroundColor: getColor() }]} />
            </View>
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
        maxWidth: 400,
        backgroundColor: 'rgba(25, 25, 25, 0.85)',
        borderRadius: 20,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        ...theme.shadows.premium,
    },
    iconContainer: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    message: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    indicator: {
        width: 4,
        height: 20,
        borderRadius: 2,
        marginLeft: 10,
        opacity: 0.8,
    },
});
