<script>
	import '../style.css';
	import 'swiper/css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';
	import { isLoggedIn, userGroup } from '$lib/store';
	import { getUserRole } from '$lib/api';

	let { children } = $props();

	onMount(async () => {
		$userGroup = await getUserRole();
		$isLoggedIn = localStorage.getItem('AuthToken') ? true : false;
	});
</script>

<div>
	<header>
		<Navbar />
	</header>

	
	<main>
		<div class="container mt-5">
			<div id="customAlert" class="alert d-none position-fixed top-5 start-50 translate-middle-x" style="z-index: 9999; margin-top: 20px;"></div>
		</div>
	
		{@render children()}
	</main>
</div>
