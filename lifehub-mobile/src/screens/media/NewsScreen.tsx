import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Linking, ActivityIndicator, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { theme } from '../../theme';
import newsService, { NewsItem } from '../../services/news.service';

export const NewsScreen = () => {
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('tech');
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            loadNews();
        }
    }, [selectedCategory]);

    const loadCategories = async () => {
        try {
            const data = await newsService.getCategories();
            setCategories(data);
            if (data.length > 0 && !selectedCategory) {
                setSelectedCategory(data[0]);
            }
        } catch (error) {
            console.error('Failed to load categories', error);
        }
    };

    const loadNews = async () => {
        setLoading(true);
        try {
            const data = await newsService.getNews(selectedCategory);
            setNews(data);
        } catch (error) {
            console.error('Failed to load news', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadNews();
    };

    const handleShare = async (item: NewsItem) => {
        try {
            await Share.share({
                message: `${item.title} - Lu sur VivaHub\n${item.link}`,
            });
        } catch (error) {
            console.error('Error sharing', error);
        }
    };

    const renderNewsItem = ({ item, index }: { item: NewsItem, index: number }) => (
        <Animated.View entering={FadeInUp.delay(index * 100)}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => Linking.openURL(item.link)}
                style={styles.newsCard}
            >
                {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.newsImage} />
                ) : (
                    <View style={[styles.newsImage, styles.placeholderImage]}>
                        <Ionicons name="newspaper-outline" size={40} color="#333" />
                    </View>
                )}

                <View style={styles.newsContent}>
                    <View style={styles.newsMeta}>
                        <Text style={styles.newsSource}>{item.source}</Text>
                        <Text style={styles.newsDate}>
                            {new Date(item.pubDate).toLocaleDateString('fr-FR')}
                        </Text>
                    </View>

                    <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.newsSnippet} numberOfLines={2}>{item.contentSnippet}</Text>

                    <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item)}>
                            <Ionicons name="share-outline" size={20} color={theme.colors.primary[400]} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#000', '#0a0a1a']} style={StyleSheet.absoluteFill} />

            <View style={styles.header}>
                <Text style={styles.title}>Flux <Text style={{ color: theme.colors.primary[400] }}>Média</Text></Text>
                <Text style={styles.subtitle}>Actualités en temps réel</Text>
            </View>

            <View style={styles.categoryContainer}>
                <FlatList
                    data={categories}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    contentContainerStyle={styles.categoryList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setSelectedCategory(item)}
                            style={[
                                styles.categoryChip,
                                selectedCategory === item && styles.categoryChipActive
                            ]}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === item && styles.categoryTextActive
                            ]}>
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {loading && !refreshing ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color={theme.colors.primary[400]} />
                    <Text style={styles.loadingText}>Synchronisation des flux...</Text>
                </View>
            ) : (
                <FlatList
                    data={news}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderNewsItem}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={
                        <View style={styles.centerBox}>
                            <Ionicons name="alert-circle-outline" size={60} color="#333" />
                            <Text style={styles.emptyText}>Aucun article trouvé.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { paddingTop: 60, paddingHorizontal: 20, marginBottom: 20 },
    title: { color: '#fff', fontSize: 32, fontWeight: '800' },
    subtitle: { color: '#888', fontSize: 16, marginTop: 5 },
    categoryContainer: { marginBottom: 15 },
    categoryList: { paddingHorizontal: 20, gap: 10 },
    categoryChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#222',
    },
    categoryChipActive: {
        backgroundColor: theme.colors.primary[400] + '20',
        borderColor: theme.colors.primary[400],
    },
    categoryText: { color: '#888', fontWeight: '600', fontSize: 14 },
    categoryTextActive: { color: theme.colors.primary[400] },
    listContent: { padding: 20, paddingBottom: 100 },
    newsCard: {
        backgroundColor: '#111',
        borderRadius: 24,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#222',
        ...theme.shadows.premium,
    },
    newsImage: { width: '100%', height: 180, resizeMode: 'cover' },
    placeholderImage: { backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
    newsContent: { padding: 15 },
    newsMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    newsSource: { color: theme.colors.primary[400], fontSize: 12, fontWeight: '700' },
    newsDate: { color: '#666', fontSize: 12 },
    newsTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
    newsSnippet: { color: '#aaa', fontSize: 13, lineHeight: 18, marginBottom: 12 },
    cardActions: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#222', paddingTop: 10 },
    actionButton: { padding: 5 },
    centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 400 },
    loadingText: { color: '#888', marginTop: 15, fontSize: 14 },
    emptyText: { color: '#888', marginTop: 15, fontSize: 16 },
});
