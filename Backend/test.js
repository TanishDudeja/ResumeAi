async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testuser123',
                email: 'testuser123@example.com',
                password: 'password123'
            })
        });
        const data = await res.json();
        console.log('Register status:', res.status, data);
    } catch (err) {
        console.error('Register error:', err);
    }

    try {
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'testuser123@example.com',
                password: 'password123'
            })
        });
        const data = await res.json();
        console.log('Login status:', res.status, data);
    } catch (err) {
        console.error('Login error:', err);
    }
}

test();
