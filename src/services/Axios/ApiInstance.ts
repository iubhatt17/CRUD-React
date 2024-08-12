import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { axiosInterceptor } from './AxiosInterceptor';

class Api {
  /**
   * Perform a POST request
   * @param {string} path - The request URL path
   * @param {object} body - The request body
   * @param {boolean} requireAuth - Determines if authentication is required
   * @param {object} params - The request parameters
   * @param {boolean} responseType - Determines the response type
   * @param {boolean} fullResponse - Determines if the full response is returned
   * @returns {Promise<any>} The response data or the full response object
   */
  async post(
    path: string,
    body: Record<string, any>,
    requireAuth = false,
    params: Record<string, any> = {},
    responseType = false,
    fullResponse = false
  ): Promise<any> {
    const options: AxiosRequestConfig = {
      params,
      headers: this.generateHeaders(requireAuth),
      responseType: responseType ? 'arraybuffer' : 'json',
    };

    try {
      const res: AxiosResponse = await axiosInterceptor.post(process.env.REACT_APP_API_BASE_URL + path, body, options);
      return fullResponse ? res : res.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Perform a PUT request
   * @param {string} path - The request URL path
   * @param {object} body - The request body
   * @param {boolean} requireAuth - Determines if authentication is required
   * @param {object} params - The request parameters
   * @param {boolean} responseType - Determines the response type
   * @returns {Promise<AxiosResponse>} The response object
   */
  put(
    path: string,
    body: Record<string, any>,
    requireAuth = false,
    params: Record<string, any> = {},
    responseType = false
  ): Promise<AxiosResponse> {
    const options: AxiosRequestConfig = {
      params,
      headers: this.generateHeaders(requireAuth),
      responseType: 'json',
    };

    return axiosInterceptor.put(process.env.REACT_APP_API_BASE_URL + path, body, options);
  }

  /**
   * Perform a PATCH request
   * @param {string} path - The request URL path
   * @param {object} body - The request body
   * @param {boolean} requireAuth - Determines if authentication is required
   * @param {object} params - The request parameters
   * @returns {Promise<AxiosResponse>} The response object
   */
  patch(
    path: string,
    body: Record<string, any>,
    requireAuth = false,
    params: Record<string, any> = {}
  ): Promise<AxiosResponse> {
    const options: AxiosRequestConfig = {
      params,
      headers: this.generateHeaders(requireAuth),
    };

    return axiosInterceptor.patch(process.env.REACT_APP_API_BASE_URL + path, body, options);
  }

  /**
   * Perform a GET request
   * @param {string} path - The request URL path
   * @param {boolean} requireAuth - Determines if authentication is required
   * @param {object} params - The request parameters
   * @param {boolean} withCredentials - Determines if credentials are included
   * @param {boolean} responseType - Determines the response type
   * @returns {Promise<AxiosResponse>} The response object
   */
  get(
    path: string,
    requireAuth = false,
    params: Record<string, any> = {},
    withCredentials = false,
    responseType = false
  ): Promise<AxiosResponse> {
    
    const options: AxiosRequestConfig = {
      params,
      headers: this.generateHeaders(requireAuth),
      responseType: responseType ? 'arraybuffer' : 'json',
      withCredentials,
    };

    return axiosInterceptor.get(process.env.REACT_APP_API_BASE_URL + path, options);
  }

  /**
   * Perform a DELETE request
   * @param {string} path - The request URL path
   * @param {boolean} requireAuth - Determines if authentication is required
   * @param {object} params - The request parameters
   * @param {boolean} withCredentials - Determines if credentials are included
   * @returns {Promise<AxiosResponse>} The response object
   */
  delete(
    path: string,
    requireAuth = false,
    params: Record<string, any> = {},
    withCredentials = false
  ): Promise<AxiosResponse> {
    const options: AxiosRequestConfig = {
      params,
      headers: this.generateHeaders(requireAuth),
      withCredentials,
    };

    return axiosInterceptor.delete(process.env.REACT_APP_API_BASE_URL + path, options);
  }

  /**
   * Generate the request headers with an authorization token if required
   * @param {boolean} authHeaderRequired - Determines if the Authorization header is required
   * @returns {Record<string, string>} The generated headers object
   */
  generateHeaders(authHeaderRequired: boolean): Record<string, string> {
    let headers: Record<string, string> = {};

    if (authHeaderRequired) {
      const unparsedToken = localStorage.getItem("access_token");

      if (unparsedToken) {
        headers["Authorization"] = `Bearer ${unparsedToken}`;
      }
    }

    return headers;
  }
}

export default Api;



