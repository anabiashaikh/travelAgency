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

    // Mobile & iPad Sidebar Navigation Drawer Logic
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
        if (mobileSidebar && sidebarOverlay) {
            mobileSidebar.classList.add('open');
            sidebarOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeSidebar() {
        if (mobileSidebar && sidebarOverlay) {
            mobileSidebar.classList.remove('open');
            sidebarOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openSidebar);
    }
    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', closeSidebar);
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
});
