import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { healthService } from '../../services/health.service';
import { useHealthStore } from '../../store/healthStore';
import { theme } from '../../theme';

const { width } = Dimensions.get('window');

interface FoodData {
    food_name: string;
    photo: { thumb: string };
    nf_calories: number;
    nf_protein: number;
    nf_total_carbohydrate: number;
    nf_total_fat: number;
    serving_weight_grams: number;
}

export const FoodSearchScreen = ({ navigation }: any) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [foodData, setFoodData] = useState<FoodData | null>(null);
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1); // multiplier
    const { addFoodItem } = useHealthStore();

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        const result = await healthService.getNutrients(searchQuery);
        setLoading(false);
        if (result.success && result.data?.foods?.[0]) {
            setFoodData(result.data.foods[0]);
            setQuantity(1); // reset quantity on new search
        }
    };

    const getCalculatedMacros = () => {
        if (!foodData) return null;
        return {
            calories: Math.round(foodData.nf_calories * quantity),
            protein: Math.round(foodData.nf_protein * quantity),
            carbs: Math.round(foodData.nf_total_carbohydrate * quantity),
            fat: Math.round(foodData.nf_total_fat * quantity),
            weight: Math.round(foodData.serving_weight_grams * quantity)
        }
    };

    const handleAddMeal = (mealType: 'breakfast' | 'lunch' | 'dinner') => {
        if (!foodData || !macros) return;

        addFoodItem({
            food_name: foodData.food_name,
            calories: macros.calories,
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat,
            quantity: quantity,
            unit: 'portions',
            imageUrl: foodData.photo.thumb,
            mealType: mealType,
            date: new Date().toISOString().split('T')[0]
        });

        navigation.goBack();
    };

    const macros = getCalculatedMacros();

    return (
        <View style={styles.container}>
            {/* 3D Background */}
            <LinearGradient
                colors={['#050505', '#1a1a2e', '#000000']}
                style={StyleSheet.absoluteFill}
            />
            {/* Ambient Glow */}
            <View style={[styles.glowOrb, { top: -100, right: -100, backgroundColor: theme.colors.accent.emerald }]} />
            <View style={[styles.glowOrb, { bottom: 0, left: -100, backgroundColor: theme.colors.accent.rose }]} />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Calculateur Nutritionnel</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.content}>
                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
                        <TextInput
                            placeholder="Chercher un aliment (ex: Banane, Poulet)..."
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                        {loading && <ActivityIndicator size="small" color={theme.colors.primary[400]} />}
                    </View>

                    {foodData && macros ? (
                        <Animated.View entering={FadeInDown.springify()} style={styles.resultContainer}>
                            {/* Food Image & Name */}
                            <View style={styles.foodHeader}>
                                <Image source={{ uri: foodData.photo.thumb }} style={styles.foodImage} />
                                <View>
                                    <Text style={styles.foodName}>{foodData.food_name}</Text>
                                    <Text style={styles.servingInfo}>Par portion de {foodData.serving_weight_grams}g</Text>
                                </View>
                            </View>

                            {/* Quantity Multiplier */}
                            <View style={styles.multiplierContainer}>
                                <Text style={styles.multiplierLabel}>Quantité (Portions)</Text>
                                <View style={styles.stepper}>
                                    <TouchableOpacity onPress={() => setQuantity(q => Math.max(0.5, q - 0.5))} style={styles.stepBtn}>
                                        <Ionicons name="remove" size={20} color="#fff" />
                                    </TouchableOpacity>
                                    <Text style={styles.quantityText}>{quantity}</Text>
                                    <TouchableOpacity onPress={() => setQuantity(q => q + 0.5)} style={styles.stepBtn}>
                                        <Ionicons name="add" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Macro Cards Grid */}
                            <View style={styles.macroGrid}>
                                <Animated.View entering={ZoomIn.delay(100)} style={styles.macroCardWrapper}>
                                    <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.macroCard}>
                                        <Text style={styles.macroValue}>{macros.calories}</Text>
                                        <Text style={styles.macroLabel}>Calories</Text>
                                    </LinearGradient>
                                </Animated.View>
                                <Animated.View entering={ZoomIn.delay(200)} style={styles.macroCardWrapper}>
                                    <LinearGradient colors={['#10b981', '#059669']} style={styles.macroCard}>
                                        <Text style={styles.macroValue}>{macros.protein}g</Text>
                                        <Text style={styles.macroLabel}>Protéines</Text>
                                    </LinearGradient>
                                </Animated.View>
                                <Animated.View entering={ZoomIn.delay(300)} style={styles.macroCardWrapper}>
                                    <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.macroCard}>
                                        <Text style={styles.macroValue}>{macros.carbs}g</Text>
                                        <Text style={styles.macroLabel}>Glucides</Text>
                                    </LinearGradient>
                                </Animated.View>
                                <Animated.View entering={ZoomIn.delay(400)} style={styles.macroCardWrapper}>
                                    <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.macroCard}>
                                        <Text style={styles.macroValue}>{macros.fat}g</Text>
                                        <Text style={styles.macroLabel}>Lipides</Text>
                                    </LinearGradient>
                                </Animated.View>
                            </View>

                            {/* Add to Meal Actions */}
                            <Text style={styles.sectionTitle}>Ajouter au repas</Text>
                            <View style={styles.mealButtons}>
                                <TouchableOpacity style={styles.mealBtn} onPress={() => handleAddMeal('breakfast')}>
                                    <Text style={styles.mealBtnText}>Petit Déj</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.mealBtn} onPress={() => handleAddMeal('lunch')}>
                                    <Text style={styles.mealBtnText}>Déjeuner</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.mealBtn} onPress={() => handleAddMeal('dinner')}>
                                    <Text style={styles.mealBtnText}>Dîner</Text>
                                </TouchableOpacity>
                            </View>

                        </Animated.View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="nutrition-outline" size={64} color="rgba(255,255,255,0.1)" />
                            <Text style={styles.emptyText}>Recherchez un aliment pour voir ses valeurs nutritionnelles et ajoutez-le à votre journal.</Text>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    glowOrb: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.1,
        filter: 'blur(80px)',
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    content: { padding: 20 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        paddingHorizontal: 15,
        height: 55,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    searchInput: { flex: 1, color: '#fff', marginLeft: 10, fontSize: 16 },
    resultContainer: { marginTop: 10 },
    foodHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    foodImage: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#222', marginRight: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    foodName: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 5, textTransform: 'capitalize' },
    servingInfo: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
    multiplierContainer: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25,
        backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
    },
    multiplierLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600' },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    stepBtn: { width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    quantityText: { color: '#fff', fontSize: 18, fontWeight: '700', minWidth: 20, textAlign: 'center' },
    macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
    macroCardWrapper: { width: (width - 50) / 2 },
    macroCard: { padding: 20, borderRadius: 20, alignItems: 'center', ...theme.shadows.premium },
    macroValue: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 5 },
    macroLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600' },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 15 },
    mealButtons: { flexDirection: 'row', gap: 10 },
    mealBtn: { flex: 1, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    mealBtnText: { color: '#fff', fontWeight: '600' },
    emptyState: { alignItems: 'center', marginTop: 50, paddingHorizontal: 40 },
    emptyText: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 20, lineHeight: 22 }
});
