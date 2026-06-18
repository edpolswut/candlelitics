const BASE_URL = 'http://localhost:3001/api';

/* AUTH*/

export const registerUser = async (data) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) throw result;
  return result;
};

export const loginUser = async (data) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) throw result;
  return result;
};

/*AUTH LOCAL HELPERS*/

export const saveAuthData = (data) => {
  localStorage.setItem('token', data.token);

  const user = {
    username: data.login || data.email?.split('@')[0],
    photoUrl: data.imagem || null,
  };

  localStorage.setItem('user', JSON.stringify(user));
  return user;
};

export const getToken = () => localStorage.getItem('token');

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/*DASHBOARD*/

export const createDashboard = async (data) => {
  const response = await fetch(`${BASE_URL}/dashboard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) throw result;
  return result;
};

export const deleteDashboard = async (id) => {
  const response = await fetch(`${BASE_URL}/dashboard/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const result = await response.json();
  if (!response.ok) throw result;
  return result;
};

/*STOCK / GRAPH*/

export const getStockData = async (symbol, period = '1M') => {
  const response = await fetch(
    `${BASE_URL}/stock?symbol=${symbol}&period=${period}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const result = await response.json();
  if (!response.ok) throw result;
  return result;
};

export const getCompanyMetadata = async (symbol) => {
  const response = await fetch(`${BASE_URL}/company/${symbol}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const result = await response.json();
  if (!response.ok) throw result;
  return result;
};