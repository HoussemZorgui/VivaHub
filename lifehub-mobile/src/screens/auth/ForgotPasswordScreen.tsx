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
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { theme } from '../../theme';
import { useToastStore } from '../../store/toastStore';
import { authService } from '../../services/auth.service';

export const ForgotPasswordScreen = () => {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const showToast = useToastStore(state => state.showToast);

    const handleResetRequest = async () => {
        if (!email || !email.includes('@')) {
            showToast('Veuillez entrer un email valide.', 'warning');
            return;
        }

        try {
            setLoading(true);
            const response = await authService.forgotPassword(email);
            if (response.success) {
                showToast('Code de réinitialisation envoyé !', 'success');
                navigation.navigate('ResetPassword', { email });
            }
        } catch (error: any) {
            showToast(error.message || 'Impossible d\'envoyer le code.', 'error');
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
                            <Ionicons name="key-outline" size={40} color={theme.colors.primary[400]} />
                        </View>
                        <Text style={styles.title}>Mot de passe oublié</Text>
                        <Text style={styles.subtitle}>
                            Entrez votre adresse email pour recevoir un code de réinitialisation de 6 chiffres.
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400)} style={styles.glassCard}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Adresse Email</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="exemple@vifahub.com"
                                    placeholderTextColor={theme.colors.text.muted}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleResetRequest}
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
                                    <Text style={styles.buttonText}>Envoyer le code</Text>
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
        paddingHorizontal: 10,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 30,
        padding: 25,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        ...theme.shadows.glass,
    },
    inputGroup: { marginBottom: 25 },
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

export default ForgotPasswordScreen;
