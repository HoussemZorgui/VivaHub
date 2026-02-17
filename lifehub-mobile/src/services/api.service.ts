import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config';

export class ApiService {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: config.api.baseURL,
            timeout: config.api.timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor - Add auth token
        this.axiosInstance.interceptors.request.use(
            async (config) => {
                const token = await AsyncStorage.getItem('@lifehub:token');
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - Handle errors
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

                // Handle 401 - Try to refresh token
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken = await AsyncStorage.getItem('@lifehub:refreshToken');

                        if (refreshToken) {
                            const response = await axios.post(
                                `${config.api.baseURL}/auth/refresh-token`,
                                { refreshToken }
                            );

                            const { token, refreshToken: newRefreshToken } = response.data.data;

                            await AsyncStorage.setItem('@lifehub:token', token);
                            await AsyncStorage.setItem('@lifehub:refreshToken', newRefreshToken);

                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                            }

                            return this.axiosInstance(originalRequest);
                        }
                    } catch (refreshError) {
                        // Refresh failed - logout user
                        await AsyncStorage.multiRemove([
                            '@lifehub:token',
                            '@lifehub:refreshToken',
                            '@lifehub:user',
                        ]);
                        // TODO: Navigate to login screen
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    // Generic request method
    public async request<T = any>(config: AxiosRequestConfig): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.axiosInstance.request(config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // GET request
    public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: 'GET', url });
    }

    // POST request
    public async post<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> {
        return this.request<T>({ ...config, method: 'POST', url, data });
    }

    // PUT request
    public async put<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> {
        return this.request<T>({ ...config, method: 'PUT', url, data });
    }

    // PATCH request
    public async patch<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> {
        return this.request<T>({ ...config, method: 'PATCH', url, data });
    }

    // DELETE request
    public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: 'DELETE', url });
    }

    // Upload file
    public async uploadFile<T = any>(
        url: string,
        formData: FormData,
        onUploadProgress?: (progressEvent: any) => void
    ): Promise<T> {
        return this.request<T>({
            method: 'POST',
            url,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress,
        });
    }

    // Error handler
    private handleError(error: any): Error {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<any>;

            if (axiosError.response) {
                // Server responded with error
                // Check for detailed validation errors first
                if (axiosError.response.data?.errors && Array.isArray(axiosError.response.data.errors) && axiosError.response.data.errors.length > 0) {
                    const firstError = axiosError.response.data.errors[0];
                    return new Error(firstError.message || axiosError.response.data.message || axiosError.message);
                }

                const message = axiosError.response.data?.message || axiosError.message;
                return new Error(message);
            }

            if (axiosError.request) {
                // Request made but no response
                return new Error('Network error. Please check your connection.');
            }
        }

        return error instanceof Error ? error : new Error('An unexpected error occurred');
    }
}

export const api = new ApiService();
export default api;
