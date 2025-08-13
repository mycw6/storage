// GitHub configuration
const GITHUB_USERNAME = 'mycw6';
const REPO_NAME = 'storage';
const TOKEN = 'xxxxxxxxxxxxxxxxxxxxxxxxx';
const CARS_DATA_FILE = 'cars.json';
const USERS_DATA_FILE = 'users.json';

// DOM Elements
const carsContainer = document.getElementById('cars-container');
const carDetailsContainer = document.getElementById('car-details');

// Fetch cars data from GitHub
async function fetchCarsData() {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${CARS_DATA_FILE}`, {
            headers: {
                'Authorization': `token ${TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch cars data');
        }
        
        const data = await response.json();
        const content = atob(data.content);
        return JSON.parse(content);
    } catch (error) {
        console.error('Error fetching cars data:', error);
        return [];
    }
}

// Display cars on the home page
async function displayCars() {
    if (!carsContainer) return;
    
    const cars = await fetchCarsData();
    
    if (cars.length === 0) {
        carsContainer.innerHTML = '<p class="no-cars">No cars available at the moment. Please check back later.</p>';
        return;
    }
    
    carsContainer.innerHTML = cars.map(car => `
        <div class="car-card">
            <img src="${car.thumbnail}" alt="${car.name}" class="car-img">
            <div class="car-info">
                <h3>${car.name}</h3>
                <p>${car.model} • ${car.year}</p>
                <p class="car-price">$${car.price}</p>
                <a href="car-details.html?id=${car.id}" class="btn">View Details</a>
            </div>
        </div>
    `).join('');
}

// Display car details
async function displayCarDetails() {
    if (!carDetailsContainer) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');
    
    if (!carId) {
        carDetailsContainer.innerHTML = '<p>Car not found</p>';
        return;
    }
    
    const cars = await fetchCarsData();
    const car = cars.find(c => c.id === carId);
    
    if (!car) {
        carDetailsContainer.innerHTML = '<p>Car not found</p>';
        return;
    }
    
    carDetailsContainer.innerHTML = `
        <img src="${car.thumbnail}" alt="${car.name}" class="car-main-image">
        <div class="car-content">
            <h1 class="car-title">${car.name}</h1>
            <div class="car-meta">
                <span>${car.model}</span>
                <span>${car.year}</span>
            </div>
            <p class="car-price">$${car.price}</p>
            <p class="car-description">${car.description}</p>
            
            <h3>Gallery</h3>
            <div class="car-gallery">
                ${car.images.map(img => `<img src="${img}" alt="${car.name}">`).join('')}
            </div>
        </div>
    `;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('car-details.html')) {
        displayCarDetails();
    } else if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        displayCars();
    }
});