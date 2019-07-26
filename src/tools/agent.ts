import https from 'https';
import zlib from 'zlib';
import stream from 'stream';
import YandexTranslateError from '../error';
import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import stringify from './stringify';
const {parser} = require('stream-json/Parser');

export async function post(url: string, body?: any): Promise<any> {
    console.time('a');
    
    if (body !== null && body !== undefined) {
        body = stringify(body);
    }
    return new Promise((resolve, reject) => {
        const req = https.request(
            url,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(body),
                    'User-Agent': 'YetAnotherYandexTranslateClient',
                    // 'Accept-Encoding': 'br,gzip,deflate'
                },
                timeout: 40000
            } as https.RequestOptions,
            (res) => {
                let output: stream.Transform;
                switch (res.headers['content-encoding']) {
                    case 'br':
                        res.pipe(output = zlib.createBrotliDecompress());
                        break;
                    case 'gzip':
                        res.pipe(output = zlib.createGunzip());
                        break;
                    case 'deflate':
                        res.pipe(output = zlib.createInflate());
                        break;
                    default:
                        res.pipe(output);
                        break;
                }

                const chunks = [];
                output.on('data', (data) => chunks.push(data));
                output.on('end', () => {
                    let data = Buffer.concat(chunks);
                    try {
                        data = JSON.parse(data.toString());
                    } catch (err) {
                        console.log(data.toString(), err, res.headers);
                    }

                    console.log(res.headers);
                    console.log(res.statusCode);
                    console.log(res.statusMessage);

                    // console.log(data);
                    console.timeEnd('a');
                    resolve(data);
                });
            }
        );
        req.on('error', (err) => {
            console.log(err);
            reject(err);
        });
        req.on('timeout', () => {
            req.abort();
            reject(new Error('Request timed out.'));
        });
        if (body) {
            req.write(body);
        }
        req.end();
    });
}

/*
import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from "constants";



const data = JSON.stringify({
  todo: 'Buy the milk'
})

const options = {
  hostname: 'whatever.com',
  port: 443,
  path: '/todos',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', d => {
    process.stdout.write(d)
  })
})

req.on('error', error => {
  console.error(error)
})

req.write(data)
req.end()

---

function httpsPost({body, ...options}) {
    return new Promise((resolve,reject) => {
        const req = https.request({
            method: 'POST',
            ...options,
        }, res => {
            const chunks = [];
            res.on('data', data => chunks.push(data))
            res.on('end', () => {
                let body = Buffer.concat(chunks);
                switch(res.headers['content-type']) {
                    case 'application/json':
                        body = JSON.parse(body);
                        break;
                }
                resolve(body)
            })
        })
        req.on('error',reject);
        if(body) {
            req.write(body);
        }
        req.end();
    })
}

*/

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
