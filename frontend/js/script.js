/* 
 * MedCare Premium Script 
 * Handles intersection observers for scroll animations and basic UI interactions.
 */

// Global Toast Function
window.showToast = function (message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ph-check-circle';
    if (type === 'error') icon = 'ph-x-circle';
    if (type === 'warning') icon = 'ph-warning-circle';

    toast.innerHTML = `
        <i class="ph-fill ${icon} toast-icon"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
};

document.addEventListener('DOMContentLoaded', () => {
    // redirect from login page if already authenticated
    if (window.location.pathname.endsWith('login.html') && localStorage.getItem('medcareLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
        return; // don't execute further scripts
    }

    // 0. Creative Global Mouse Tracker
    const flare = document.createElement('div');
    flare.classList.add('mouse-flare');
    document.body.appendChild(flare);

    document.addEventListener('mousemove', (e) => {
        // slight offset for performance/smoothness handled by css transitioning
        flare.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
    });

    document.addEventListener('mouseenter', () => flare.style.opacity = '1');
    document.addEventListener('mouseleave', () => flare.style.opacity = '0');
    // turn it on initially if mouse is already in frame
    flare.style.opacity = '1';

    // 0b. Magnetic Buttons Effect
    const magneticBtns = document.querySelectorAll('.btn-primary, .btn-secondary, .logo');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.02)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // 0c. Counter Animation for Stats
    function animateCounter(el) {
        const target = parseInt(el.innerText);
        let count = 0;
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps

        const updateCount = () => {
            count += increment;
            if (count < target) {
                el.innerText = Math.floor(count);
                requestAnimationFrame(updateCount);
            } else {
                el.innerText = target;
            }
        };
        updateCount();
    }

    const statNumbers = document.querySelectorAll('.stat-info h3');
    if (statNumbers.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statNumbers.forEach(n => observer.observe(n));
    }

    // 1. Intersection Observer for Scroll Animations
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (animatedElements.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');

                    // Stagger child animations for grids/lists
                    const children = entry.target.querySelectorAll('.stat-card, .list-card, .card');
                    if (children.length > 0) {
                        children.forEach((child, index) => {
                            child.style.opacity = '0';
                            child.style.transform = 'translateY(20px)';
                            child.style.transition = `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.15}s`;

                            // trigger reflow
                            void child.offsetWidth;

                            child.style.opacity = '1';
                            child.style.transform = 'translateY(0)';

                            // cleanup transition back to normal later
                            setTimeout(() => {
                                child.style.transition = 'var(--transition-smooth)';
                            }, (index * 150) + 600);
                        });
                    }

                    // observer.unobserve(entry.target); 
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    }

    // 2. Demo UI Interactions
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-outline');
    buttons.forEach(btn => {
        // Exclude actual links and auth submits to let them act normally
        if (btn.tagName === 'BUTTON' && !btn.closest('form')) {
            btn.addEventListener('click', (e) => {
                // Just a micro-animation effect for demonstration without annoying alerts
                const originalText = btn.innerHTML;
                const isPrimary = btn.classList.contains('btn-primary');

                // Add a simple active state class or effect
                btn.style.transform = 'scale(0.97)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 150);
            });
        }
    });

    // 3. Simple Header Scroll Effect
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.style.boxShadow = 'var(--shadow-md)';
                header.style.background = 'var(--bg-glass-dark)';
            } else {
                header.style.boxShadow = 'none';
                header.style.background = 'var(--bg-glass)';
            }
        });
    }

    // 4. Authentication & Simulated Backend User Management
    const defaultUser = { fname: 'John', lname: 'Doe', email: 'john.doe@example.com' };

    function isLoggedIn() {
        return localStorage.getItem('medcareLoggedIn') === 'true';
    }

    function setLoggedIn(flag) {
        if (flag) localStorage.setItem('medcareLoggedIn', 'true');
        else localStorage.removeItem('medcareLoggedIn');
    }

    function getUserData() {
        const data = localStorage.getItem('medcareUser');
        return data ? JSON.parse(data) : defaultUser;
    }

    function setUserData(data) {
        localStorage.setItem('medcareUser', JSON.stringify(data));
    }

    function updateNav() {
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            // Hide Dashboard, Profile, and Find Doctors (search.html) if not logged in
            if (href === 'dashboard.html' || href === 'profile.html' || href === 'search.html') {
                link.style.display = isLoggedIn() ? '' : 'none';
            }

            // For auth pages (login/signup), some specialized nav logic
            if (href === 'login.html' && link.closest('.header-actions') === null) {
                if (isLoggedIn()) {
                    link.textContent = 'Logout';
                    link.href = '#';
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        setLoggedIn(false);
                        window.location.href = 'index.html';
                    });
                } else {
                    link.textContent = 'Login';
                    link.href = 'login.html';
                }
            }
        });

        // Update the header-actions container (which holds the Login/Signup buttons or the Profile avatar)
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            if (isLoggedIn()) {
                const user = getUserData();
                const existingNavUser = document.getElementById('navUserName');
                if (existingNavUser) {
                    existingNavUser.textContent = `${user.fname} ${user.lname}`;
                } else {
                    // if it doesn't exist, build it (e.g. index.html)
                    headerActions.className = 'header-actions'; // reset class, remove flex gap-4
                    headerActions.innerHTML = `
                        <a href="profile.html" class="flex align-center gap-2 text-main" style="font-weight: 600;">
                            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" class="avatar" style="width: 40px; height: 40px; border: 2px solid var(--primary);">
                            <span id="navUserName">${user.fname} ${user.lname}</span>
                        </a>
                    `;
                }
            } else {
                headerActions.className = 'header-actions flex gap-4';
                headerActions.innerHTML = `
                    <a href="login.html" class="btn btn-secondary">Log In</a>
                    <a href="signup.html" class="btn btn-primary">Sign Up</a>
                `;
            }
        }
    }

    function populateUserData() {
        if (!isLoggedIn()) return;
        const user = getUserData();

        // Dashboard
        const dashName = document.getElementById('dashboardFirstName');
        if (dashName) dashName.textContent = user.fname;

        // Profile Page
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            document.getElementById('profileNameTitle').textContent = `${user.fname} ${user.lname}`;
            document.getElementById('profileEmailSubtitle').innerHTML = `<i class="ph-bold ph-envelope-simple"></i> ${user.email}`;

            document.getElementById('profFirst').value = user.fname;
            document.getElementById('profLast').value = user.lname;

            const profEmail = document.getElementById('profEmail');
            if (profEmail) profEmail.value = user.email;
        }
    }

    // redirect unauthenticated users away from restricted pages
    const restrictedPages = ['dashboard.html', 'profile.html', 'search.html', 'doctor-details.html'];
    if (restrictedPages.some(page => window.location.pathname.endsWith(page)) && !isLoggedIn()) {
        window.location.href = 'login.html';
    }

    // 5. Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            if (submitBtn) {
                submitBtn.innerHTML = '<span class="loading" style="border-top-color: white;"></span> Authenticating...';
                submitBtn.style.opacity = '0.7';
                submitBtn.disabled = true;
            }
            // short delay to simulate server call
            setTimeout(() => {
                // Mock user data extraction based on email prefix if not already set
                const existingUser = getUserData();
                existingUser.email = emailInput;
                if (emailInput.includes('@')) {
                    const prefix = emailInput.split('@')[0];
                    if (!localStorage.getItem('medcareUser')) {
                        existingUser.fname = prefix.charAt(0).toUpperCase() + prefix.slice(1);
                        existingUser.lname = 'Patient';
                    }
                }
                setUserData(existingUser);
                setLoggedIn(true);
                window.location.href = 'dashboard.html';
            }, 1200);
        });
    }

    // 6. Handle Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fname = document.getElementById('fname').value;
            const lname = document.getElementById('lname').value;
            const email = document.getElementById('email').value;

            const submitBtn = signupForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<span class="loading" style="border-top-color: white;"></span> Creating Account...';
                submitBtn.style.opacity = '0.7';
                submitBtn.disabled = true;
            }

            setTimeout(() => {
                setUserData({ fname, lname, email });
                setLoggedIn(true);
                window.location.href = 'dashboard.html';
            }, 1500);
        });
    }

    // 7. Handle Profile Update
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = profileForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<span class="loading" style="border-top-color: white; width: 14px; height: 14px;"></span> Saving...';
            submitBtn.disabled = true;

            setTimeout(() => {
                const user = getUserData();
                user.fname = document.getElementById('profFirst').value;
                user.lname = document.getElementById('profLast').value;
                const profEmail = document.getElementById('profEmail');
                if (profEmail) user.email = profEmail.value;

                setUserData(user);
                populateUserData();
                updateNav();

                submitBtn.innerHTML = '<i class="ph-bold ph-check"></i> Saved successfully';
                submitBtn.classList.replace('btn-primary', 'btn-success');
                submitBtn.style.background = 'var(--secondary)';
                submitBtn.style.color = 'white';

                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.classList.replace('btn-success', 'btn-primary');
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 2000);
            }, 800);
        });
    }

    // 8. Handle Dedicated Logout Button (e.g. on Profile page)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const originalContent = logoutBtn.innerHTML;
            logoutBtn.innerHTML = '<span class="loading" style="border-top-color: var(--danger);"></span> Logging out...';
            logoutBtn.disabled = true;

            setTimeout(() => {
                setLoggedIn(false);
                document.body.classList.add('page-exit');
                setTimeout(() => window.location.href = 'index.html', 300);
            }, 800);
        });
    }

    // 9. Smooth Page Transitions (SPA-like feel)
    document.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            // ignore empty links, hashes, and blank targets
            if (!href || href.startsWith('#') || link.target === '_blank') return;
            // ignore logout link which is handled separately
            if (href === 'login.html' && isLoggedIn() && link.textContent === 'Logout') return;

            e.preventDefault();
            document.body.classList.add('page-exit');
            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });

    // 9. Dashboard Interactivity
    if (window.location.pathname.endsWith('dashboard.html')) {
        const DASHBOARD_STATE_KEY = 'medcareDashboardState';

        function getDashboardState() {
            const fallback = {
                waterIntake: 0,
                waterGoal: 8,
                meds: { morning: false, afternoon: false, night: false }
            };

            const data = localStorage.getItem(DASHBOARD_STATE_KEY);
            if (!data) return fallback;

            try {
                const parsed = JSON.parse(data);
                return {
                    waterIntake: Number.isFinite(parsed.waterIntake) ? parsed.waterIntake : fallback.waterIntake,
                    waterGoal: Number.isFinite(parsed.waterGoal) ? parsed.waterGoal : fallback.waterGoal,
                    meds: {
                        morning: Boolean(parsed?.meds?.morning),
                        afternoon: Boolean(parsed?.meds?.afternoon),
                        night: Boolean(parsed?.meds?.night)
                    }
                };
            } catch {
                return fallback;
            }
        }

        function setDashboardState(nextState) {
            localStorage.setItem(DASHBOARD_STATE_KEY, JSON.stringify(nextState));
        }

        function parseStatCount(id) {
            const node = document.getElementById(id);
            const current = parseInt(node?.textContent || '0', 10);
            return Number.isNaN(current) ? 0 : current;
        }

        function setStatCount(id, value) {
            const node = document.getElementById(id);
            if (node) node.textContent = String(Math.max(0, value));
        }

        function updateAppointmentsEmptyState() {
            const appointmentsSection = document.querySelector('.main-content section');
            if (!appointmentsSection) return;
            const appointmentCards = appointmentsSection.querySelectorAll('.list-card');
            const hasExistingEmpty = appointmentsSection.querySelector('[data-role="appointments-empty"]');
            if (appointmentCards.length === 0 && !hasExistingEmpty) {
                const empty = document.createElement('div');
                empty.className = 'list-card';
                empty.setAttribute('data-role', 'appointments-empty');
                empty.innerHTML = `
                    <div class="list-info">
                        <div class="avatar avatar-initials" style="background: var(--primary-light); color: var(--primary);">
                            <i class="ph-fill ph-calendar-plus"></i>
                        </div>
                        <div class="list-text">
                            <h4>No upcoming appointments</h4>
                            <p>Book a new visit to keep your care plan on track.</p>
                        </div>
                    </div>
                `;
                appointmentsSection.appendChild(empty);
            }
        }

        function hydrateHealthGoalWidgets() {
            const state = getDashboardState();
            const waterCountNode = document.getElementById('waterIntakeCount');
            const waterGoalNode = document.getElementById('waterIntakeGoal');

            if (waterCountNode) waterCountNode.textContent = String(state.waterIntake);
            if (waterGoalNode) waterGoalNode.textContent = String(state.waterGoal);

            document.querySelectorAll('.med-check').forEach(check => {
                const key = check.getAttribute('data-med');
                check.checked = Boolean(state.meds[key]);
            });
        }

        hydrateHealthGoalWidgets();
        updateAppointmentsEmptyState();

        const addWaterBtn = document.getElementById('addWaterBtn');
        if (addWaterBtn) {
            addWaterBtn.addEventListener('click', () => {
                const state = getDashboardState();
                if (state.waterIntake >= state.waterGoal) {
                    showToast('Water goal already completed for today.', 'warning');
                    return;
                }

                state.waterIntake += 1;
                setDashboardState(state);
                hydrateHealthGoalWidgets();

                if (state.waterIntake === state.waterGoal) {
                    showToast('Nice work! Daily hydration goal reached.', 'success');
                }
            });
        }

        const resetWaterBtn = document.getElementById('resetWaterBtn');
        if (resetWaterBtn) {
            resetWaterBtn.addEventListener('click', () => {
                const state = getDashboardState();
                state.waterIntake = 0;
                setDashboardState(state);
                hydrateHealthGoalWidgets();
                showToast('Water intake reset for today.', 'warning');
            });
        }

        document.querySelectorAll('.med-check').forEach(check => {
            check.addEventListener('change', () => {
                const state = getDashboardState();
                const key = check.getAttribute('data-med');
                state.meds[key] = check.checked;
                setDashboardState(state);

                const doneCount = Object.values(state.meds).filter(Boolean).length;
                if (doneCount === 3) {
                    showToast('Medication checklist complete.', 'success');
                }
            });
        });

        document.addEventListener('click', (e) => {
            const actionNode = e.target.closest('[data-action]');
            if (!actionNode) return;

            const action = actionNode.getAttribute('data-action');

            if (action === 'cancel-appointment') {
                const originalContent = actionNode.innerHTML;
                actionNode.innerHTML = '<span class="loading" style="border-top-color: var(--text-main);"></span> Canceling...';
                actionNode.disabled = true;

                setTimeout(() => {
                    const card = actionNode.closest('.list-card');
                    if (card) {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(-10px)';
                        setTimeout(() => {
                            card.remove();
                            setStatCount('statTotalAppts', parseStatCount('statTotalAppts') - 1);
                            setStatCount('statUpcomingAppts', parseStatCount('statUpcomingAppts') - 1);
                            updateAppointmentsEmptyState();
                            showToast('Appointment canceled successfully.', 'success');
                        }, 300);
                    } else {
                        actionNode.innerHTML = originalContent;
                        actionNode.disabled = false;
                    }
                }, 800);
            }

            if (action === 'join-call') {
                const originalContent = actionNode.innerHTML;
                actionNode.innerHTML = '<span class="loading" style="border-top-color: white;"></span> Connecting...';
                actionNode.disabled = true;
                setTimeout(() => {
                    actionNode.innerHTML = '<i class="ph-fill ph-video-camera"></i> In Call';
                    actionNode.style.background = '#10B981';
                    setTimeout(() => {
                        actionNode.innerHTML = originalContent;
                        actionNode.disabled = false;
                    }, 3000);
                }, 1000);
            }

            if (action === 'reschedule-appointment') {
                actionNode.innerHTML = '<i class="ph-bold ph-check"></i> Request Sent';
                actionNode.disabled = true;
                showToast('Reschedule request sent to clinic.', 'success');
            }

            if (action === 'download-lab') {
                const originalContent = actionNode.innerHTML;
                actionNode.innerHTML = '<span class="loading" style="border-top-color: white;"></span> Downloading...';
                actionNode.disabled = true;
                setTimeout(() => {
                    actionNode.innerHTML = '<i class="ph-bold ph-check"></i> Complete';
                    actionNode.style.background = 'var(--secondary)';
                    actionNode.style.color = 'white';
                    actionNode.style.borderColor = 'var(--secondary)';
                    setTimeout(() => {
                        actionNode.innerHTML = originalContent;
                        actionNode.style.background = '';
                        actionNode.style.color = '';
                        actionNode.style.borderColor = '';
                        actionNode.disabled = false;
                    }, 3000);
                }, 1500);
            }

            if (action === 'order-refill') {
                actionNode.innerHTML = '<span class="loading" style="border-top-color: var(--text-main);"></span> Processing...';
                actionNode.disabled = true;
                setTimeout(() => {
                    actionNode.innerHTML = '<i class="ph-bold ph-check"></i> Refill Ordered';
                    actionNode.style.color = 'var(--secondary-dark)';
                    actionNode.style.borderColor = 'var(--secondary-light)';
                    actionNode.style.background = 'var(--secondary-light)';
                }, 1000);
            }

            if (action === 'quick-support') {
                e.preventDefault();
                const titleNode = actionNode.querySelector('h4');
                const iconNode = actionNode.querySelector('.stat-icon');
                const originalTitle = titleNode?.innerHTML || 'Support';

                if (!titleNode || !iconNode) return;

                titleNode.innerHTML = '<span class="loading" style="border-top-color: var(--primary);"></span> Connecting to Support Agent...';
                actionNode.style.pointerEvents = 'none';

                setTimeout(() => {
                    titleNode.innerHTML = '<i class="ph-bold ph-check"></i> Connected! Check your popup blocker.';
                    iconNode.style.background = 'var(--secondary-light)';
                    iconNode.style.color = 'var(--secondary-dark)';

                    setTimeout(() => {
                        titleNode.innerHTML = originalTitle;
                        actionNode.style.pointerEvents = 'auto';
                        iconNode.style.background = '#DBEAFE';
                        iconNode.style.color = '#1D4ED8';
                    }, 4000);
                }, 1500);
            }
        });
    }

    // 10. Search Page Interactivity
    if (window.location.pathname.endsWith('search.html')) {
        const searchBtn = document.getElementById('mainSearchBtn');
        const searchInput = document.getElementById('searchInput');
        const locationSelect = document.getElementById('locationSelect');
        const resultsGrid = document.getElementById('searchResultsGrid');
        const resultsTitle = document.getElementById('resultsTitle');
        const resultsCount = document.getElementById('resultsCount');
        const filterBadges = document.querySelectorAll('.filter-badge');

        function simulateSearch(queryStr, locStr) {
            resultsGrid.style.opacity = '0';
            resultsGrid.style.transform = 'translateY(20px)';
            resultsGrid.style.transition = 'all 0.4s ease';

            setTimeout(() => {
                const query = (queryStr || '').toLowerCase();
                const cards = resultsGrid.querySelectorAll('.card');
                let matchCount = 0;

                cards.forEach(card => {
                    const text = card.textContent.toLowerCase();
                    if (text.includes(query)) {
                        card.style.display = 'block';
                        matchCount++;
                    } else {
                        card.style.display = 'none';
                    }
                });

                resultsTitle.innerHTML = `Search Results for "${queryStr || 'All Specialties'}"`;
                if (locStr) resultsTitle.innerHTML += ` in ${locStr.toUpperCase()}`;

                resultsCount.textContent = `Showing ${matchCount} result${matchCount !== 1 ? 's' : ''}`;

                resultsGrid.style.opacity = '1';
                resultsGrid.style.transform = 'translateY(0)';
            }, 800);
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', function (e) {
                e.preventDefault();
                const originalText = this.innerHTML;
                this.innerHTML = '<span class="loading" style="border-top-color: white;"></span> Searching';
                this.disabled = true;

                simulateSearch(searchInput.value, locationSelect.value);

                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 1000);
            });
        }

        filterBadges.forEach(badge => {
            badge.addEventListener('click', function () {
                // toggle active class
                filterBadges.forEach(b => {
                    b.style.background = 'rgba(255,255,255,0.2)';
                    b.style.color = 'white';
                });
                this.style.background = 'white';
                this.style.color = 'var(--primary)';

                const query = this.textContent;
                searchInput.value = query;
                if (searchBtn) searchBtn.click();
            });
        });

        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function () {
                const originalText = this.innerHTML;
                this.innerHTML = '<span class="loading" style="border-top-color: var(--primary);"></span> Loading...';
                this.disabled = true;

                setTimeout(() => {
                    // Duplicate child nodes to fake load more
                    const firstChild = resultsGrid.children[0].cloneNode(true);
                    resultsGrid.appendChild(firstChild);

                    this.innerHTML = originalText;
                    this.disabled = false;

                    const countSpan = document.getElementById('resultsCount');
                    const currentCount = parseInt(countSpan.textContent.replace(/[^0-9]/g, ''));
                    countSpan.textContent = `Showing ${currentCount + 1} results`;
                }, 1200);
            });
        }
    }

    // 11. Typing Animation for Hero H1
    const typingSpan = document.getElementById('typing-text');
    if (typingSpan) {
        const words = ["Healthcare", "Medical", "Wellness", "Specialist"];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 150;

        function type() {
            const currentWord = words[wordIndex];

            if (isDeleting) {
                typingSpan.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 100;
            } else {
                typingSpan.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 200;
            }

            if (!isDeleting && charIndex === currentWord.length) {
                isDeleting = true;
                typeSpeed = 2000; // Pause at end
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500;
            }

            setTimeout(type, typeSpeed);
        }

        setTimeout(type, 1000);
    }

    // run nav update each load
    updateNav();
    populateUserData();
});
