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
    ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { theme } from '../../theme';
import { useToastStore } from '../../store/toastStore';
import { authService } from '../../services/auth.service';

export const ResetPasswordScreen = ({ navigation }: any) => {
    const route = useRoute<any>();
    const email = route.params?.email || '';

    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const showToast = useToastStore(state => state.showToast);

    const handleReset = async () => {
        if (!otp || otp.length !== 6) {
            showToast('Veuillez entrer le code de 6 chiffres.', 'warning');
            return;
        }
        if (!password || password.length < 8) {
            showToast('Le mot de passe doit faire au moins 8 caractères.', 'warning');
            return;
        }
        if (password !== confirmPassword) {
            showToast('Les mots de passe ne correspondent pas.', 'error');
            return;
        }

        try {
            setLoading(true);
            const response = await authService.resetPassword(email, otp, password);
            if (response.success) {
                showToast('Mot de passe réinitialisé avec succès !', 'success');
                navigation.navigate('Login');
            }
        } catch (error: any) {
            showToast(error.message || 'Échec de la réinitialisation.', 'error');
        } finally {
            setLoading(false);
        }
    };

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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="shield-checkmark-outline" size={40} color={theme.colors.primary[400]} />
                        </View>
                        <Text style={styles.title}>Nouveau mot de passe</Text>
                        <Text style={styles.subtitle}>
                            Entrez le code reçu par email et votre nouveau mot de passe.
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400)} style={styles.glassCard}>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Code de réinitialisation</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="key-outline" size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="123456"
                                    placeholderTextColor={theme.colors.text.muted}
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nouveau mot de passe</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor={theme.colors.text.muted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.colors.text.secondary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirmer le mot de passe</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor={theme.colors.text.muted}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showPassword}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleReset}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={theme.colors.gradients.premium as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.btnGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Réinitialiser le mot de passe</Text>
                                )}
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
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 45,
        height: 45,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        zIndex: 10,
    },
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
        height: 60,
        borderRadius: 18,
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

export default ResetPasswordScreen;
