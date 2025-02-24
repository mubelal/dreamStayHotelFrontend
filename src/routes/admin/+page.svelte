<script>
	import { userGroup } from '$lib/store';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		if($userGroup !== "Admin"){
			goto("/")
			return
		}
	})

	let selectedUser = $state(null);
	let users = $state([]);
	let userBookings = $state([]);

	async function handleGetBookings() {
		let res = await fetch('/api/Booking/users-with-bookings', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${localStorage.getItem('AuthToken')}`
			}
		});
		let data = await res.json();
		users = data.$values;
	}

	async function selectUser(idCardNumber) {
		selectedUser = idCardNumber;
		await getUserBookings(idCardNumber);
	}

	async function getUserBookings(idCardNumber) {
		const user = users.find((user) => user.id === idCardNumber);
		if (user) {
			const userBookingIds = user.bookingId.$values;

			const bookings = await Promise.all(
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

			userBookings = bookings;
		} else {
			userBookings = [];
		}
	}

	const closeModal = () => {
		selectedUser = null;
	};

	async function handleBookingVerify(bookingIndex) {
		await fetch(`/api/Booking/booking/${bookingIndex}/verify`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${localStorage.getItem('AuthToken')}`
			}
		});
		setTimeout(() => {
			showAlert('Foglalása sikeresen elfogadva.', 'success');
		}, 450);

		await handleGetBookings();
		await getUserBookings(selectedUser);
	}

	async function handleBookingRemove(bookingIndex) {
		await fetch(`/api/Booking/booking/${bookingIndex}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${localStorage.getItem('AuthToken')}`
			}
		});
		setTimeout(() => {
			showAlert('Foglalása sikeresen törölve lett.', 'success');
		}, 450);

		users.find((user) => user.id === selectedUser).bookingId.$values = users
			.find((user) => user.id === selectedUser)
			.bookingId.$values.filter((idx) => idx !== bookingIndex);

		await getUserBookings(selectedUser);
		if (userBookings.length === 0) {
			users = users.filter((user) => user.id !== selectedUser);
			selectedUser = null;
		}
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

	$effect(() => {
		handleGetBookings();
	});
</script>

