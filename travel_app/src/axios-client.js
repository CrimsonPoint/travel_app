import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

axiosClient.interceptors.request.use((config) => {
  config.headers.Authorization = localStorage.getItem("ACCESS_TOKEN");
  return config;
});

axiosClient.interceptors.response.use((response) => {
  return response;
}, (error) => {
  const {response, status, statusText} = error;

  if (status === 401) {
    localStorage.removeItem("ACCESS_TOKEN");
  } else if (status === 403) {
    /*
    * TODO Создать страницу запрета доступа и редиректнуть отсюда
    * */
  }

  throw error;
})
export default axiosClient;
