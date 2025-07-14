import axios from 'axios';
import {HttpsProxyAgent} from 'https-proxy-agent';
import 'dotenv/config';

const proxyUrl = process.env.PROXY_URL;

const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : null;

const axiosInstance = axios.create({
  httpsAgent: agent,
});

export default axiosInstance;
