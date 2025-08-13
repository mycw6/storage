// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

// User login
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const users = await fetchUsersData();
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = 'index.html';
            } else {
                alert('Invalid email or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        }
    });
}

// User signup
if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password
        };
        
        try {
            await saveUserData(newUser);
            alert('Account created successfully! Please login.');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Signup error:', error);
            alert('Signup failed. Please try again.');
        }
    });
}

// Fetch users data from GitHub
async function fetchUsersData() {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${USERS_DATA_FILE}`, {
            headers: {
                'Authorization': `token ${TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            // If file doesn't exist, return empty array
            if (response.status === 404) {
                return [];
            }
            throw new Error('Failed to fetch users data');
        }
        
        const data = await response.json();
        const content = atob(data.content);
        return JSON.parse(content);
    } catch (error) {
        console.error('Error fetching users data:', error);
        return [];
    }
}

// Save user data to GitHub
async function saveUserData(newUser) {
    try {
        // First get the current users data
        const users = await fetchUsersData();
        users.push(newUser);
        
        // Check if file exists
        let sha = null;
        try {
            const getResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${USERS_DATA_FILE}`, {
                headers: {
                    'Authorization': `token ${TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (getResponse.ok) {
                const fileData = await getResponse.json();
                sha = fileData.sha;
            }
        } catch (error) {
            console.log('File may not exist, will create new one');
        }
        
        // Create or update the file
        const method = sha ? 'PUT' : 'POST';
        const updateResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${USERS_DATA_FILE}`, {
            method: method,
            headers: {
                'Authorization': `token ${TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add new user: ${newUser.email}`,
                content: btoa(JSON.stringify(users, null, 2)),
                sha: sha
            })
        });
        
        if (!updateResponse.ok) {
            throw new Error('Failed to update users file');
        }
        
        return true;
    } catch (error) {
        console.error('Error saving user data:', error);
        throw error;
    }
}