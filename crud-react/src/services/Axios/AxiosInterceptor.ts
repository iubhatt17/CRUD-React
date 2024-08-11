import { useState, useCallback, useMemo, useEffect } from "react";
import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";

const axiosInterceptor = axios.create();

const useAxiosLoader = (): boolean => {
  const [counter, setCounter] = useState(0);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const inc = useCallback(() => setCounter((counter) => counter + 1), []);
  const dec = useCallback(() => setCounter((counter) => counter - 1), []);

  const interceptors = useMemo(() => ({
    request: (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      inc();
      return config;
    },
    response: (response: AxiosResponse): AxiosResponse => {
      dec();
      return response;
    },
    error: async (error: AxiosError): Promise<AxiosError> => {
      dec();
      if (error.response) {
        const { status } = error.response;

        switch (status) {
          case 400:
            // Handle 400 error
            break;
          case 401:
            // Handle 401 error
            setShouldRedirect(true);
            break;
          case 402:
          try {
            const res = await axios.get(
              `${process.env.REACT_APP_API_BASE_URL}/auth/token`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "refresh_token"
                  )}`,
                },
              }
            );

            const newAccessToken = res.data.data.access_token;

            localStorage.setItem("access_token", newAccessToken);
            // Retry original request with new token
            const originalRequest: any = error.config;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (error) {
            console.error("Error refreshing token:", error);
            throw error;
          }
            
          case 403:
            // Handle 403 error
            break;
          case 404:
            // Handle 404 error
            break;
          case 500:
            // Handle 500 error
            break;
          default:
            // Handle other errors
            break;
        }
      } else {
      }
      return Promise.reject(error);
    },
  }), [inc, dec]);

  useEffect(() => {
    const requestInterceptor = axiosInterceptor.interceptors.request.use(interceptors.request, interceptors.error);
    const responseInterceptor = axiosInterceptor.interceptors.response.use(interceptors.response, interceptors.error);

    return () => {
      axiosInterceptor.interceptors.request.eject(requestInterceptor);
      axiosInterceptor.interceptors.response.eject(responseInterceptor);
    };
  }, [interceptors]);

  useEffect(() => {
    if (shouldRedirect) {
      setCounter(0);
      setShouldRedirect(false);
    }
  }, [shouldRedirect]);

  return counter > 0;
};

export { axiosInterceptor, useAxiosLoader };

