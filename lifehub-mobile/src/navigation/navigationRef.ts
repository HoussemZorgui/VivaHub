import { createNavigationContainerRef, StackActions } from '@react-navigation/native';

export type RootStackParamList = {
    MainTabs: { screen?: string } | undefined;
    Profile: undefined;
    EditProfile: undefined;
    AI: undefined;
    FoodSearch: undefined;
    News: undefined;
    CurrencyConverter: undefined;
    HealthTracker: undefined;
    Pomodoro: undefined;
    CryptoMarket: undefined;
    Transactions: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** Navigate anywhere in the app from outside a React component */
export function navigate<T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T]
) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name, params as any);
    }
}
