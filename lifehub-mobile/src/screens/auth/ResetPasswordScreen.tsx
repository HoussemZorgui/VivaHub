import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { theme } from '../../theme';
import { useToastStore } from '../../store/toastStore';

export const ResetPasswordScreen = () => {
    const navigation = useNavigation<any>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const showToast = useToastStore(state => state.showToast);

    const handleReset = () => {
        if (!password || password.length < 6) {
            showToast('Le mot de passe doit faire au moins 6 caractères.', 'warning');
            return;
        }
        if (password !== confirmPassword) {
            showToast('Les mots de passe ne correspondent pas.', 'error');
            return;
        }

        // Static simulation
        showToast('Mot de passe réinitialisé !', 'success');
        setTimeout(() => navigation.navigate('Login'), 1500);
    };

    const renderInput = (
        label: string,
        value: string,
        onChange: (t: string) => void,
        placeholder: string
    ) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.text.muted}
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={theme.colors.text.secondary}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#050505', '#1a1a2e', '#050505']}
                style={StyleSheet.absoluteFill}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="shield-checkmark-outline" size={40} color={theme.colors.primary[400]} />
                        </View>
                        <Text style={styles.title}>Nouveau mot de passe</Text>
                        <Text style={styles.subtitle}>
                            Créez un mot de passe fort pour sécuriser votre compte VivaHub.
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400)} style={styles.glassCard}>
                        {renderInput('Nouveau mot de passe', password, setPassword, '••••••••')}
                        {renderInput('Confirmer le mot de passe', confirmPassword, setConfirmPassword, '••••••••')}

                        <TouchableOpacity style={styles.button} onPress={handleReset}>
                            <LinearGradient
                                colors={theme.colors.gradients.premium as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.btnGradient}
                            >
                                <Text style={styles.buttonText}>Réinitialiser</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    content: { flex: 1 },
    scrollContent: { padding: 25, paddingTop: 100 },
    header: { alignItems: 'center', marginBottom: 40 },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.2)',
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 22,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 30,
        padding: 25,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        ...theme.shadows.glass,
    },
    inputGroup: { marginBottom: 20 },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.text.secondary,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 55,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    inputIcon: { marginRight: 12 },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
    },
    button: {
        height: 55,
        borderRadius: 15,
        marginTop: 10,
        overflow: 'hidden',
        ...theme.shadows.premium,
    },
    btnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
