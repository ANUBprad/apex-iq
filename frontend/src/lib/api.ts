import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const getStrategy = async (payload: any) => {
  const res = await api.post("/strategy", payload);
  return res.data;
};

export const simulate = async (payload: any) => {
  const res = await api.post("/simulate", payload);
  return res.data;
};