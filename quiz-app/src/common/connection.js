import axios from "axios";
 
export const axiosConnection = axios.create({
    baseURL: process.env.VUE_APP_API_URL
})