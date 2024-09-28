import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Home = () => {
    const router = useRouter();

    useEffect(() => {
        // Redirects to '/portfolio'
        router.push('/portfolio');
    }, [router]);

    return null; // No need to render anything
};

export default Home;
