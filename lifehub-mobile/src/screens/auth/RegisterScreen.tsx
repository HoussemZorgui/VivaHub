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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '../../theme';
import { authService } from '../../services/auth.service';
import { useToastStore } from '../../store/toastStore';

export const RegisterScreen = () => {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const showToast = useToastStore(state => state.showToast);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
    });

    const handleRegister = async () => {
        const { firstName, lastName, email, username, password, confirmPassword } = formData;

        if (!firstName || !lastName || !email || !username || !password) {
            showToast('Veuillez remplir tous les champs obligatoires.', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            showToast('Les mots de passe ne correspondent pas.', 'error');
            return;
        }

        try {
            setLoading(true);
            const response = await authService.register(formData);
            if (response.success) {
                showToast('Compte créé ! Veuillez vérifier votre email.', 'success');
                setTimeout(() => navigation.navigate('EmailVerification', { email: formData.email }), 1500);
            }
        } catch (error: any) {
            showToast(error.message || "Erreur lors de l'inscription.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (
        label: string,
        field: keyof typeof formData,
        placeholder: string,
        icon: any,
        isPassword = false,
        keyboardType: any = 'default'
    ) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <Ionicons name={icon} size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.text.muted}
                    value={formData[field]}
                    onChangeText={(val) => setFormData({ ...formData, [field]: val })}
                    secureTextEntry={isPassword && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={field === 'email' || field === 'username' ? 'none' : 'words'}
                />
                {isPassword && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={theme.colors.text.secondary}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.background}>
                <LinearGradient
                    colors={['#050505', '#1a1a2e', '#050505']}
                    style={StyleSheet.absoluteFill}
                />
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={StyleSheet.absoluteFill}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Image
                            source={require('../../../assets/images/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.subtitle}>Créez votre univers digital</Text>
                    </View>

                    <Animated.View entering={FadeInDown.delay(200)} style={styles.glassCard}>
                        <Text style={styles.cardTitle}>Inscription</Text>

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                {renderInput('Prénom', 'firstName', 'Jean', 'person-outline')}
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                {renderInput('Nom', 'lastName', 'Dupont', 'person-outline')}
                            </View>
                        </View>

                        {renderInput('Nom d\'utilisateur', 'username', 'jean_dupont', 'at-outline')}
                        {renderInput('Email', 'email', 'jean@example.com', 'mail-outline', false, 'email-address')}
                        {renderInput('Mot de passe', 'password', '••••••••', 'lock-closed-outline', true)}
                        {renderInput('Confirmer', 'confirmPassword', '••••••••', 'lock-closed-outline', true)}

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleRegister}
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
                                    <Text style={styles.buttonText}>S'inscrire</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Déjà un compte ? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.footerLink}>Se connecter</Text>
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
    background: { ...StyleSheet.absoluteFillObject },
    scrollContent: { paddingBottom: 40, paddingHorizontal: 20 },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 0,
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
    logoImage: {
        width: 180,
        height: 60,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginTop: 5,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 30,
        padding: 25,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        ...theme.shadows.glass,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 20,
    },
    row: { flexDirection: 'row' },
    inputGroup: { marginBottom: 15 },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.text.secondary,
        marginBottom: 6,
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
    inputIcon: { marginRight: 10 },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
    },
    button: {
        height: 55,
        borderRadius: 15,
        marginTop: 15,
        overflow: 'hidden',
        ...theme.shadows.premium,
    },
    btnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25,
    },
    footerText: { color: theme.colors.text.muted, fontSize: 13 },
    footerLink: {
        color: theme.colors.primary[400],
        fontWeight: '700',
        fontSize: 13,
    },
});

export default RegisterScreen;
