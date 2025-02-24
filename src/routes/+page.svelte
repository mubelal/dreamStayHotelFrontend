<script>
	import { goto } from '$app/navigation';
	import img6 from '$lib/images/6.png';
	import img7 from '$lib/images/7.png';
	import img8 from '$lib/images/8.png';
	import { bookings } from '$lib/store';
	import { onMount } from 'svelte';
	import { Swiper } from 'swiper';
	let currentRoom = $state();

	async function openBooking(currentRoomIndex) {
		const response = await fetch(`/api/Room/rooms/${currentRoomIndex}`);
		const data = await response.json();

		currentRoom = data;
	}

	let adults = $state([{ id: 1, name: '', dateOfBirth: '', identityCard: '', bookingId: 0 }]);
	let children = $state([{ id: 1, name: '', dateOfBirth: '', identityCard: '', bookingId: 0 }]);
	function addAdult() {
		const id = adults.length + 1;
		adults = [...adults, { id, name: '', dateOfBirth: '', identityCard: '', bookingId: 0 }];
	}
	function addChild() {
		const id = children.length + 1;
		children = [...children, { id, name: '', dateOfBirth: '', identityCard: '', bookingId: 0 }];
	}
	function removeAdult(id) {
		adults = adults.filter((a) => a.id !== id);
	}
	function removeChild(id) {
		children = children.filter((c) => c.id !== id);
	}

	async function handleBooking() {
		if ((!checkIn.value && !checkOut.value) || adults.length === 0 || children.length === 0) {
			setTimeout(() => {
				showAlert('Foglaláshoz töltse ki az adatokat.', 'warning');
			}, 450);
			return;
		}

		const res = await fetch('/api/Booking/booking', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('AuthToken')}`
			},
			body: JSON.stringify({
				checkInDate: checkIn.value,
				checkOutDate: checkOut.value,
				roomId: currentRoom.id,
				adults,
				children
			})
		});
		if (res.ok) {
			const bookingModal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
			bookingModal.hide();
			checkIn.value = '';
			checkOut.value = '';
			setTimeout(() => {
				showAlert('Foglalása sikeresen megtörtént.', 'success');
			}, 450);
			return;
		}
		setTimeout(() => {
			showAlert('Kérem jelentkezzen be a foglaláshoz.', 'warning');
		}, 450);
	}

	async function handleBookingRemove(e) {
		const bookingIndex = e.target.getAttribute('data-booking-index');
		await fetch(`/api/Booking/booking/${bookingIndex}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${localStorage.getItem('AuthToken')}`
			}
		});
		setTimeout(() => {
			showAlert('Foglalása sikeresen törölve lett.', 'success');
		}, 450);

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
		if ($bookings.length === 0) {
			const profileModal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
			profileModal.hide();
		}
	}

	async function handleFilter() {
		goto('#rooms');
		const res = await fetch('/api/Room/rooms/sort-by', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				maxAdults: maxAdults.value,
				maxChildren: maxChildren.value,
				checkInDate: checkIn.value
			})
		});

		const data = await res.json();
		rooms = data.$values;
	}

	function showAlert(message, type) {
		const alertElement = document.getElementById('customAlert');
		alertElement.className = `alert alert-${type}`;
		alertElement.textContent = message;
		alertElement.classList.remove('d-none');

		setTimeout(() => {
			alertElement.classList.add('d-none');
		}, 2000);
	}

	let rooms = $state([]);
	async function loadRooms() {
		const res = await fetch('/api/Room/rooms');
		const data = await res.json();
		rooms = data.$values;
	}
	onMount(loadRooms);

	const reviews = [
		{
			title: 'Csodálatos Élmény',
			text: 'A szoba makulátlan volt, a személyzet hihetetlenül barátságos, és a szolgáltatások elsőrangúak. Biztosan újra itt fogok megszállni!',
			author: 'Kovács János',
			location: 'Budapest',
			image: 'https://randomuser.me/api/portraits/men/1.jpg'
		},
		{
			title: 'Felülmúlta az Elvárásokat',
			text: 'A bejelentkezéstől a távozásig minden tökéletes volt. A részletekre való odafigyelés lenyűgöző volt.',
			author: 'Nagy Sára',
			location: 'Debrecen',
			image: 'https://randomuser.me/api/portraits/women/2.jpg'
		},
		{
			title: 'Hamarosan Visszatérek',
			text: 'A helyszín ideális volt, a szoba tágas és kényelmes, a személyzet pedig mindent megtett értünk. Alig várom, hogy visszatérjek!',
			author: 'Szabó Máté',
			location: 'Szeged',
			image: 'https://randomuser.me/api/portraits/men/3.jpg'
		},
		{
			title: 'Kiváló Szolgáltatás',
			text: 'A személyzet rendkívül segítőkész volt, és minden kérésünket teljesítették. A szoba tiszta és kényelmes volt.',
			author: 'Tóth Anna',
			location: 'Pécs',
			image: 'https://randomuser.me/api/portraits/women/4.jpg'
		},
		{
			title: 'Felejthetetlen Élmény',
			text: 'A kilátás lélegzetelállító volt, és a spa szolgáltatások tökéletes kikapcsolódást nyújtottak. Mindenképpen ajánlom!',
			author: 'Horváth Eszter',
			location: 'Győr',
			image: 'https://randomuser.me/api/portraits/women/5.jpg'
		}
	];

	async function handleRegister() {
		if (registerPassword.value !== registerConfirmPassword.value) {
			setTimeout(() => {
				showAlert('Két jelszó nem egyezik meg.', 'warning');
			}, 450);
			return;
		}

		const res = await fetch('/api/Account/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userName: registerName.value,
				password: registerPassword.value,
				email: registerEmail.value,
				firstName: registerFirstName.value,
				lastName: registerLastName.value,
				identityCard: registerIdentityCard.value
			})
		});
		const data = await res.text();

		if (res.ok) {
			const registerModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
			registerModal.hide();
			setTimeout(() => {
				showAlert('Sikeres regisztráció.', 'success');
			}, 450);
			return;
		}
		setTimeout(() => {
			showAlert('Sikertelen regisztráció.', 'danger');
		}, 450);
	}

	async function handleLogin() {
		if (!loginUsername.value || !loginPassword.value) {
			showAlert('Kérlek, töltsd ki az összes mezőt.', 'danger');
			return;
		}

		try {
			const res = await fetch('/api/Account/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userName: loginUsername.value,
					password: loginPassword.value
				})
			});

			const data = await res.text();

			if (res.ok) {
				localStorage.setItem('AuthToken', data);

				// A modal bezárása
				const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
				loginModal.hide();

				// Az alert üzenet és a UI frissítése
				showAlert('Sikeres bejelentkezés.', 'success'); // Közvetlenül az alert megjelenítése

				// Itt frissítheted a UI-t, ha szükséges
				// updateUIForLoggedInUser();

				// Az oldal átirányítása a főoldalra (ez el is hagyható, ha dinamikusan frissítesz)
				setTimeout(() => {
					window.location.href = '/'; // Itt az oldal átirányítása már nem szükséges
				}, 550);
			} else {
				// Hibakezelés
				showAlert('Sikertelen bejelentkezés. Ellenőrizd a felhasználónevet és jelszót.', 'danger');
			}
		} catch (error) {
			// Hibakezelés, ha a fetch nem sikerül
			showAlert('Hiba történt a bejelentkezés közben. Próbáld újra.', 'danger');
		}
	}

	onMount(() => {
		new Swiper('.review-swiper', {
			slidesPerView: 1,
			spaceBetween: 30,
			loop: true,
			autoplay: {
				delay: 5000,
				disableOnInteraction: false
			},
			pagination: {
				el: '.swiper-pagination',
				clickable: true
			}
		});
	});
</script>

<div style="padding-top: 56px;">
	<div class="container mt-4">
		<div id="customAlert" class="alert d-none" role="alert"></div>
	</div>

	<header>
		<div
			id="heroCarousel"
			class="carousel slide"
			data-bs-ride="carousel"
			data-bs-interval="2500"
			data-bs-wrap="true"
			data-bs-pause="false"
		>
			<div class="carousel-inner">
				<div class="carousel-item active">
					<img src={img6} class="d-block w-100" alt="Luxus Szálloda" />
					<div class="carousel-caption d-none d-md-block">
						<h1>Üdvözöljük a DreamStayben</h1>
						<p>Tapasztalja meg a luxust, mint még soha</p>
					</div>
				</div>
				<div class="carousel-item">
					<img src={img7} class="d-block w-100" alt="Szállodai Szoba" />
					<div class="carousel-caption d-none d-md-block">
						<h1>Kényelmes Szobák</h1>
						<p>Pihenjen tágas és elegáns szobáinkban</p>
					</div>
				</div>
				<div class="carousel-item">
					<img src={img8} class="d-block w-100" alt="Szállodai Medence" />
					<div class="carousel-caption d-none d-md-block">
						<h1>Lenyűgöző Szolgáltatások</h1>
						<p>Élvezze világszínvonalú létesítményeinket</p>
					</div>
				</div>
			</div>
		</div>
	</header>

	<main class="container my-5">
		<section id="search" class="mb-5">
			<h2 class="mb-4">Találja meg a tökéletes szobát önnek.</h2>
			<form id="searchForm" onsubmit={handleFilter}>
				<div class="row g-3">
					<div class="col-md-2">
						<label for="adults" class="form-label">Felnőttek</label>
						<select class="form-select" id="maxAdults" required>
							<option value="">Válasszon egy értéket</option>
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="3">3</option>
							<option value="4">4</option>
							<option value="5">5</option>
						</select>
					</div>
					<div class="col-md-2">
						<label for="children" class="form-label">Gyerekek</label>
						<select class="form-select" id="maxChildren" required>
							<option value="">Válasszon egy értéket</option>
							<option value="0">0</option>
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="3">3</option>
							<option value="4">4</option>
							<option value="5">5</option>
						</select>
					</div>
					<div class="col-md-2 d-flex align-items-end">
						<button type="submit" class="btn btn-dark w-100">Szobák szűrése</button>
					</div>
					<div class="col-md-2 d-flex align-items-end">
						<button
							type="button"
							onclick={async () => {
								maxAdults.value = '';
								maxChildren.value = '';
								await loadRooms();
							}}
							class="btn btn-dark w-100">Szűrés törlése</button
						>
					</div>
				</div>
			</form>
		</section>

		<section id="rooms" class="mb-5">
			<h2 class="mb-4">Szobáink</h2>
			<div class="row" id="roomList">
				{#each rooms as room}
					<div class="col-md-6 col-lg-4 mb-4">
						<div class="card room-card">
							<img src={room.img_Src} class="card-img-top room-image" alt="${room.name}" />
							<div class="card-body">
								<h5 class="card-title">{room.name}</h5>
								<p class="card-text">{room.description}</p>
								<p class="card-text"><strong>Ár:</strong> {room.pricePerNight} HUF / éjszaka</p>
								<p class="card-text">
									<strong>Max. létszám:</strong>
									{room.maxAdults + room.maxChildren}
								</p>
								<button
									class="btn btn-dark book-btn"
									data-bs-toggle="modal"
									data-bs-target="#bookingModal"
									onclick={() => openBooking(room.id)}>Foglalás</button
								>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<section id="about" class="mb-5">
			<h2 class="mb-4">A DreamStayről</h2>
			<p>
				A DreamStay egy kiváló szobafoglalási platform, amely széles választékban kínál luxus
				szálláshelyeket minden utazó igényeinek megfelelően. Felhasználóbarát felületünkkel és
				kiterjedt, kiváló minőségű szobakínálatunkkal arra törekszünk, hogy a foglalási élménye a
				lehető legzökkenőmentesebb és legélvezetesebb legyen.
			</p>
			<p>
				Kiválóságra való elkötelezettségünk túlmutat a kényelmes szobák biztosításán.
				Világszínvonalú szolgáltatásokat, kivételes ügyfélszolgálatot és a legjobb elérhető árak
				garanciáját kínáljuk. Akár üzleti úton van, akár pihenni szeretne, a DreamStay a tökéletes
				partner egy felejthetetlen tartózkodáshoz.
			</p>
		</section>

		<section id="reviews" class="mb-5">
			<h2 class="mb-4 text-center">Vendégvélemények</h2>
			<div class="swiper review-swiper">
				<div class="swiper-wrapper">
					{#each reviews as review}
						<div class="swiper-slide">
							<div class="review-card">
								<h5>{review.title}</h5>
								<p>{review.text}</p>
								<div class="review-author">
									<img src={review.image} alt={review.author} />
									<div class="review-author-info">
										<span class="review-author-name">{review.author}</span>
										<span class="review-author-location">{review.location}</span>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
				<div class="swiper-pagination"></div>
			</div>
		</section>

		<section id="contact" class="mb-5">
			<h2 class="mb-4">Elérhetőségeink</h2>
			<div class="row">
				<div class="col-md-6">
					<iframe
						src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2757.9329130167544!2d20.16743809108897!3d46.27143750470715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47448812b0fdbf5d%3A0xd4d73a57e4068eea!2sPannonhalmi%20F%C5%91ap%C3%A1ts%C3%A1g%20Szegedi%20SOB%20Technikuma!5e0!3m2!1shu!2shu!4v1740155832002!5m2!1shu!2shu"
						width="100%"
						height="300"
						style="border:0;"
						allowfullscreen=""
						loading="lazy"
					></iframe>
				</div>
				<div class="col-md-6">
					<h4>Címünk</h4>
					<p>Szeged, Lidicei tér, 6727</p>
					<h4>Telefon</h4>
					<p>+36 1 234 5678</p>
					<h4>E-mail</h4>
					<p>info@dreamstay.hu</p>
				</div>
			</div>
		</section>
	</main>

	<footer class="footer">
		<div class="container">
			<div class="row">
				<div class="footer-col">
					<h4>DreamStay</h4>
					<ul>
						<li><a href="#rooms">Válassz szobáink közül</a></li>
					</ul>
				</div>
				<div class="footer-col">
					<h4>Vélemények</h4>
					<ul>
						<li><a href="#reviews">Vendégvélemények</a></li>
					</ul>
				</div>
				<div class="footer-col">
					<h4>Elérhetőségeink</h4>
					<ul>
						<li><a href="#contact">Keress minket</a></li>
					</ul>
				</div>
				<div class="footer-col">
					<h4>Kövessen minket</h4>
					<div class="social-links">
						<a href="https://www.instagram.com/dreamstayhotel_/" target="_blank"
							><i class="bi bi-instagram"></i></a
						>
						<a href="https://www.facebook.com/profile.php?id=61568641694075" target="_blank"
							><i class="bi bi-facebook"></i></a
						>
						<a href="https://www.tiktok.com/@dreamstay.hotel" target="_blank"
							><i class="bi bi-tiktok"></i></a
						>
					</div>
				</div>
			</div>
		</div>
	</footer>

	<!-- Login/Register Modal -->
	<div
		class="modal fade"
		id="loginModal"
		tabindex="-1"
		aria-labelledby="loginModalLabel"
		aria-hidden="true"
	>
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="loginModalLabel">Bejelentkezés / Regisztráció</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Bezárás"
					></button>
				</div>
				<div class="modal-body">
					<ul class="nav nav-tabs" id="loginTabs" role="tablist">
						<li class="nav-item" role="presentation">
							<button
								class="nav-link active"
								id="login-tab"
								data-bs-toggle="tab"
								data-bs-target="#login"
								type="button"
								role="tab"
								aria-controls="login"
								aria-selected="true">Bejelentkezés</button
							>
						</li>
						<li class="nav-item" role="presentation">
							<button
								class="nav-link"
								id="register-tab"
								data-bs-toggle="tab"
								data-bs-target="#register"
								type="button"
								role="tab"
								aria-controls="register"
								aria-selected="false">Regisztráció</button
							>
						</li>
					</ul>
					<div class="tab-content" id="loginTabsContent">
						<div
							class="tab-pane fade show active"
							id="login"
							role="tabpanel"
							aria-labelledby="login-tab"
						>
							<form id="loginForm" class="mt-3" onsubmit={handleLogin}>
								<div class="mb-3">
									<label for="loginUsername" class="form-label">Felhasználónév</label>
									<input type="text" class="form-control" id="loginUsername" required />
								</div>
								<div class="mb-3">
									<label for="loginPassword" class="form-label">Jelszó</label>
									<input type="password" class="form-control" id="loginPassword" required />
								</div>
								<button type="submit" class="btn btn-dark">Bejelentkezés</button>
							</form>
						</div>
						<div class="tab-pane fade" id="register" role="tabpanel" aria-labelledby="register-tab">
							<form id="registerForm" class="mt-3" onsubmit={handleRegister}>
								<div class="mb-3">
									<label for="registerName" class="form-label">Név</label>
									<input type="text" class="form-control" id="registerName" required />
								</div>
								<div class="row mb-3">
									<div class="col-md-6">
										<label for="registerLastName" class="form-label">Vezetéknév</label>
										<input type="text" class="form-control" id="registerLastName" required />
									</div>
									<div class="col-md-6">
										<label for="registerFirstName" class="form-label">Keresztnév</label>
										<input type="text" class="form-control" id="registerFirstName" required />
									</div>
								</div>
								<div class="mb-3">
									<label for="registerIdentityCard" class="form-label">Személyigazolvány szám</label
									>
									<input type="text" class="form-control" id="registerIdentityCard" required />
								</div>
								<div class="mb-3">
									<label for="registerEmail" class="form-label">E-mail cím</label>
									<input type="email" class="form-control" id="registerEmail" required />
								</div>
								<div class="mb-3">
									<label for="registerPassword" class="form-label">Jelszó</label>
									<input type="password" class="form-control" id="registerPassword" required />
								</div>
								<div class="mb-3">
									<label for="registerConfirmPassword" class="form-label">Jelszó megerősítése</label
									>
									<input
										type="password"
										class="form-control"
										id="registerConfirmPassword"
										required
									/>
								</div>
								<button type="submit" class="btn btn-dark">Regisztráció</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Profile Modal -->
	<div
		class="modal fade"
		id="profileModal"
		tabindex="-1"
		aria-labelledby="profileModalLabel"
		aria-hidden="true"
	>
		<div class="modal-dialog">
			<div
				class="modal-content"
				style="border-radius: 8px; overflow: hidden; background-color: rgb(33, 37, 41); color: white;"
			>
				<div
					class="modal-header"
					style="background-color: rgb(33, 37, 41); color: white; border-bottom: none; padding-bottom: 0;"
				>
					<h5 class="modal-title" id="profileModalLabel">Profilom</h5>
					<button
						type="button"
						class="btn-close"
						data-bs-dismiss="modal"
						aria-label="Bezárás"
						style="filter: invert(1);"
					></button>
				</div>
				<div
					class="modal-body"
					style="background-color: rgb(33, 37, 41); color: white; padding: 16px; margin-top: -4px;"
				>
					<h6 style="font-size: 18px; font-weight: 600; color: white; margin-bottom: 16px;">
						Aktív foglalásaim:
					</h6>
					<div id="userBookings">
						{#if $bookings.length === 0}
							<p style="font-size: 14px; color: rgba(255, 255, 255, 0.8); margin: 0;">
								Jelenleg nincs foglalva szoba.
							</p>
						{:else}
							{#each $bookings as booking}
								<div
									class="card mb-4"
									style="background-color: rgba(255, 255, 255, 0.1); border-radius: 8px; border: none;"
								>
									<div class="card-body">
										<h6 class="card-title fw-bold mb-3" style="font-size: 18px; color: white;">
											{booking.roomName}
										</h6>
										<p
											class="card-text mb-2"
											style="font-size: 14px; color: rgba(255, 255, 255, 0.8);"
										>
											<span style="font-weight: 500;">Érkezés:</span>
											{new Date(booking.checkInDate).toLocaleString()}
										</p>
										<p
											class="card-text mb-3"
											style="font-size: 14px; color: rgba(255, 255, 255, 0.8);"
										>
											<span style="font-weight: 500;">Távozás:</span>
											{new Date(booking.checkOutDate).toLocaleString()}
										</p>

										<!-- Adults and Children Sections -->
										<div class="d-flex flex-row gap-3 mb-3">
											<div
												class="card p-3"
												style="background-color: rgba(255, 255, 255, 0.1); border-radius: 8px; flex: 1;"
											>
												<h5 class="mb-3" style="font-size: 16px; font-weight: 600; color: white;">
													Felnőttek
												</h5>
												{#each booking.adults.$values as adult, i}
													<div
														class="card p-2 mb-2"
														style="background-color: rgba(255, 255, 255, 0.2); border-radius: 6px; border: none;"
													>
														<p
															class="card-text fw-semibold mb-1"
															style="font-size: 14px; color: white;"
														>
															{adult.name}
														</p>
														<p
															class="card-text mb-1"
															style="font-size: 13px; color: rgba(255, 255, 255, 0.8);"
														>
															{adult.dateOfBirth}
														</p>
														<p
															class="card-text mb-0"
															style="font-size: 13px; color: rgba(255, 255, 255, 0.8);"
														>
															{adult.identityCard}
														</p>
													</div>
												{/each}
											</div>
											<div
												class="card p-3"
												style="background-color: rgba(255, 255, 255, 0.1); border-radius: 8px; flex: 1;"
											>
												<h5 class="mb-3" style="font-size: 16px; font-weight: 600; color: white;">
													Gyerekek
												</h5>
												{#each booking.children.$values as children, i}
													<div
														class="card p-2 mb-2"
														style="background-color: rgba(255, 255, 255, 0.2); border-radius: 6px; border: none;"
													>
														<p
															class="card-text fw-semibold mb-1"
															style="font-size: 14px; color: white;"
														>
															{children.name}
														</p>
														<p
															class="card-text mb-1"
															style="font-size: 13px; color: rgba(255, 255, 255, 0.8);"
														>
															{children.dateOfBirth}
														</p>
														<p
															class="card-text mb-0"
															style="font-size: 13px; color: rgba(255, 255, 255, 0.8);"
														>
															{children.identityCard}
														</p>
													</div>
												{/each}
											</div>
										</div>

										<!-- Status and Actions -->
										<div class="d-flex justify-content-between align-items-center mt-3">
											{#if booking.status === 'Jóváhagyásra vár'}
												<button
													class="btn btn-danger btn-sm"
													style="font-size: 14px; padding: 6px 12px; border-radius: 6px;"
													data-booking-index={booking.id}
													onclick={handleBookingRemove}
												>
													Foglalás törlése
												</button>
											{/if}
											<div
												class="badge fs-6 py-2 px-3 fw-normal {booking.status === 'Jóváhagyásra vár'
													? 'bg-warning'
													: 'bg-success'}"
												style="font-size: 14px; border-radius: 6px;"
											>
												{booking.status}
											</div>
										</div>
									</div>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>

	<div
		class="modal fade"
		id="bookingModal"
		tabindex="-1"
		aria-labelledby="bookingModalLabel"
		aria-hidden="true"
	>
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header bg-dark text-white">
					<h5 class="modal-title">Szoba foglalás</h5>
					<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
				</div>
				<div class="modal-body">
					<div class="row g-2">
						<div class="col">
							<label>Érkezés</label>
							<input type="date" id="checkIn" class="form-control" />
						</div>
						<div class="col">
							<label>Távozás</label>
							<input type="date" id="checkOut" class="form-control" />
						</div>
					</div>
					<h6 class="fw-bold mt-3">Felnőttek</h6>
					{#each adults as adult (adult.id)}
						<div class="card mb-2">
							<div class="card-header" style="background-color: rgb(33, 37, 41); color: white;">
								Felnőtt {adult.id}
								<button
									class="btn btn-sm btn-danger float-end"
									onclick={() => removeAdult(adult.id)}>Törlés</button
								>
							</div>
							<div class="card-body">
								<label for="adult-name-{adult.id}">Név</label>
								<input
									id="adult-name-{adult.id}"
									bind:value={adult.name}
									class="form-control mb-1"
								/>

								<label for="adult-dob-{adult.id}">Születési idő</label>
								<input
									type="date"
									id="adult-dob-{adult.id}"
									bind:value={adult.dateOfBirth}
									class="form-control mb-1"
								/>

								<label for="adult-idcard-{adult.id}">Személyigazolvány</label>
								<input
									type="text"
									id="adult-idcard-{adult.id}"
									bind:value={adult.identityCard}
									class="form-control mb-1"
								/>
							</div>
						</div>
					{/each}
					<button class="btn btn-sm btn-outline-primary" onclick={addAdult}
						>+ Felnőtt hozzáadása</button
					>
					<h6 class="fw-bold mt-3">Gyermekek</h6>
					{#each children as child (child.id)}
						<div class="card mb-2">
							<div class="card-header" style="background-color: rgb(33, 37, 41); color: white;">
								Gyermek {child.id}
								<button
									class="btn btn-sm btn-danger float-end"
									onclick={() => removeChild(child.id)}>Törlés</button
								>
							</div>
							<div class="card-body">
								<label for="child-name-{child.id}">Név</label>
								<input
									id="child-name-{child.id}"
									bind:value={child.name}
									class="form-control mb-1"
								/>

								<label for="child-dob-{child.id}">Születési idő</label>
								<input
									type="date"
									id="child-dob-{child.id}"
									bind:value={child.dateOfBirth}
									class="form-control mb-1"
								/>

								<label for="child-idcard-{child.id}">Személyigazolvány</label>
								<input
									type="text"
									id="child-idcard-{child.id}"
									bind:value={child.identityCard}
									class="form-control mb-1"
								/>
							</div>
						</div>
					{/each}
					<button class="btn btn-sm btn-outline-primary" onclick={addChild}
						>+ Gyermek hozzáadása</button
					>
				</div>
				<div class="modal-footer">
					<button class="btn btn-sm btn-outline-danger" data-bs-dismiss="modal">Mégse</button>
					<button class="btn btn-sm btn-outline-success" onclick={handleBooking}>Foglalás</button>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.card {
		width: 100%;
	}
</style>
