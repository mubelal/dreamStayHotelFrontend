<script>
	import { page } from '$app/stores';
	import { bookings, isLoggedIn, userGroup } from '$lib/store';

	// async function handleGetBookings() {
	// 	let res = await fetch('/api/Booking/bookings', {
	// 		method: 'GET',
	// 		headers: {
	// 			Authorization: `Bearer ${localStorage.getItem('AuthToken')}`
	// 		}
	// 	});
	// 	let data = await res.json();
	// 	$bookings = data.$values;
	// }

	async function handleGetBookings() {
		let res = await fetch('/api/Booking/user-with-bookings', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${localStorage.getItem('AuthToken')}`
			}
		});
		let user = await res.json();

		if (user) {
			const userBookingIds = user.bookingId.$values;
			const userBookings = await Promise.all(
				userBookingIds.map(async (bookingId) => {
					let res = await fetch(`/api/Booking/booking-details/${bookingId}`, {
						method: 'GET',
						headers: {
							Authorization: `Bearer ${localStorage.getItem('AuthToken')}`
						}
					});
					return res.json();
				})
			);

			$bookings = userBookings;
		} else {
			$bookings = [];
		}
	}

	function handleLogout() {
		localStorage.removeItem('AuthToken');
		$isLoggedIn = false;
		$userGroup = '';
		window.location.href = '/';
		showAlert('Sikeres kijelentkezés.', 'success');
		
	}

	function showAlert(message, type) {
		const alertElement = document.getElementById('customAlert');
		alertElement.className = `alert alert-${type}`;
		alertElement.textContent = message;
		alertElement.classList.remove('d-none');

		setTimeout(() => {
			alertElement.classList.add('d-none');
		}, 3000);
	}
	$effect(() => {
		$isLoggedIn = localStorage.getItem('AuthToken') ? true : false;
	});
</script>

<style>
    .navbar-custom {
    background-color: rgb(33, 37, 41);  /* Szürke háttér */
}

.navbar-custom .navbar-brand,
.navbar-custom .nav-link {
    color: white;  /* Fehér szöveg */
}

.navbar-custom .navbar-toggler {
    border: none; /* Eltávolítja az alapértelmezett keretet */
}

.navbar-custom .navbar-toggler-icon {
    background-image: none; /* Eltávolítja az alapértelmezett háttérképet */
    position: relative;
    width: 30px; /* Méretezés */
    height: 24px; /* Méretezés */
}

.navbar-custom .navbar-toggler-icon::before,
.navbar-custom .navbar-toggler-icon::after {
    content: "";
    display: block;
    width: 30px;
    height: 3px;
    background-color: white;  /* Fehér csíkok */
    position: absolute;
    left: 0;
    transition: all 0.3s;
}

.navbar-custom .navbar-toggler-icon::before {
    top: 0; /* Az első csík a tetejére kerül */
}

.navbar-custom .navbar-toggler-icon::after {
    bottom: 0; /* Az utolsó csík az aljára */
}


.navbar-custom .nav-link:hover {
    color: #ddd;  /* Fehérnél világosabb szín, amikor rávisszük az egeret */
}
</style>

<nav class="navbar navbar-expand-lg navbar-light navbar-custom fixed-top">
	<div class="container">
		<a class="navbar-brand" href="/">DreamStay</a>
		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarNav"
			aria-controls="navbarNav"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class="collapse navbar-collapse" id="navbarNav">
			<ul class="navbar-nav me-auto">
				<li class="nav-item">
					<a class="nav-link active" href="/">Főoldal</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" href="/#rooms">Szobáink</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" href="/#about">Rólunk</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" href="/#contact">Elérhetőségeink</a>
				</li>
				{#if $userGroup === 'Admin'}
					<li class="nav-item">
						<a class="nav-link" href="/admin">Admin felület</a>
					</li>
				{/if}
			</ul>
			<ul class="navbar-nav">
				{#if $isLoggedIn === false}
					<li class="nav-item" id="loginRegisterNav">
						<a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">
							Bejelentkezés / Regisztráció
						</a>
					</li>
				{:else}
					<li class="nav-item" id="logoutNav">
						<a class="nav-link" href="#" id="logoutBtn" onclick={handleLogout}>Kijelentkezés</a>
					</li>

					{#if $page.url.pathname !== '/admin'}
						<li class="nav-item" id="profileNav">
							<button
								onclick={handleGetBookings}
								class="nav-link"
								data-bs-toggle="modal"
								data-bs-target="#profileModal"
							>
								<i class="bi bi-person-circle"></i>
							</button>
						</li>
					{/if}
				{/if}
			</ul>
		</div>
	</div>
</nav>
