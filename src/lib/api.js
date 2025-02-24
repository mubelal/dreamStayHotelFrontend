export const getUserRole = () =>
	fetch('/api/Account/getUserRole', {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${localStorage.getItem('AuthToken')}`
		}
	}).then((response) => response.text());
