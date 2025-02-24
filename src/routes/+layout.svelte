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
		{@render children()}
	</main>
</div>
