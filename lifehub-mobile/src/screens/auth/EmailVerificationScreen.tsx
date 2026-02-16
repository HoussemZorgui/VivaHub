import React, { useState, useRef } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { theme } from '../../theme';
import { useToastStore } from '../../store/toastStore';

export const EmailVerificationScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const email = route.params?.email || 'votre@email.com';
    const showToast = useToastStore(state => state.showToast);

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputs = useRef<Array<TextInput | null>>([]);

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value.length !== 0 && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Move to previous input on backspace if current is empty
        if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        const code = otp.join('');
        if (code.length < 6) {
            showToast('Veuillez entrer le code complet.', 'warning');
            return;
        }

        // Static simulation
        showToast('Email vérifié avec succès !', 'success');

        const nextScreen = route.params?.type === 'reset' ? 'ResetPassword' : 'Login';
        setTimeout(() => navigation.navigate(nextScreen), 1500);
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

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="mail-open-outline" size={40} color={theme.colors.primary[400]} />
                        </View>
                        <Text style={styles.title}>Vérification</Text>
                        <Text style={styles.subtitle}>
                            Nous avons envoyé un code de vérification à{'\n'}
                            <Text style={styles.emailText}>{email}</Text>
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400)} style={styles.glassCard}>
                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => (inputs.current[index] = ref)}
                                    style={[
                                        styles.otpInput,
                                        digit !== '' && styles.otpInputActive
                                    ]}
                                    maxLength={1}
                                    keyboardType="number-pad"
                                    value={digit}
                                    onChangeText={(val) => handleOtpChange(val, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    placeholder="0"
                                    placeholderTextColor="rgba(255,255,255,0.1)"
                                />
                            ))}
                        </View>

                        <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
                            <LinearGradient
                                colors={theme.colors.gradients.premium as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.btnGradient}
                            >
                                <Text style={styles.verifyButtonText}>Vérifier le code</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.resendButton}>
                            <Text style={styles.resendText}>
                                Vous n'avez pas reçu le code ? <Text style={styles.resendLink}>Renvoyer</Text>
                            </Text>
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
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 22,
    },
    emailText: { color: '#fff', fontWeight: '700' },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 30,
        padding: 25,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        ...theme.shadows.glass,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    otpInput: {
        width: 45,
        height: 55,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.1)',
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    otpInputActive: {
        borderColor: theme.colors.primary[400],
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
    },
    verifyButton: {
        height: 55,
        borderRadius: 15,
        overflow: 'hidden',
        ...theme.shadows.premium,
    },
    btnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resendButton: {
        marginTop: 25,
        alignItems: 'center',
    },
    resendText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
    },
    resendLink: {
        color: theme.colors.primary[400],
        fontWeight: '700',
    },
});
