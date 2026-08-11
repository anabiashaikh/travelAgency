document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       1. HOMEPAGE SEARCH FORM HANDLER
       ========================================================================== */
    const searchForm = document.querySelector('.search-bar-form:not(.dest-filter-form)');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const dest = document.getElementById('destination')?.value;
            const trip = document.getElementById('trip-kind')?.value;
            const activity = document.getElementById('activities')?.value;
            const price = document.getElementById('price-range')?.value;

            // Redirect to destinations.html with pre-selected filters
            const params = new URLSearchParams();
            if (dest) params.set('dest', dest);
            if (trip) params.set('type', trip);
            if (activity) params.set('activity', activity);
            if (price) params.set('price', price);

            window.location.href = `destinations.html?${params.toString()}`;
        });
    }

    /* ==========================================================================
       2. WHERE TO NEXT CAROUSEL SLIDER (HOMEPAGE)
       ========================================================================== */
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

    /* ==========================================================================
       3. MOBILE SIDEBAR DRAWER NAVIGATION
       ========================================================================== */
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
        if (mobileSidebar && sidebarOverlay) {
            mobileSidebar.classList.add('open');
            sidebarOverlay.classList.add('open');
            document.body.classList.add('no-scroll');
        }
    }

    function closeSidebar() {
        if (mobileSidebar && sidebarOverlay) {
            mobileSidebar.classList.remove('open');
            sidebarOverlay.classList.remove('open');
            document.body.classList.remove('no-scroll');
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

    /* ==========================================================================
       4. DESTINATIONS PAGE FILTERING LOGIC
       ========================================================================== */
    const filterForm = document.getElementById('destFilterForm');
    const filterDest = document.getElementById('filter-dest');
    const filterType = document.getElementById('filter-type');
    const filterActivity = document.getElementById('filter-activity');
    const filterPrice = document.getElementById('filter-price');
    const destCards = document.querySelectorAll('.dest-card');
    const visibleCountEl = document.getElementById('visibleCount');
    const activeTagsWrapper = document.getElementById('activeFilterTags');
    const filterResetBtn = document.getElementById('filterResetBtn');

    // Pre-populate filters from URL parameters if available
    const urlParams = new URLSearchParams(window.location.search);
    if (filterDest && urlParams.has('dest')) filterDest.value = urlParams.get('dest');
    if (filterType && urlParams.has('type')) filterType.value = urlParams.get('type');
    if (filterActivity && urlParams.has('activity')) filterActivity.value = urlParams.get('activity');
    if (filterPrice && urlParams.has('price')) filterPrice.value = urlParams.get('price');

    function applyDestFilters() {
        if (!destCards || destCards.length === 0) return;

        const selDest = filterDest ? filterDest.value : 'all';
        const selType = filterType ? filterType.value : 'all';
        const selAct = filterActivity ? filterActivity.value : 'all';
        const selPrice = filterPrice ? filterPrice.value : 'all';

        let visibleCount = 0;
        const activeTags = [];

        destCards.forEach(card => {
            const cardDest = card.dataset.dest || '';
            const cardType = card.dataset.type || '';
            const cardActivity = card.dataset.activity || '';
            const cardPrice = card.dataset.price || '';

            const matchDest = (selDest === 'all' || cardDest.split(' ').includes(selDest));
            const matchType = (selType === 'all' || cardType.split(' ').includes(selType));
            const matchAct = (selAct === 'all' || cardActivity.split(' ').includes(selAct));
            const matchPrice = (selPrice === 'all' || cardPrice.split(' ').includes(selPrice));

            if (matchDest && matchType && matchAct && matchPrice) {
                card.classList.remove('hidden-card');
                visibleCount++;
            } else {
                card.classList.add('hidden-card');
            }
        });

        if (visibleCountEl) visibleCountEl.textContent = visibleCount;

        // Render Active Tags & Reset Button Toggle
        if (activeTagsWrapper) {
            activeTagsWrapper.innerHTML = '';
            if (selDest !== 'all' && filterDest) activeTags.push({ label: `Dest: ${filterDest.options[filterDest.selectedIndex].text}`, id: 'filter-dest' });
            if (selType !== 'all' && filterType) activeTags.push({ label: `Type: ${filterType.options[filterType.selectedIndex].text}`, id: 'filter-type' });
            if (selAct !== 'all' && filterActivity) activeTags.push({ label: `Act: ${filterActivity.options[filterActivity.selectedIndex].text}`, id: 'filter-activity' });
            if (selPrice !== 'all' && filterPrice) activeTags.push({ label: `Price: ${filterPrice.options[filterPrice.selectedIndex].text}`, id: 'filter-price' });

            activeTags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'filter-tag';
                tagEl.innerHTML = `${tag.label} <i class="fa-solid fa-xmark" data-target="${tag.id}"></i>`;
                activeTagsWrapper.appendChild(tagEl);
            });
        }

        if (filterResetBtn) {
            filterResetBtn.style.display = activeTags.length > 0 ? 'inline-flex' : 'none';
        }
    }

    if (filterForm) {
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            applyDestFilters();
        });
    }

    if (filterDest) filterDest.addEventListener('change', applyDestFilters);
    if (filterType) filterType.addEventListener('change', applyDestFilters);
    if (filterActivity) filterActivity.addEventListener('change', applyDestFilters);
    if (filterPrice) filterPrice.addEventListener('change', applyDestFilters);

    if (activeTagsWrapper) {
        activeTagsWrapper.addEventListener('click', (e) => {
            if (e.target.classList.contains('fa-xmark')) {
                const targetId = e.target.dataset.target;
                const selectEl = document.getElementById(targetId);
                if (selectEl) {
                    selectEl.value = 'all';
                    applyDestFilters();
                }
            }
        });
    }

    if (filterResetBtn) {
        filterResetBtn.addEventListener('click', () => {
            if (filterDest) filterDest.value = 'all';
            if (filterType) filterType.value = 'all';
            if (filterActivity) filterActivity.value = 'all';
            if (filterPrice) filterPrice.value = 'all';
            applyDestFilters();
        });
    }

    // Run initial filter check on load
    applyDestFilters();

    /* ==========================================================================
       5. DESTINATION QUICK-VIEW MODAL DATA & HANDLERS
       ========================================================================== */
    const destinationDetailsData = {
        'nathia-gali': {
            name: 'Nathia Gali',
            location: 'Abbottabad District, KPK',
            badge: 'Most Popular Resort',
            img: 'assets/nathia_gali.png',
            elevation: '2,410m',
            season: 'May – Oct & Snow',
            trek: 'Easy Walks & Trails',
            price: 'PKR 25,000',
            desc: 'Nathia Gali is the iconic jewel of the Galiyat region. Known for its cool foggy mornings, towering pine and oak trees, historic colonial church and Governor House, it offers peaceful nature trails and bustling local artisan markets.',
            activities: [
                'Visit historic colonial Governor House & St. John’s Church',
                'Trek to Mukshpuri Summit & Governor Hill',
                'Stroll along pine-shaded forest walking paths',
                'Enjoy local hot tea, corn on cob, and Hazara trout'
            ]
        },
        'ayubia': {
            name: 'Ayubia National Park',
            location: 'Galiyat Ridge, KPK',
            badge: 'National Park & Chairlift',
            img: 'assets/ayubia.png',
            elevation: '2,400m',
            season: 'Year-Round',
            trek: 'Moderate Nature Trails',
            price: 'PKR 20,000',
            desc: 'Ayubia spans 3,312 hectares of protected Himalayan temperate forest. Celebrated for its open-air cable chairlifts soaring over pine tree canopies, Ayubia is also home to rare bird species, leopard sanctuaries, and crisp mountain streams.',
            activities: [
                'Ride the famous Ayubia open-air chairlift',
                'Hike the famous 4km Pipeline Track to Dunga Gali',
                'Wildlife watching & alpine bird photography',
                'Family picnic spots surrounded by coniferous trees'
            ]
        },
        'mushkpuri': {
            name: 'Mushkpuri Peak',
            location: 'Dunga Gali Summit',
            badge: 'Top Trekking Summit',
            img: 'assets/mushkpuri.png',
            elevation: '2,800m',
            season: 'Summer & Winter Snow',
            trek: 'Moderate (3 Hours)',
            price: 'PKR 18,500',
            desc: 'Rising majestically above Dunga Gali, Mushkpuri Peak is the second highest peak in Galiyat. The trek passes through enchanted pine glades to reveal carpeted green alpine meadows covered in wild flowers and panoramic views of Kashmir valley.',
            activities: [
                'Conquer the 2,800m summit meadow',
                '360° panoramic view of Jhelum River & Kashmir mountains',
                'Golden hour sunset photography',
                'Alpine ridge camping under starry skies'
            ]
        },
        'dunga-gali': {
            name: 'Dunga Gali',
            location: 'Near Nathia Gali, KPK',
            badge: 'Historic Pipeline Track',
            img: 'assets/dunga_gali.png',
            elevation: '2,500m',
            season: 'April – November',
            trek: 'Flat Easy Walk',
            price: 'PKR 22,000',
            desc: 'Dunga Gali is a tranquil hill village nestled on Mukshpuri slopes. It is famous world-wide for the historic Pipeline Track—a 4km flat, tree-covered walking path constructed in 1930 that connects Dunga Gali with Ayubia.',
            activities: [
                'Walk the flat 4km historic Pine Forest Pipeline Track',
                'Bird watching & botanical exploration',
                'View dramatic forest gorge landscapes',
                'Cozy rest houses and misty morning tea'
            ]
        },
        'thandiani': {
            name: 'Thandiani',
            location: 'North Abbottabad, KPK',
            badge: 'Highest Mountain Ridge',
            img: 'assets/thandiani.png',
            elevation: '2,750m',
            season: 'May – Sep & Winter Snow',
            trek: 'Scenic Drive & Walks',
            price: 'PKR 32,000',
            desc: '\'Thandiani\' literally translates to \'extremely cold\'. Located on a high, wind-swept mountain ridge northeast of Abbottabad, it features sea-of-cloud phenomena, lush cedar forests, and total tranquility away from crowded tourist spots.',
            activities: [
                'Witness stunning "sea of clouds" phenomena',
                'High-altitude ridge stargazing & pine camping',
                'Panoramic views of Pir Panjal snow peaks',
                'Serene forest photography & mountain drives'
            ]
        },
        'changla-gali': {
            name: 'Changla Gali',
            location: 'Rawalpindi-Murree Highway',
            badge: 'Cozy Scenic Retreat',
            img: 'assets/changla_gali.png',
            elevation: '2,560m',
            season: 'All Seasons',
            trek: 'Easy Roadside Trails',
            price: 'PKR 21,500',
            desc: 'Elevated at 2,560 meters, Changla Gali is one of the highest hill stations in Galiyat. It offers breathtaking vantage points overlooking Murree hills, dense cedar woods, and cozy wooden rest lodges.',
            activities: [
                'Breathtaking roadside tea & snack vistas',
                'Forest trail walks amidst tall blue pines',
                'Cozy mountain cabin stay',
                'Perfect stopover on the Galiyat highway route'
            ]
        }
    };

    const destModal = document.getElementById('destModal');
    const destModalClose = document.getElementById('destModalClose');
    const modalImg = document.getElementById('modalImg');
    const modalBadge = document.getElementById('modalBadge');
    const modalLocation = document.getElementById('modalLocation');
    const modalName = document.getElementById('modalName');
    const modalDesc = document.getElementById('modalDesc');
    const modalElevation = document.getElementById('modalElevation');
    const modalSeason = document.getElementById('modalSeason');
    const modalTrek = document.getElementById('modalTrek');
    const modalPrice = document.getElementById('modalPrice');
    const modalActivitiesList = document.getElementById('modalActivitiesList');
    const modalBookBtn = document.getElementById('modalBookBtn');

    function openDestModal(destId) {
        const data = destinationDetailsData[destId];
        if (!data || !destModal) return;

        if (modalImg) modalImg.src = data.img;
        if (modalBadge) modalBadge.textContent = data.badge;
        if (modalLocation) modalLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${data.location}`;
        if (modalName) modalName.textContent = data.name;
        if (modalDesc) modalDesc.textContent = data.desc;
        if (modalElevation) modalElevation.textContent = data.elevation;
        if (modalSeason) modalSeason.textContent = data.season;
        if (modalTrek) modalTrek.textContent = data.trek;
        if (modalPrice) modalPrice.textContent = data.price;

        if (modalActivitiesList) {
            modalActivitiesList.innerHTML = '';
            data.activities.forEach(act => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${act}`;
                modalActivitiesList.appendChild(li);
            });
        }

        if (modalBookBtn) {
            modalBookBtn.setAttribute('data-target-dest', data.name);
        }

        destModal.classList.add('open');
        document.body.classList.add('no-scroll');
    }

    function closeDestModal() {
        if (destModal) {
            destModal.classList.remove('open');
            document.body.classList.remove('no-scroll');
        }
    }

    document.querySelectorAll('.btn-dest-explore').forEach(btn => {
        btn.addEventListener('click', () => {
            const destId = btn.dataset.destId;
            openDestModal(destId);
        });
    });

    if (destModalClose) destModalClose.addEventListener('click', closeDestModal);
    if (destModal) {
        destModal.addEventListener('click', (e) => {
            if (e.target === destModal) closeDestModal();
        });
    }

    /* ==========================================================================
       6. BOOKING INQUIRY MODAL HANDLERS
       ========================================================================== */
    const bookingModal = document.getElementById('bookingModal');
    const bookingModalClose = document.getElementById('bookingModalClose');
    const bookingForm = document.getElementById('bookingForm');
    const bookDestSelect = document.getElementById('book-dest');

    function openBookingModal(preferredDest = '') {
        if (bookingModal) {
            closeDestModal(); // Close quick-view modal if open
            if (bookDestSelect && preferredDest) {
                bookDestSelect.value = preferredDest;
            }
            bookingModal.classList.add('open');
            document.body.classList.add('no-scroll');
        }
    }

    function closeBookingModal() {
        if (bookingModal) {
            bookingModal.classList.remove('open');
            document.body.classList.remove('no-scroll');
        }
    }

    document.querySelectorAll('.open-booking-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetDest = btn.getAttribute('data-target-dest') || '';
            openBookingModal(targetDest);
        });
    });

    if (bookingModalClose) bookingModalClose.addEventListener('click', closeBookingModal);
    if (bookingModal) {
        bookingModal.addEventListener('click', (e) => {
            if (e.target === bookingModal) closeBookingModal();
        });
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('book-name').value;
            const destEl = document.getElementById('book-dest') || document.getElementById('book-package-select');
            const dest = destEl ? destEl.value : 'Galiyat Tour';

            alert(`Thank you ${name}! Your tour inquiry for ${dest} has been received. Our Galiyat travel expert will contact you shortly.`);
            bookingForm.reset();
            closeBookingModal();
        });
    }

    /* ==========================================================================
       7. PACKAGES PAGE FILTERING & MODAL LOGIC
       ========================================================================== */
    const pkgFilterForm = document.getElementById('pkgFilterForm');
    const pkgDuration = document.getElementById('pkg-duration');
    const pkgDestination = document.getElementById('pkg-destination');
    const pkgType = document.getElementById('pkg-type');
    const pkgBudget = document.getElementById('pkg-budget');
    const pkgActivity = document.getElementById('pkg-activity');
    const pkgCardsGrid = document.querySelectorAll('.pkg-card');
    const pkgVisibleCountEl = document.getElementById('pkgVisibleCount');
    const pkgActiveFilterTags = document.getElementById('pkgActiveFilterTags');
    const pkgResetBtn = document.getElementById('pkgResetBtn');

    function applyPkgFilters() {
        if (!pkgCardsGrid || pkgCardsGrid.length === 0) return;

        const selDuration = pkgDuration ? pkgDuration.value : 'all';
        const selDest = pkgDestination ? pkgDestination.value : 'all';
        const selType = pkgType ? pkgType.value : 'all';
        const selBudget = pkgBudget ? pkgBudget.value : 'all';
        const selAct = pkgActivity ? pkgActivity.value : 'all';

        let visibleCount = 0;
        const activeTags = [];

        pkgCardsGrid.forEach(card => {
            const cardDuration = card.dataset.duration || '';
            const cardDest = card.dataset.dest || '';
            const cardType = card.dataset.type || '';
            const cardBudget = card.dataset.budget || '';
            const cardActivity = card.dataset.activity || '';

            const matchDuration = (selDuration === 'all' || cardDuration.split(' ').includes(selDuration));
            const matchDest = (selDest === 'all' || cardDest.split(' ').includes(selDest));
            const matchType = (selType === 'all' || cardType.split(' ').includes(selType));
            const matchBudget = (selBudget === 'all' || cardBudget.split(' ').includes(selBudget));
            const matchAct = (selAct === 'all' || cardActivity.split(' ').includes(selAct));

            if (matchDuration && matchDest && matchType && matchBudget && matchAct) {
                card.classList.remove('hidden-card');
                visibleCount++;
            } else {
                card.classList.add('hidden-card');
            }
        });

        if (pkgVisibleCountEl) pkgVisibleCountEl.textContent = visibleCount;

        // Render Active Filter Tags & Reset Button Toggle
        if (pkgActiveFilterTags) {
            pkgActiveFilterTags.innerHTML = '';
            if (selDuration !== 'all' && pkgDuration) activeTags.push({ label: `Dur: ${pkgDuration.options[pkgDuration.selectedIndex].text}`, id: 'pkg-duration' });
            if (selDest !== 'all' && pkgDestination) activeTags.push({ label: `Dest: ${pkgDestination.options[pkgDestination.selectedIndex].text}`, id: 'pkg-destination' });
            if (selType !== 'all' && pkgType) activeTags.push({ label: `Type: ${pkgType.options[pkgType.selectedIndex].text}`, id: 'pkg-type' });
            if (selBudget !== 'all' && pkgBudget) activeTags.push({ label: `Budget: ${pkgBudget.options[pkgBudget.selectedIndex].text}`, id: 'pkg-budget' });
            if (selAct !== 'all' && pkgActivity) activeTags.push({ label: `Act: ${pkgActivity.options[pkgActivity.selectedIndex].text}`, id: 'pkg-activity' });

            activeTags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'filter-tag';
                tagEl.innerHTML = `${tag.label} <i class="fa-solid fa-xmark" data-target="${tag.id}"></i>`;
                pkgActiveFilterTags.appendChild(tagEl);
            });
        }

        if (pkgResetBtn) {
            pkgResetBtn.style.display = activeTags.length > 0 ? 'inline-flex' : 'none';
        }
    }

    if (pkgFilterForm) {
        pkgFilterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            applyPkgFilters();
        });
    }

    if (pkgDuration) pkgDuration.addEventListener('change', applyPkgFilters);
    if (pkgDestination) pkgDestination.addEventListener('change', applyPkgFilters);
    if (pkgType) pkgType.addEventListener('change', applyPkgFilters);
    if (pkgBudget) pkgBudget.addEventListener('change', applyPkgFilters);
    if (pkgActivity) pkgActivity.addEventListener('change', applyPkgFilters);

    if (pkgActiveFilterTags) {
        pkgActiveFilterTags.addEventListener('click', (e) => {
            if (e.target.classList.contains('fa-xmark')) {
                const targetId = e.target.dataset.target;
                const selectEl = document.getElementById(targetId);
                if (selectEl) {
                    selectEl.value = 'all';
                    applyPkgFilters();
                }
            }
        });
    }

    if (pkgResetBtn) {
        pkgResetBtn.addEventListener('click', () => {
            if (pkgDuration) pkgDuration.value = 'all';
            if (pkgDestination) pkgDestination.value = 'all';
            if (pkgType) pkgType.value = 'all';
            if (pkgBudget) pkgBudget.value = 'all';
            if (pkgActivity) pkgActivity.value = 'all';
            applyPkgFilters();
        });
    }

    // Run initial filter check on load
    applyPkgFilters();

    /* Package Details Modal Data */
    const packageDetailsData = {
        'beauteous-galiyat': {
            name: 'Beauteous Galiyat Package',
            location: 'Abbottabad & Galiyat Cluster',
            badge: 'Bestseller',
            img: 'assets/chairlift.png',
            duration: '3 Days / 2 Nights',
            price: 'PKR 25,000 / Person',
            stay: '3-Star Resort',
            transport: 'Sanitized 4x4 Prado',
            desc: 'Our flagship Galiyat package. Enjoy colonial mountain charm in Nathia Gali, float over pine forests on Ayubia chairlift, summit Mushkpuri Peak, and stroll the historic Pipeline Track.',
            itinerary: [
                'Day 1: Pickup from Islamabad/Abbottabad, drive through pine valleys, check-in Nathia Gali resort, evening bazar walk & trout dinner.',
                'Day 2: Morning trek to Mushkpuri Peak summit meadow, afternoon Ayubia open-air cable chairlift ride, dinner bonfire.',
                'Day 3: Guided walk on 4km Dunga Gali Pipeline Track, governor house photo stop, return journey.'
            ]
        },
        'misty-pines': {
            name: 'Misty Pines & Adventure',
            location: 'Thandiani & Changla Gali',
            badge: 'Adventure Special',
            img: 'assets/misty_pines.png',
            duration: '4 Days / 3 Nights',
            price: 'PKR 32,000 / Person',
            stay: 'Pine Lodge & Cabins',
            transport: 'Dedicated 4x4 Grand Cabin',
            desc: 'A deeper wilderness immersion into high-ridge Thandiani and forest-blanketed Changla Gali. Ideal for photographers, nature lovers, and mountain trekking enthusiasts.',
            itinerary: [
                'Day 1: Transfer to Thandiani Peak resort, afternoon sea-of-clouds viewing, golden hour photography.',
                'Day 2: Morning forest ridge walk, transfer to Changla Gali hill station resort, roadside tea & snacks.',
                'Day 3: Full-day Ayubia National Park exploration & Pipeline Track trail hike.',
                'Day 4: Breakfast amidst pine forest, souvenir shopping, return transfer.'
            ]
        },
        'nathia-mushkpuri': {
            name: 'Nathia Gali & Mushkpuri Trek',
            location: 'Nathia Gali & Samundar Katha',
            badge: 'Weekend Trek',
            img: 'assets/GALIYAT-BLOG-PIC-3-1024x768.webp',
            duration: '2 Days / 1 Night',
            price: 'PKR 18,500 / Person',
            stay: 'Standard Hill Hotel',
            transport: 'Coaster / Prado',
            desc: 'The ultimate 2-day weekend refresher! Summit the 2,800m Mushkpuri Peak, explore Nathia Gali Governor estate, and enjoy serene pedal boating at Samundar Katha Lake.',
            itinerary: [
                'Day 1: Arrival in Nathia Gali, guided Mushkpuri summit trek, night stay with traditional Hazara BBQ.',
                'Day 2: Morning visit to Samundar Katha Lake for boating & zip-lining, return back by evening.'
            ]
        },
        'honeymoon-haven': {
            name: 'Honeymoon Pine Haven Special',
            location: 'Luxury Resorts of Galiyat',
            badge: 'Honeymoon Luxury',
            img: 'assets/nathia_gali.png',
            duration: '5 Days / 4 Nights',
            price: 'PKR 55,000 / Couple',
            stay: '4-Star Luxury Cottage',
            transport: 'Private Prado 4x4',
            desc: 'Curated specifically for newlyweds seeking high-end romantic luxury amidst misty pine mountains. Includes candlelit dining, private 4x4 transport, and VIP chairlift passes.',
            itinerary: [
                'Day 1: VIP Private transfer to luxury cottage in Nathia Gali, welcome flower bouquet & candlelight dinner.',
                'Day 2: Private tour of Ayubia Chairlift & Dunga Gali Pipeline Track with photo stop.',
                'Day 3: Day trip to Thandiani ridge for cloud sea photography & tea on high peak.',
                'Day 4: Relaxed day, Governor house garden walk, private BBQ dinner under stars.',
                'Day 5: Breakfast in bed, checkout & VIP return transfer.'
            ]
        },
        'thandiani-camping': {
            name: 'Thandiani Sky Ridge Camping',
            location: 'Thandiani High Ridge',
            badge: 'Stargazing Camp',
            img: 'assets/thandiani.png',
            duration: '2 Days / 1 Night',
            price: 'PKR 16,000 / Person',
            stay: 'Alpine Waterproof Tent',
            transport: 'Mountain Jeep 4x4',
            desc: 'Experience pure mountain freedom camping on Thandiani ridge. Includes stargazing under clear skies, live bonfire, BBQ night, sleeping gear, and sunrise cloud views.',
            itinerary: [
                'Day 1: Jeep drive to Thandiani campsite, tent setup, sunset trail walk, live bonfire & BBQ night.',
                'Day 2: Sunrise cloud sea watching, hot breakfast, scenic photography, afternoon return.'
            ]
        },
        'grand-expedition': {
            name: 'Complete Galiyat Grand Expedition',
            location: 'Full Galiyat Region',
            badge: 'All-Galiyat Cluster',
            img: 'assets/ayubia.png',
            duration: '6 Days / 5 Nights',
            price: 'PKR 68,000 / Person',
            stay: '4-Star Deluxe Resorts',
            transport: 'Private Prado / Coaster',
            desc: 'The ultimate Galiyat bucket-list expedition covering all 6 Galiyat towns, chairlifts, summits, historic tracks, and mountain lakes with dedicated tour guides.',
            itinerary: [
                'Day 1: Arrival & check-in Nathia Gali.',
                'Day 2: Mushkpuri Summit & Governor Estate.',
                'Day 3: Ayubia Chairlift & Pipeline Track.',
                'Day 4: Thandiani Cloud Ridge & Stargazing.',
                'Day 5: Changla Gali & Samundar Katha Boating.',
                'Day 6: Souvenir market shopping & departure.'
            ]
        }
    };

    const pkgModal = document.getElementById('pkgModal');
    const pkgModalClose = document.getElementById('pkgModalClose');
    const pkgModalImg = document.getElementById('pkgModalImg');
    const pkgModalBadge = document.getElementById('pkgModalBadge');
    const pkgModalLocation = document.getElementById('pkgModalLocation');
    const pkgModalName = document.getElementById('pkgModalName');
    const pkgModalDesc = document.getElementById('pkgModalDesc');
    const pkgModalDuration = document.getElementById('pkgModalDuration');
    const pkgModalPrice = document.getElementById('pkgModalPrice');
    const pkgModalStay = document.getElementById('pkgModalStay');
    const pkgModalTransport = document.getElementById('pkgModalTransport');
    const pkgModalItineraryList = document.getElementById('pkgModalItineraryList');
    const pkgModalBookBtn = document.getElementById('pkgModalBookBtn');

    function openPkgModal(pkgId) {
        const data = packageDetailsData[pkgId];
        if (!data || !pkgModal) return;

        if (pkgModalImg) pkgModalImg.src = data.img;
        if (pkgModalBadge) pkgModalBadge.textContent = data.badge;
        if (pkgModalLocation) pkgModalLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${data.location}`;
        if (pkgModalName) pkgModalName.textContent = data.name;
        if (pkgModalDesc) pkgModalDesc.textContent = data.desc;
        if (pkgModalDuration) pkgModalDuration.textContent = data.duration;
        if (pkgModalPrice) pkgModalPrice.textContent = data.price;
        if (pkgModalStay) pkgModalStay.textContent = data.stay;
        if (pkgModalTransport) pkgModalTransport.textContent = data.transport;

        if (pkgModalItineraryList) {
            pkgModalItineraryList.innerHTML = '';
            data.itinerary.forEach(step => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${step}`;
                pkgModalItineraryList.appendChild(li);
            });
        }

        if (pkgModalBookBtn) {
            pkgModalBookBtn.setAttribute('data-target-dest', data.name);
        }

        pkgModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closePkgModal() {
        if (pkgModal) {
            pkgModal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    document.querySelectorAll('.view-pkg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pkgId = btn.dataset.pkgId;
            openPkgModal(pkgId);
        });
    });

    if (pkgModalClose) pkgModalClose.addEventListener('click', closePkgModal);
    if (pkgModal) {
        pkgModal.addEventListener('click', (e) => {
            if (e.target === pkgModal) closePkgModal();
        });
    }

    /* ==========================================================================
       8. ACTIVITIES PAGE FILTERING & MODAL LOGIC
       ========================================================================== */
    const expPills = document.querySelectorAll('.exp-pill');
    const actCards = document.querySelectorAll('.act-card');

    if (expPills.length > 0 && actCards.length > 0) {
        expPills.forEach(pill => {
            pill.addEventListener('click', () => {
                expPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                const selectedCat = pill.dataset.cat;

                actCards.forEach(card => {
                    const cardCat = card.dataset.cat || '';
                    if (selectedCat === 'all' || cardCat === selectedCat) {
                        card.classList.remove('hidden-card');
                    } else {
                        card.classList.add('hidden-card');
                    }
                });
            });
        });
    }

    /* Activity Details Modal Data */
    const activityDetailsData = {
        'hiking-trekking': {
            name: 'Hiking & Trekking Expedition',
            duration: '3 - 5 Hours',
            badge: 'Mountain Adventure',
            img: 'assets/mushkpuri.png',
            diff: 'Moderate',
            location: 'Mushkpuri Peak & Miranjani Ridge',
            season: 'May – October & Winter Snow',
            suitability: 'Regular Walkers & Trekkers',
            desc: 'Conquer the premier summit trails of Galiyat. Trek through pine-scented mountain air, lush alpine flower fields, and take in breathtaking 360-degree panoramas of Kashmir valley.',
            highlights: [
                'Summit Mushkpuri Peak (2,800m) or Miranjani Peak (2,992m)',
                'Professional local mountain trek leader & first-aid support',
                'Wildflower meadow exploration & summit photography',
                'Fresh mountain tea breaks at local ridge stalls'
            ]
        },
        'pipeline-track': {
            name: 'Dunga Gali Pipeline Track Walk',
            duration: '1.5 - 2 Hours',
            badge: 'Forest Trail',
            img: 'assets/dunga_gali.png',
            diff: 'Easy / All Ages',
            location: 'Dunga Gali to Ayubia',
            season: 'April – November',
            suitability: 'Families, Kids & Seniors',
            desc: 'Walk the famous flat 4km historic pine forest walking trail constructed in 1930. Nestled in deep forest glades overlooking lush green gorges, it is widely considered the quietest and most scenic walk in Pakistan.',
            highlights: [
                'Flat 4km historic tree-shaded walking path',
                'Alpine bird watching & rare flora observation',
                'Spectacular gorge & mountain valley viewpoints',
                'Suitable for all age groups and casual walkers'
            ]
        },
        'ayubia-chairlift': {
            name: 'Ayubia Cable Chairlift Ride',
            duration: '45 Minutes',
            badge: 'Scenic Sightseeing',
            img: 'assets/ayubia.png',
            diff: 'Easy',
            location: 'Ayubia National Park',
            season: 'Year-Round',
            suitability: 'All Travelers',
            desc: 'Glide high above the evergreen pine canopy of Ayubia National Park on open-air double chairlifts. Enjoy cool mountain air, panoramic valley vistas, and family picnic grounds at the top station.',
            highlights: [
                'Open-air cable chairlift glide over pine treetops',
                '360° views of Ayubia National Park sanctuary',
                'Top station mountain cafes & photo viewpoints',
                'Fun experience for couples, kids, and families'
            ]
        },
        'camping': {
            name: 'Thandiani Sky Ridge Camping',
            duration: 'Overnight / 1-2 Days',
            badge: 'Outdoor Camping',
            img: 'assets/thandiani.png',
            diff: 'Easy - Moderate',
            location: 'Thandiani & Mushkpuri Ridge',
            season: 'May – September',
            suitability: 'Groups & Adventure Couples',
            desc: 'Spend an unforgettable night under a blanket of stars high on Galiyat\'s wind-swept mountain ridges. Enjoy waterproof alpine tents, live bonfire, delicious BBQ, and sunrise over sea-of-clouds.',
            highlights: [
                'Waterproof alpine tents, sleeping bags & mat setup',
                'Live mountain bonfire & evening BBQ feast',
                'High-altitude stargazing under unpolluted skies',
                'Breathtaking sunrise cloud ocean phenomena'
            ]
        },
        'nature-walks': {
            name: 'Pine Forest & Nature Walks',
            duration: '1 - 3 Hours',
            badge: 'Forest Trail',
            img: 'assets/misty_pines.png',
            diff: 'Easy',
            location: 'Nathia Gali & Changla Gali',
            season: 'All Seasons',
            suitability: 'Nature Lovers',
            desc: 'Immerse yourself in therapeutic forest bathing among giant blue pines and Himalayan cedars. Breathe crisp oxygen-rich air and recharge away from city noise.',
            highlights: [
                'Guided pine forest trail walks',
                'Oxygen-rich mountain air & pine fragrance',
                'Mountain stream crossings & bird watching',
                'Peaceful solitude & nature meditation'
            ]
        },
        'photography': {
            name: 'Mountain Photography Tour',
            duration: 'Half-Day / Full-Day',
            badge: 'Scenic Sightseeing',
            img: 'assets/nathia_gali.png',
            diff: 'All Levels',
            location: 'Galiyat Viewpoints & Estates',
            season: 'All Seasons',
            suitability: 'Photographers & Content Creators',
            desc: 'Capture the magical moods of Galiyat. From morning mist shadows filtering through tall pines to dramatic cloud carpets and colonial hill station architecture.',
            highlights: [
                'Golden hour cloud ocean viewpoints at Thandiani',
                'Colonial Governor House & St. John’s Church framing',
                'Macro flora photography & alpine landscape vistas',
                'Guided by local photographer who knows peak light spots'
            ]
        },
        'sightseeing': {
            name: 'Hill Station Sightseeing Tour',
            duration: 'Full Day',
            badge: 'Scenic Sightseeing',
            img: 'assets/changla_gali.png',
            diff: 'Easy',
            location: 'Nathia Gali, Thandiani & Changla Gali',
            season: 'Year-Round',
            suitability: 'Families & Senior Travelers',
            desc: 'Explore the highlights of Galiyat in comfort. Visit colonial rest houses, scenic mountain road passes, bustling bazaars, and enjoy roadside tea stops.',
            highlights: [
                'Comfortable private Prado / Coaster transport',
                'Visits to Nathia Gali, Changla Gali & Thandiani peaks',
                'Colonial estate grounds & mountain bazaars',
                'Flexible pace tailored to family comfort'
            ]
        },
        'culture-cuisine': {
            name: 'Local Culture & Hazara Cuisine',
            duration: '2 - 4 Hours',
            badge: 'Culture & Food',
            img: 'assets/chairlift.png',
            diff: 'Easy',
            location: 'Nathia Gali Bazaar & Food Stalls',
            season: 'Year-Round',
            suitability: 'Foodies & Culture Enthusiasts',
            desc: 'Delight your senses with authentic Hazara and Kashmiri flavors. Savor freshly grilled mountain trout, hot roasted corn, pine honey, and steaming Kashmiri chai.',
            highlights: [
                'Fresh Hazara mountain trout tasting',
                'Wood-fired roadside corn & hot chai stalls',
                'Pure local pine honey & dry fruit tasting',
                'Experience warm mountain hospitality'
            ]
        }
    };

    const actModal = document.getElementById('actModal');
    const actModalClose = document.getElementById('actModalClose');
    const actModalImg = document.getElementById('actModalImg');
    const actModalBadge = document.getElementById('actModalBadge');
    const actModalDuration = document.getElementById('actModalDuration');
    const actModalName = document.getElementById('actModalName');
    const actModalDesc = document.getElementById('actModalDesc');
    const actModalDiff = document.getElementById('actModalDiff');
    const actModalLocation = document.getElementById('actModalLocation');
    const actModalSeason = document.getElementById('actModalSeason');
    const actModalSuitability = document.getElementById('actModalSuitability');
    const actModalHighlightsList = document.getElementById('actModalHighlightsList');
    const actModalBookBtn = document.getElementById('actModalBookBtn');

    function openActModal(actId) {
        const data = activityDetailsData[actId];
        if (!data || !actModal) return;

        if (actModalImg) actModalImg.src = data.img;
        if (actModalBadge) actModalBadge.textContent = data.badge;
        if (actModalDuration) actModalDuration.innerHTML = `<i class="fa-regular fa-clock"></i> ${data.duration}`;
        if (actModalName) actModalName.textContent = data.name;
        if (actModalDesc) actModalDesc.textContent = data.desc;
        if (actModalDiff) actModalDiff.textContent = data.diff;
        if (actModalLocation) actModalLocation.textContent = data.location;
        if (actModalSeason) actModalSeason.textContent = data.season;
        if (actModalSuitability) actModalSuitability.textContent = data.suitability;

        if (actModalHighlightsList) {
            actModalHighlightsList.innerHTML = '';
            data.highlights.forEach(hl => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${hl}`;
                actModalHighlightsList.appendChild(li);
            });
        }

        if (actModalBookBtn) {
            actModalBookBtn.setAttribute('data-target-dest', data.name);
        }

        actModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeActModal() {
        if (actModal) {
            actModal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    document.querySelectorAll('.view-act-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const actId = btn.dataset.actId;
            openActModal(actId);
        });
    });

    if (actModalClose) actModalClose.addEventListener('click', closeActModal);
    if (actModal) {
        actModal.addEventListener('click', (e) => {
            if (e.target === actModal) closeActModal();
        });
    }

    /* ==========================================================================
       9. GALLERY PAGE FILTERING & LIGHTBOX VIEWER LOGIC
       ========================================================================== */
    const galPills = document.querySelectorAll('.gal-pill');
    const galItems = document.querySelectorAll('.gallery-item');
    const galleryLightbox = document.getElementById('galleryLightbox');
    const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
    const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
    const lightboxNextBtn = document.getElementById('lightboxNextBtn');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxLoc = document.getElementById('lightboxLoc');
    const lightboxCounter = document.getElementById('lightboxCounter');

    let currentVisibleItems = [];
    let currentLightboxIndex = 0;

    function updateVisibleGalleryItems() {
        currentVisibleItems = Array.from(galItems).filter(item => !item.classList.contains('hidden-card'));
    }

    if (galPills.length > 0 && galItems.length > 0) {
        galPills.forEach(pill => {
            pill.addEventListener('click', () => {
                galPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                const selectedCat = pill.dataset.cat;

                galItems.forEach(item => {
                    const itemCat = item.dataset.cat || '';
                    if (selectedCat === 'all' || itemCat.includes(selectedCat)) {
                        item.classList.remove('hidden-card');
                    } else {
                        item.classList.add('hidden-card');
                    }
                });

                updateVisibleGalleryItems();
            });
        });

        // Initialize array of visible items
        updateVisibleGalleryItems();
    }

    function showLightboxImage(index) {
        if (!currentVisibleItems || currentVisibleItems.length === 0) return;

        currentLightboxIndex = (index + currentVisibleItems.length) % currentVisibleItems.length;
        const targetItem = currentVisibleItems[currentLightboxIndex];
        const imgEl = targetItem.querySelector('.gal-item-img');
        const title = targetItem.dataset.title || 'Galiyat Moment';
        const loc = targetItem.dataset.loc || 'Galiyat, KPK';

        if (lightboxImg && imgEl) lightboxImg.src = imgEl.src;
        if (lightboxTitle) lightboxTitle.textContent = title;
        if (lightboxLoc) lightboxLoc.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${loc}`;
        if (lightboxCounter) lightboxCounter.textContent = `Image ${currentLightboxIndex + 1} of ${currentVisibleItems.length}`;
    }

    function openLightbox(index) {
        updateVisibleGalleryItems();
        if (!galleryLightbox) return;
        showLightboxImage(index);
        galleryLightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (galleryLightbox) {
            galleryLightbox.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    galItems.forEach(item => {
        item.addEventListener('click', () => {
            updateVisibleGalleryItems();
            const index = currentVisibleItems.indexOf(item);
            if (index !== -1) {
                openLightbox(index);
            }
        });
    });

    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
    if (lightboxPrevBtn) {
        lightboxPrevBtn.addEventListener('click', () => {
            showLightboxImage(currentLightboxIndex - 1);
        });
    }
    if (lightboxNextBtn) {
        lightboxNextBtn.addEventListener('click', () => {
            showLightboxImage(currentLightboxIndex + 1);
        });
    }

    if (galleryLightbox) {
        galleryLightbox.addEventListener('click', (e) => {
            if (e.target === galleryLightbox) closeLightbox();
        });
    }

    // Keyboard Shortcuts for Lightbox
    document.addEventListener('keydown', (e) => {
        if (galleryLightbox && galleryLightbox.classList.contains('open')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showLightboxImage(currentLightboxIndex - 1);
            if (e.key === 'ArrowRight') showLightboxImage(currentLightboxIndex + 1);
        }
    });

    /* ==========================================================================
       10. CONTACT PAGE & FAQ ACCORDION LOGIC
       ========================================================================== */
    // Contact Form Submission Handler
    const mainContactForm = document.getElementById('mainContactForm');
    if (mainContactForm) {
        mainContactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name')?.value || 'Traveler';
            alert(`Thank you, ${name}! Your Galiyat trip inquiry has been received. Our travel specialist will contact you within 2 hours.`);
            mainContactForm.reset();
        });
    }

    // FAQ Accordion Toggle
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isActive = item.classList.contains('active');

            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    /* ==========================================================================
       11. CROWN INN HOTEL RESERVATION MODAL & BUTTON HANDLERS
       ========================================================================== */
    const crownModal = document.getElementById('crownBookingModal');
    const crownModalClose = document.getElementById('crownModalClose');
    const openCrownBtns = document.querySelectorAll('.open-crown-modal-btn, .reserve-room-btn');
    const crownRoomSelect = document.getElementById('crown-room-select');
    const crownBookingForm = document.getElementById('crownBookingForm');
    const checkAvailabilityBtn = document.getElementById('checkAvailabilityBtn');

    openCrownBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedRoom = btn.getAttribute('data-room');
            if (selectedRoom && crownRoomSelect) {
                crownRoomSelect.value = selectedRoom;
            }
            if (crownModal) {
                crownModal.classList.add('open');
                document.body.classList.add('no-scroll');
            }
        });
    });

    if (crownModalClose && crownModal) {
        crownModalClose.addEventListener('click', () => {
            crownModal.classList.remove('open');
            document.body.classList.remove('no-scroll');
        });
        crownModal.addEventListener('click', (e) => {
            if (e.target === crownModal) {
                crownModal.classList.remove('open');
                document.body.classList.remove('no-scroll');
            }
        });
    }

    if (checkAvailabilityBtn) {
        checkAvailabilityBtn.addEventListener('click', () => {
            const checkin = document.getElementById('checkin-date')?.value;
            const checkout = document.getElementById('checkout-date')?.value;
            const roomsSection = document.getElementById('rooms-section');
            if (roomsSection) {
                roomsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Helper function to save booking to localStorage
    function saveBookingRecord(data) {
        try {
            let bookings = JSON.parse(localStorage.getItem('galiyat_bookings')) || [];
            bookings.unshift(data);
            localStorage.setItem('galiyat_bookings', JSON.stringify(bookings));
        } catch (e) {
            console.error('Error saving booking:', e);
        }
    }

    const standaloneBookingForm = document.getElementById('standaloneBookingForm');
    if (standaloneBookingForm) {
        standaloneBookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const firstName = document.getElementById('bf-first-name')?.value || 'Guest';
            const lastName = document.getElementById('bf-last-name')?.value || '';
            const phone = document.getElementById('bf-phone')?.value || '';
            const city = document.getElementById('bf-city')?.value || '';
            const country = document.getElementById('bf-country')?.value || 'Pakistan';
            const datetime = document.getElementById('bf-datetime')?.value || new Date().toLocaleString();
            const bookingType = document.querySelector('input[name="booking_type"]:checked')?.value || 'Reservation';
            const confirmationChannel = document.querySelector('input[name="confirmation_type"]:checked')?.value || 'Text';

            const newBooking = {
                id: 'GLY-' + Math.floor(100000 + Math.random() * 900000),
                firstName,
                lastName,
                phone,
                city,
                country,
                datetime,
                bookingType,
                confirmationChannel,
                property: 'Explore Galiyat Tour / Stay',
                status: 'Confirmed',
                createdAt: new Date().toLocaleString()
            };

            saveBookingRecord(newBooking);

            // Trigger WhatsApp Message Alert to Agency (+92 300 1234567)
            const waMsg = `*NEW BOOKING RESERVATION RECEIVED!*%0A%0A*Name:* ${firstName} ${lastName}%0A*Phone:* ${phone}%0A*City:* ${city}, ${country}%0A*Date & Time:* ${datetime}%0A*Type:* ${bookingType}%0A*Confirmation via:* ${confirmationChannel}%0A%0A_Reservation automatically stored in Admin Dashboard (admin.html)_`;
            
            alert(`🎉 Booking Submitted Successfully!\n\nThank you, ${firstName} ${lastName}! Your reservation [#${newBooking.id}] has been saved.\n\nWe are opening WhatsApp to notify our front desk manager instantly.`);
            
            window.open(`https://wa.me/923001234567?text=${waMsg}`, '_blank');
            standaloneBookingForm.reset();
        });
    }

    if (crownBookingForm) {
        crownBookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const firstName = document.getElementById('crown-first-name')?.value || 'Guest';
            const lastName = document.getElementById('crown-last-name')?.value || '';
            const phone = document.getElementById('crown-phone')?.value || '';
            const city = document.getElementById('crown-city')?.value || 'Khaira Gali';
            const country = document.getElementById('crown-country')?.value || 'Pakistan';
            const datetime = document.getElementById('crown-datetime')?.value || 'Sat, Aug 15, 2026';
            const bookingType = document.querySelector('input[name="crown_booking_type"]:checked')?.value || 'Reservation';
            const confirmationChannel = document.querySelector('input[name="crown_confirmation_type"]:checked')?.value || 'Text';

            const newBooking = {
                id: 'CRN-' + Math.floor(100000 + Math.random() * 900000),
                firstName,
                lastName,
                phone,
                city,
                country,
                datetime,
                bookingType,
                confirmationChannel,
                property: 'Crown Inn Hotel Service Apartments, Khaira Gali',
                status: 'Confirmed',
                createdAt: new Date().toLocaleString()
            };

            saveBookingRecord(newBooking);

            // Trigger WhatsApp Message Alert to Agency (+92 300 1234567)
            const waMsg = `*NEW CROWN INN RESERVATION RECEIVED!*%0A%0A*Property:* Crown Inn Hotel Service Apartments, Khaira Gali%0A*Guest Name:* ${firstName} ${lastName}%0A*Phone:* ${phone}%0A*Check-in Date:* ${datetime}%0A*Status:* Confirmed (Pay at Property)%0A%0A_Record saved in Admin Dashboard (admin.html)_`;

            alert(`🎉 Crown Inn Reservation Confirmed!\n\nThank you, ${firstName} ${lastName}! Your reservation [#${newBooking.id}] is stored in the system.\n\nOpening WhatsApp to notify the Crown Inn front desk manager...`);

            if (crownModal) {
                crownModal.classList.remove('open');
                document.body.classList.remove('no-scroll');
            }
            window.open(`https://wa.me/923001234567?text=${waMsg}`, '_blank');
            crownBookingForm.reset();
        });
    }

    // Dynamic Booking.com Room Total Calculator
    const roomSelects = document.querySelectorAll('.room-count-select');
    const resTotalPriceEl = document.getElementById('resTotalPrice');

    function updateBcomTotal() {
        let total = 0;
        roomSelects.forEach(sel => {
            const count = parseInt(sel.value) || 0;
            const price = parseInt(sel.getAttribute('data-price')) || 0;
            total += count * price;
        });
        if (resTotalPriceEl) {
            resTotalPriceEl.textContent = `PKR ${total.toLocaleString()}`;
        }
    }

    roomSelects.forEach(sel => {
        sel.addEventListener('change', updateBcomTotal);
    });

    // Admin Add Hotel Handler
    const addHotelAdminForm = document.getElementById('addHotelAdminForm');
    if (addHotelAdminForm) {
        addHotelAdminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('new-hotel-name')?.value;
            const location = document.getElementById('new-hotel-location')?.value;
            const price = parseInt(document.getElementById('new-hotel-price')?.value) || 12000;
            const stars = document.getElementById('new-hotel-stars')?.value || '4';
            const type = document.getElementById('new-hotel-type')?.value || 'hotel';
            const img = document.getElementById('new-hotel-img')?.value || 'assets/670814713.jpg';
            const room = document.getElementById('new-hotel-room')?.value || 'Standard Room';

            const newHotel = { name, location, price, stars, type, img, room };

            try {
                let hotels = JSON.parse(localStorage.getItem('galiyat_custom_hotels')) || [];
                hotels.unshift(newHotel);
                localStorage.setItem('galiyat_custom_hotels', JSON.stringify(hotels));
                alert(`🎉 Hotel "${name}" added successfully!\n\nIt is now live on the Booking.com search results page (galiyat-hotels.html).`);
                addHotelAdminForm.reset();
            } catch (err) {
                console.error('Error saving custom hotel:', err);
            }
        });
    }

    // Render Custom Stored Hotels on galiyat-hotels.html
    const bcomContainer = document.getElementById('bcomHotelsContainer');
    if (bcomContainer) {
        try {
            const customHotels = JSON.parse(localStorage.getItem('galiyat_custom_hotels')) || [];
            customHotels.forEach(h => {
                const article = document.createElement('article');
                article.className = 'bcom-listing-card';
                article.setAttribute('data-price', h.price);
                article.setAttribute('data-stars', h.stars);
                article.setAttribute('data-type', h.type);

                let starStr = '⭐⭐⭐';
                if (h.stars === '4') starStr = '⭐⭐⭐⭐';
                if (h.stars === '5') starStr = '⭐⭐⭐⭐⭐';

                article.innerHTML = `
                    <div class="card-left-img">
                        <img src="${h.img}" alt="${h.name}">
                        <button class="wishlist-btn" title="Save property"><i class="fa-regular fa-heart"></i></button>
                    </div>
                    <div class="card-mid-info">
                        <div class="property-header flex-align">
                            <h3 class="property-name"><a href="crown-inn.html">${h.name}</a></h3>
                            <span class="stars-badge">${starStr}</span>
                            <span class="bcom-featured-pill">New</span>
                        </div>
                        <div class="property-location flex-align">
                            <span class="loc-text">${h.location}</span>
                            <a href="crown-inn.html" class="map-link">Show on map</a>
                        </div>
                        <div class="room-spec-box">
                            <strong>${h.room}</strong>
                        </div>
                        <div class="perks-list">
                            <span class="perk-item green-text"><i class="fa-solid fa-check"></i> Breakfast included</span>
                            <span class="perk-item green-text"><i class="fa-solid fa-check"></i> Free cancellation</span>
                            <span class="perk-item green-text"><i class="fa-solid fa-check"></i> Pay at the property</span>
                        </div>
                    </div>
                    <div class="card-right-pricing text-right">
                        <div class="review-score-badge flex-between flex-align">
                            <div class="score-text">
                                <strong class="score-label">Superb</strong>
                                <span class="review-count">Verified</span>
                            </div>
                            <span class="score-num">9.0</span>
                        </div>
                        <div class="pricing-box">
                            <span class="stay-dur">1 night, 2 adults</span>
                            <div class="price-val">PKR ${h.price.toLocaleString()}</div>
                            <span class="tax-note">+PKR ${Math.round(h.price * 0.1).toLocaleString()} taxes and fees</span>
                        </div>
                        <a href="crown-inn.html" class="bcom-see-avail-btn">
                            <span>See availability</span> <i class="fa-solid fa-chevron-right"></i>
                        </a>
                    </div>
                `;
                bcomContainer.insertBefore(article, bcomContainer.firstChild);
            });
        } catch (e) {
            console.error('Error rendering custom hotels:', e);
        }
    }

    /* ==========================================================================
       DYNAMIC DESTINATION LOCATIONS (LOCALSTORAGE & DATALIST RENDERER)
       ========================================================================== */
    const datalist = document.getElementById('dynamicDestinationsList');
    if (datalist) {
        try {
            const customLocs = JSON.parse(localStorage.getItem('galiyat_custom_locations')) || [];
            customLocs.forEach(loc => {
                const opt = document.createElement('option');
                opt.value = loc;
                datalist.appendChild(opt);
            });
        } catch (err) {
            console.error('Error loading custom locations:', err);
        }
    }

    const addLocationAdminForm = document.getElementById('addLocationAdminForm');
    if (addLocationAdminForm) {
        addLocationAdminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const locName = document.getElementById('new-location-name')?.value;
            if (!locName) return;

            try {
                let locs = JSON.parse(localStorage.getItem('galiyat_custom_locations')) || [];
                if (!locs.includes(locName)) {
                    locs.push(locName);
                    localStorage.setItem('galiyat_custom_locations', JSON.stringify(locs));
                }
                alert(`🎉 Location "${locName}" added successfully!\n\nIt is now live in the search bar destination dropdown list.`);
                addLocationAdminForm.reset();
            } catch (err) {
                console.error('Error saving new location:', err);
            }
        });
    }
});