<section class="container mt-4">
	<h1 class="text-center mb-4">Foglalások kezelése</h1>
	<div class="table-responsive rounded">
		<table class="table table-striped table-hover">
			<thead class="table-dark">
				<tr>
					<th>Név</th>
					<th>Státusz</th>
				</tr>
			</thead>
			<tbody>
				{#each users as user}
					<tr>
						<td class="user-name" onclick={() => selectUser(user.id)}>
							{user.lastName}
							{user.firstName}
						</td>
						<td>
							<span class="badge fw-normal py-2 px-3 fs-6 {user.status === 'Elfogadva' ? 'bg-success' : 'bg-warning'}">
								{user.status}
							</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

{#if selectedUser !== null}
	{@const selectedUserData = users.find((user) => user.id === selectedUser)}
	<div class="modal-overlay" onclick={closeModal} style="background-color: rgba(0, 0, 0, 0.5); position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
		<div class="modal-content" onclick={(e) => e.stopPropagation()} style="background-color: rgb(33, 37, 41); border-radius: 12px; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); position: relative;">
			<!-- Close Button (X Icon) -->
			<button
				onclick={closeModal}
				style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: white; font-size: 20px; cursor: pointer;"
			>
				&times;
			</button>
	
			<!-- Header Section -->
			<div class="p-4 mb-4" style="border-radius: 8px;">
				<h2 class="mb-2" style="font-size: 24px; font-weight: 600; color: white;">{selectedUserData.firstName} foglalásai</h2>
				<p class="mb-0" style="font-size: 16px; color: white;">Személyi igazolvány szám: {selectedUserData.identityCard}</p>
			</div>
	
			<!-- Bookings List -->
			<div class="bookings-list" style="padding: 0 16px 16px 16px;">
				{#each userBookings as booking, index}
					<!-- Outer Room Card -->
					<div class="card mb-4" style="background-color: rgba(255, 255, 255, 0.1); border-radius: 8px; border: none;">
						<div class="card-body">
							<h6 class="card-title fw-bold mb-3" style="font-size: 18px; color: white;">{booking.roomName}</h6>
							<p class="card-text mb-2" style="font-size: 14px; color: rgba(255, 255, 255, 0.8);">
								<span style="font-weight: 500;">Érkezés:</span> {new Date(booking.checkInDate).toLocaleString()}
							</p>
							<p class="card-text mb-3" style="font-size: 14px; color: rgba(255, 255, 255, 0.8);">
								<span style="font-weight: 500;">Távozás:</span> {new Date(booking.checkOutDate).toLocaleString()}
							</p>
	
							<!-- Adults and Children Sections -->
							<div class="d-flex flex-row gap-3 mb-3">
								<div class="card p-3" style="background-color: rgba(255, 255, 255, 0.1); border-radius: 8px; flex: 1;">
									<h5 class="mb-3" style="font-size: 16px; font-weight: 600; color: white;">Felnőttek</h5>
									{#each booking.adults.$values as adult, i}
										<div class="card p-2 mb-2" style="background-color: rgba(255, 255, 255, 0.2); border-radius: 6px; border: none;">
											<p class="card-text fw-semibold mb-1" style="font-size: 14px; color: white;">{adult.name}</p>
											<p class="card-text mb-1" style="font-size: 13px; color: rgba(255, 255, 255, 0.8);">{adult.dateOfBirth}</p>
											<p class="card-text mb-0" style="font-size: 13px; color: rgba(255, 255, 255, 0.8);">{adult.identityCard}</p>
										</div>
									{/each}
								</div>
								<div class="card p-3" style="background-color: rgba(255, 255, 255, 0.1); border-radius: 8px; flex: 1;">
									<h5 class="mb-3" style="font-size: 16px; font-weight: 600; color: white;">Gyerekek</h5>
									{#each booking.children.$values as children, i}
										<div class="card p-2 mb-2" style="background-color: rgba(255, 255, 255, 0.2); border-radius: 6px; border: none;">
											<p class="card-text fw-semibold mb-1" style="font-size: 14px; color: white;">{children.name}</p>
											<p class="card-text mb-1" style="font-size: 13px; color: rgba(255, 255, 255, 0.8);">{children.dateOfBirth}</p>
											<p class="card-text mb-0" style="font-size: 13px; color: rgba(255, 255, 255, 0.8);">{children.identityCard}</p>
										</div>
									{/each}
								</div>
							</div>
	
							<!-- Status and Actions -->
							<div class="d-flex justify-content-between align-items-center mt-3">
								<!-- Show "Foglalás törlése" button for both "Jóváhagyásra vár" and "Elfogadva" statuses -->
	
									{#if booking.status === 'Jóváhagyásra vár'}
										<button class="btn btn-success" onclick={() => handleBookingVerify(booking.id)}>
											Elfogad
										</button>
									{:else if $userGroup === 'Admin'}
										<button class="btn btn-danger" onclick={() => handleBookingRemove(booking.id)}>
											Foglalás törlése
										</button>
									{/if}
								
								<div
									class="badge fs-6 py-2 px-3 fw-normal {booking.status === 'Jóváhagyásra vár' ? 'bg-warning' : 'bg-success'}"
									style="font-size: 14px; border-radius: 6px;"
								>
									{booking.status}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

<div id="customAlert" class="alert d-none"></div>

<style>
	.card {
		width: 100%;
	}
	.user-name {
		cursor: pointer;
		color: #007bff;
	}
	.user-name:hover {
		color: #0056b3;
	}
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.modal-content {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		max-width: 800px;
		width: 100%;
		max-height: 80vh;
		overflow-y: auto;
	}
	.bookings-list {
		max-height: 60vh;
		overflow-y: auto;
	}
	.alert {
		position: fixed;
		top: 20px;
		right: 20px;
		padding: 10px 20px;
		border-radius: 4px;
		color: white;
		font-weight: bold;
	}
	.d-none {
		display: none;
	}
</style>
