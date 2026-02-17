import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

class NotificationService {
    async registerForPushNotificationsAsync() {
        let token;
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return token;
    }

    async scheduleTaskReminder(taskId: string, title: string, date: Date) {
        // Schedule a notification for the task
        const trigger = date.getTime() - Date.now();

        // If date is in the past, or very soon, don't schedule
        if (trigger <= 0) return null;

        const identifier = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Rappel de tâche 🎯",
                body: `Il est temps de : ${title}`,
                data: { taskId },
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: date,
            },
        });

        return identifier;
    }

    async cancelNotification(identifier: string) {
        await Notifications.cancelScheduledNotificationAsync(identifier);
    }
}

export const notificationService = new NotificationService();
