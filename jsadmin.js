// DOM Elements
const adminLoginForm = document.getElementById('admin-login-form');
const adminPanel = document.getElementById('admin-panel');
const loginSection = document.getElementById('login-section');
const carUploadForm = document.getElementById('car-upload-form');
const adminCarsList = document.getElementById('admin-cars-list');

// Admin credentials
const ADMIN_USERNAME = 'mycarzworld.in';
const ADMIN_PASSWORD = 'carzworld1680';

// Check if admin is logged in
if (localStorage.getItem('adminLoggedIn') === 'true') {
    loginSection.style.display = 'none';
    adminPanel.style.display = 'block';
    loadAdminCars();
}

// Admin login
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            localStorage.setItem('adminLoggedIn', 'true');
            loginSection.style.display = 'none';
            adminPanel.style.display = 'block';
            loadAdminCars();
        } else {
            alert('Invalid credentials');
        }
    });
}

// Load cars for admin
async function loadAdminCars() {
    const cars = await fetchCarsData();
    
    if (cars.length === 0) {
        adminCarsList.innerHTML = '<p>No cars added yet</p>';
        return;
    }
    
    adminCarsList.innerHTML = cars.map(car => `
        <div class="admin-car-card" data-id="${car.id}">
            <button class="delete-car" onclick="deleteCar('${car.id}')">&times;</button>
            <img src="${car.thumbnail}" alt="${car.name}">
            <h4>${car.name}</h4>
            <p>${car.model} • ${car.year}</p>
        </div>
    `).join('');
}

// Add new car
if (carUploadForm) {
    carUploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const carData = {
            id: Date.now().toString(),
            name: document.getElementById('car-name').value,
            model: document.getElementById('car-model').value,
            year: document.getElementById('car-year').value,
            price: document.getElementById('car-price').value,
            description: document.getElementById('car-description').value,
            thumbnail: document.getElementById('thumbnail').value,
            images: document.getElementById('images').value.split(',').map(img => img.trim())
        };
        
        try {
            await saveCarData(carData);
            alert('Car added successfully!');
            carUploadForm.reset();
            loadAdminCars();
        } catch (error) {
            console.error('Error saving car:', error);
            alert('Failed to add car. Please try again.');
        }
    });
}

// Save car data to GitHub
async function saveCarData(newCar) {
    try {
        // First get the current cars data
        const cars = await fetchCarsData();
        cars.push(newCar);
        
        // Get the current SHA of the file
        const getResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${CARS_DATA_FILE}`, {
            headers: {
                'Authorization': `token ${TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!getResponse.ok) {
            throw new Error('Failed to get file data');
        }
        
        const fileData = await getResponse.json();
        const sha = fileData.sha;
        
        // Update the file
        const updateResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${CARS_DATA_FILE}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add new car: ${newCar.name}`,
                content: btoa(JSON.stringify(cars, null, 2)),
                sha: sha
            })
        });
        
        if (!updateResponse.ok) {
            throw new Error('Failed to update file');
        }
        
        return true;
    } catch (error) {
        console.error('Error saving car data:', error);
        throw error;
    }
}

// Delete a car
async function deleteCar(carId) {
    if (!confirm('Are you sure you want to delete this car?')) return;
    
    try {
        const cars = await fetchCarsData();
        const updatedCars = cars.filter(car => car.id !== carId);
        
        // Get the current SHA of the file
        const getResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${CARS_DATA_FILE}`, {
            headers: {
                'Authorization': `token ${TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!getResponse.ok) {
            throw new Error('Failed to get file data');
        }
        
        const fileData = await getResponse.json();
        const sha = fileData.sha;
        
        // Update the file
        const updateResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${CARS_DATA_FILE}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Delete car with ID: ${carId}`,
                content: btoa(JSON.stringify(updatedCars, null, 2)),
                sha: sha
            })
        });
        
        if (!updateResponse.ok) {
            throw new Error('Failed to update file');
        }
        
        loadAdminCars();
    } catch (error) {
        console.error('Error deleting car:', error);
        alert('Failed to delete car. Please try again.');
    }
}

// Make deleteCar function available globally
window.deleteCar = deleteCar;