export const config = {
    // API endpoints
    api: {
        baseURL: __DEV__
            ? 'http://localhost:5001/api'
            : 'https://api.lifehub.app/api',
        graphqlURL: __DEV__
            ? 'http://localhost:5001/graphql'
            : 'https://api.lifehub.app/graphql',
        wsURL: __DEV__
            ? 'ws://localhost:5001'
            : 'wss://api.lifehub.app',
        timeout: 30000,
    },

    // Storage keys
    storage: {
        token: '@lifehub:token',
        refreshToken: '@lifehub:refreshToken',
        user: '@lifehub:user',
        theme: '@lifehub:theme',
        language: '@lifehub:language',
        onboardingCompleted: '@lifehub:onboardingCompleted',
    },

    // Pagination
    pagination: {
        defaultLimit: 20,
        maxLimit: 100,
    },

    // Upload limits
    upload: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxImageSize: 5 * 1024 * 1024, // 5MB
        maxVideoSize: 50 * 1024 * 1024, // 50MB
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        allowedVideoTypes: ['video/mp4', 'video/quicktime'],
    },

    // Maps
    maps: {
        defaultRegion: {
            latitude: 48.8566,
            longitude: 2.3522,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        },
        defaultZoom: 15,
    },

    // Notifications
    notifications: {
        channelId: 'lifehub-notifications',
        channelName: 'LifeHub Notifications',
    },

    // Deep linking
    deepLinking: {
        scheme: 'lifehub',
        prefixes: ['lifehub://', 'https://lifehub.app'],
    },

    // Feature flags
    features: {
        enableAI: true,
        enableGamification: true,
        enableSocial: true,
        enableOfflineMode: true,
        enableAnalytics: true,
    },

    // Social OAuth
    oauth: {
        google: {
            webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID',
            iosClientId: 'YOUR_GOOGLE_IOS_CLIENT_ID',
            androidClientId: 'YOUR_GOOGLE_ANDROID_CLIENT_ID',
        },
        facebook: {
            appId: 'YOUR_FACEBOOK_APP_ID',
        },
        apple: {
            serviceId: 'com.lifehub.app',
        },
    },

    // External APIs
    externalAPIs: {
        openAI: {
            enabled: true,
            model: 'gpt-3.5-turbo',
        },
        mapbox: {
            accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN',
        },
    },
};

export default config;
