import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { theme } from '../../theme';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';

const { width, height } = Dimensions.get('window');

export const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const showToast = useToastStore(state => state.showToast);

    const handleLogin = async () => {
        if (!email || !password) {
            showToast('Veuillez remplir tous les champs.', 'warning');
            return;
        }
        try {
            setLoading(true);
            const response = await authService.login({ email, password });
            if (response.success) {
                showToast('Bienvenue sur VivaHub !', 'success');
                await login(response.data.user, response.data.token, response.data.refreshToken);
            }
        } catch (error: any) {
            showToast(error.message || 'Identifiants incorrects.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Dark Premium Background */}
            <View style={styles.background}>
                <LinearGradient
                    colors={['#050505', '#1a1a2e', '#050505']}
                    style={StyleSheet.absoluteFill}
                />
                {/* Decorative 3D Spheres (Abstract) */}
                <View style={[styles.sphere, { top: -50, right: -50, backgroundColor: theme.colors.primary[600] }]} />
                <View style={[styles.sphere, { bottom: 100, left: -100, width: 300, height: 300, backgroundColor: theme.colors.accent.cyan, opacity: 0.15 }]} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={StyleSheet.absoluteFill}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <Animated.View entering={FadeInUp.delay(200).duration(1000)} style={styles.header}>
                        <Image
                            source={require('../../../assets/images/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.tagline}>L'expérience ultime de gestion de vie</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400).duration(1000)} style={styles.glassCard}>
                        <Text style={styles.title}>Connexion</Text>
                        <Text style={styles.subtitle}>Simplifiez votre quotidien avec VivaHub</Text>

                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor={theme.colors.text.muted}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Mot de passe"
                                placeholderTextColor={theme.colors.text.muted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.forgotBtn}
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.loginBtn}
                            onPress={handleLogin}
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
                                    <Text style={styles.loginBtnText}>Se connecter</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Nouveau sur VivaHub ? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.footerLink}>Créer un compte</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    background: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
    sphere: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        opacity: 0.2,
        filter: 'blur(60px)', // For platforms that support it, otherwise it's just a soft circle
    },
    scrollContent: {
        paddingHorizontal: 25,
        paddingBottom: 40,
        paddingTop: 80,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoImage: {
        width: 450,
        height: 250,
        marginBottom: 20,
    },
    tagline: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 35,
        padding: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        ...theme.shadows.glass,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: theme.colors.text.secondary,
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 18,
        paddingHorizontal: 15,
        height: 60,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    inputIcon: { marginRight: 12 },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
    forgotBtn: { alignSelf: 'flex-end', marginBottom: 25 },
    forgotText: { color: theme.colors.primary[400], fontSize: 13, fontWeight: '600' },
    loginBtn: {
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
    loginBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    footerText: { color: theme.colors.text.muted, fontSize: 14 },
    footerLink: { color: theme.colors.primary[400], fontSize: 14, fontWeight: '700' },
});

export default LoginScreen;
