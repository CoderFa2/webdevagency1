
function toggleNavMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}



function toggleNavMenu() {
    const navMenu = document.getElementById('navMenu');
    const navbar = document.querySelector('.navbar'); // Select the navbar element

    // Toggle the 'active' class on the navigation menu
    navMenu.classList.toggle('active');

    // Check if the navigation menu is active
    if (navMenu.classList.contains('active')) {
        // Add a class to make the navbar sticky
        navbar.classList.add('sticky');
    } else {
        // Remove the sticky class if the navigation menu is not active
        navbar.classList.remove('sticky');
    }
}
