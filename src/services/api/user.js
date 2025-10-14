import { httpClient, lightClient } from '../httpClient';

export const getUser = (id) => httpClient.get(`/users/${id}`);
export const searchUsers = (query) => lightClient.get(`/users/search?q=${query}`);
