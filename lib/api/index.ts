import axios from "axios";
import {useAuthStore} from "@/store";

const request = axios.create({
	baseURL: 'https://farmalife.mediasolutions.uz',
});

request.interceptors.request.use(
	async config => {
		const accessToken = useAuthStore.getState().accessToken;
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	error => {
		return Promise.reject(error);
	}
);

const refreshToken = async () => {
	try {
		const refreshToken = await useAuthStore.getState().refreshToken;
		const response = await axios.post(
			`https://farmalife.mediasolutions.uz/api/refresh-token`,
			{},
			{
				headers: {
					Authorization: `Bearer ${refreshToken}`,
				},
			}
		);
		const newToken = response?.data?.accessToken;
		const newRefreshToken = response?.data?.refreshToken;
		useAuthStore.getState().setAccessToken(newToken);
		useAuthStore.getState().setRefreshToken(newRefreshToken);

		return newToken;
	} catch (error) {
		console.error("Error refreshing token:", error);
		return null;
	}
};
request.interceptors.response.use(
	response => {
		return response;
	},
	async error => {
		const statusCode = error.response ? error.response.status : null;
		if (statusCode === 401) {
			const originalRequest = error.config;
			const newToken = await refreshToken();
			if (newToken) {
				originalRequest.headers.Authorization = `Bearer ${newToken}`;
				return axios(originalRequest);
			} else {
				useAuthStore.getState().clearAuthData();
			}
			return Promise.reject(error);
		}
		return Promise.reject(error);
	}
);

export {request};
