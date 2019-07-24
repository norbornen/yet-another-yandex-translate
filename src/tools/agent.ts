import YandexTranslateError from '../error';
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
        if (request.headers['Content-Type'] === 'application/x-www-form-urlencoded' && request.data) {
            request.data = stringify(request.data);
        }
        return request;
    });

    client.interceptors.response.use(
        undefined,
        (err) => {
            if ('response' in err && err.response && 'data' in err.response) {
                console.error('An error occured while translating: ', err.response.data);
                throw new YandexTranslateError(err.response.data);
            }
            console.error('An error occured while translating: ', err);
            throw err;
        }
    );
    return client;
};
