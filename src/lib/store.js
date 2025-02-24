import { writable } from 'svelte/store';

export const bookings = writable([]);
export const userGroup = writable('');
export const isLoggedIn = writable(false);
