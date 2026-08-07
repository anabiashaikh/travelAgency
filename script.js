document.addEventListener('DOMContentLoaded', () => {
    // Search Form Submit Handler
    const searchForm = document.querySelector('.search-bar-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const dest = document.getElementById('destination').value;
            const trip = document.getElementById('trip-kind').value;
            const activity = document.getElementById('activities').value;
            const price = document.getElementById('price-range').value;

            alert(`Searching tours for:\n• Destination: ${dest || 'Galiyat'}\n• Trip Type: ${trip || 'Any'}\n• Activity: ${activity || 'Any'}\n• Price: ${price || 'Any'}`);
        });
    }

    // Where to Next Package Carousel Slider Logic
    const pkgCards = document.querySelectorAll('.package-group-card');
    const pkgPrevBtn = document.getElementById('pkgPrevBtn');
    const pkgNextBtn = document.getElementById('pkgNextBtn');
    let currentPkgIndex = 0;

    function showPackage(index) {
        pkgCards.forEach((card, i) => {
            if (i === index) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    if (pkgPrevBtn && pkgNextBtn && pkgCards.length > 0) {
        pkgPrevBtn.addEventListener('click', () => {
            currentPkgIndex = (currentPkgIndex - 1 + pkgCards.length) % pkgCards.length;
            showPackage(currentPkgIndex);
        });

        pkgNextBtn.addEventListener('click', () => {
            currentPkgIndex = (currentPkgIndex + 1) % pkgCards.length;
            showPackage(currentPkgIndex);
        });
    }
});
