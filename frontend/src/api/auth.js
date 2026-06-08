import api from './index.js';

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};
