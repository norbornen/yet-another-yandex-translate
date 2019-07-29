import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import stringify from './stringify';

export default (baseURL?: string, timeout?: number): AxiosInstance => {
    const config: AxiosRequestConfig = {
        headers: {
            'User-Agent': 'YetAnotherYandexTranslateClient',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept-Encoding': 'gzip, deflate, br'
        }
    };
    if (baseURL) {
        config.baseURL = baseURL;
    }
    if (timeout) {
        config.timeout = timeout;
    }

    const client = axios.create(config);

    client.interceptors.request.use((request: AxiosRequestConfig) => {
        const content_type_header = request.headers['Content-Type'] || request.headers['content-type'];
        if (content_type_header === 'application/x-www-form-urlencoded' && request.data) {
            request.data = stringify(request.data);
        }
        return request;
    });

    return client;
};
