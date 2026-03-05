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

// Global Custom Confirm Modal Function
window.customConfirm = function (options = {}) {
    return new Promise((resolve) => {
        const {
            title = 'Are you sure?',
            message = 'This action cannot be undone.',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            type = 'warning' // warning, danger, info
        } = options;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        let icon = 'ph-fill ph-warning-circle';
        let iconClass = 'modal-icon-warning';
        let btnClass = 'modal-btn-confirm';

        if (type === 'danger') {
            icon = 'ph-fill ph-trash';
            iconClass = 'modal-icon-danger';
            btnClass = 'modal-btn-danger';
        } else if (type === 'info') {
            icon = 'ph-fill ph-info';
            iconClass = 'modal-icon-info';
        }

        overlay.innerHTML = `
            <div class="modal-container">
                <div class="modal-icon ${iconClass}">
                    <i class="${icon}"></i>
                </div>
                <h3 class="modal-title">${title}</h3>
                <p class="modal-message">${message}</p>
                <div class="modal-actions">
                    <button class="modal-btn modal-btn-cancel">${cancelText}</button>
                    <button class="modal-btn ${btnClass}">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Trigger animation
        setTimeout(() => overlay.classList.add('show'), 10);

        const close = (result) => {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.remove();
                resolve(result);
            }, 400);
        };

        const cancelBtn = overlay.querySelector('.modal-btn-cancel');
        const confirmBtn = overlay.querySelector(`.${btnClass}`);

        cancelBtn.addEventListener('click', () => close(false));
        confirmBtn.addEventListener('click', () => close(true));

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                const container = overlay.querySelector('.modal-container');
                container.classList.add('pulse');
                setTimeout(() => container.classList.remove('pulse'), 400);
            }
        });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // Route guard for unknown local .html paths
    const knownPages = new Set([
        '',
        'index.html',
        '404.html',
        'dashboard.html',
        'doctor-dashboard.html',
        'doctor-details.html',
        'figma.html',
        'login.html',
        'profile.html',
        'records.html',
        'search.html',
        'signup.html'
    ]);
    const currentPath = window.location.pathname || '';
    const currentFile = currentPath.split('/').pop() || '';
    if (currentFile && !knownPages.has(currentFile)) {
        const target = `404.html?from=${encodeURIComponent(currentPath)}`;
        window.location.replace(target);
        return;
    }

    // redirect from login page if already authenticated
    if (window.location.pathname.endsWith('login.html') && localStorage.getItem('medcareLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
        return; // don't execute further scripts
    }

    // 404 page helpers
    if (window.location.pathname.endsWith('404.html')) {
        const missingPathText = document.getElementById('missingPathText');
        const goBackBtn = document.getElementById('goBack404Btn');
        const params = new URLSearchParams(window.location.search);
        const fromPath = params.get('from');

        if (missingPathText && fromPath) {
            missingPathText.textContent = `Requested path: ${decodeURIComponent(fromPath)}`;
        }

        if (goBackBtn) {
            goBackBtn.addEventListener('click', () => {
                if (window.history.length > 1) window.history.back();
                else window.location.href = 'index.html';
            });
        }
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

    // 0a. Scroll progress indicator
    let progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);
    }

    const updateScrollProgress = () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
        progressBar.style.width = `${Math.min(100, Math.max(0, ratio))}%`;
    };
    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress();

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
    animatedElements.forEach((el, index) => {
        el.style.transitionDelay = `${Math.min(index * 0.03, 0.18)}s`;
    });

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

    // 3b. Mobile nav toggle
    function initMobileNavToggle() {
        const content = document.querySelector('.header-content');
        const nav = content?.querySelector('nav');
        if (!content || !nav) return;

        let toggleBtn = content.querySelector('.nav-toggle');
        if (!toggleBtn) {
            toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'nav-toggle';
            toggleBtn.setAttribute('aria-label', 'Toggle navigation menu');
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.innerHTML = '<i class="ph-bold ph-list"></i>';
            content.insertBefore(toggleBtn, content.querySelector('.header-actions') || null);
        }

        const closeNav = () => {
            nav.classList.remove('is-open');
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.innerHTML = '<i class="ph-bold ph-list"></i>';
        };

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const open = nav.classList.toggle('is-open');
            toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggleBtn.innerHTML = open ? '<i class="ph-bold ph-x"></i>' : '<i class="ph-bold ph-list"></i>';
        });

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) closeNav();
            });
        });

        document.addEventListener('click', (e) => {
            if (!content.contains(e.target)) closeNav();
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) closeNav();
        });
    }
    initMobileNavToggle();

    // 4. UX Enhancements: smooth section scroll, form validation, password strength
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            const headerOffset = document.querySelector('header')?.offsetHeight || 0;
            const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset - 10;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    // 0d. Hero parallax polish
    const hero = document.querySelector('.hero');
    const heroImageWrapper = document.querySelector('.hero-image-wrapper');
    const floatingCard = document.querySelector('.floating-card');
    if (hero && heroImageWrapper) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const px = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            const py = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

            heroImageWrapper.style.transform = `translate(${px * 10}px, ${py * 8}px)`;
            if (floatingCard) {
                floatingCard.style.transform = `translate(${px * -6}px, ${py * -4}px)`;
            }
        });

        hero.addEventListener('mouseleave', () => {
            heroImageWrapper.style.transform = '';
            if (floatingCard) floatingCard.style.transform = '';
        });
    }

    function ensureFeedbackNode(input) {
        if (!input || input.type === 'checkbox' || input.type === 'hidden') return null;
        let node = input.parentElement?.querySelector(`.input-feedback[data-for="${input.id}"]`);
        if (!node) {
            node = document.createElement('div');
            node.className = 'input-feedback';
            if (input.id) node.setAttribute('data-for', input.id);
            input.insertAdjacentElement('afterend', node);
        }
        return node;
    }

    function setFieldFeedback(input, valid, message = '') {
        if (!input || input.type === 'checkbox' || input.type === 'hidden') return;
        const feedbackNode = ensureFeedbackNode(input);

        // Suppress text feedback for login form to keep it minimalist as per user request
        const isLoginForm = input.closest('#loginForm');
        const displayMessage = isLoginForm ? '' : message;

        input.classList.toggle('input-invalid', !valid);
        input.classList.toggle('input-valid', valid && input.value.trim().length > 0);

        if (!feedbackNode) return;
        feedbackNode.textContent = displayMessage;
        feedbackNode.classList.remove('error', 'success');
        if (displayMessage) feedbackNode.classList.add(valid ? 'success' : 'error');
    }

    function validateField(input) {
        if (!input || input.disabled || input.type === 'hidden') return { valid: true, message: '' };
        if (input.type === 'checkbox') {
            if (input.required && !input.checked) return { valid: false, message: 'This field is required.' };
            return { valid: true, message: '' };
        }

        const rawValue = input.value || '';
        const value = rawValue.trim();
        const label = input.getAttribute('aria-label') || input.name || input.id || 'This field';

        if (input.required && value.length === 0) {
            return { valid: false, message: `${label} is required.` };
        }

        if (value.length === 0) return { valid: true, message: '' };

        if (input.type === 'email') {
            const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            return emailOk ? { valid: true, message: 'Looks good.' } : { valid: false, message: 'Enter a valid email address.' };
        }

        if (input.type === 'password') {
            const hasLower = /[a-z]/.test(value);
            const hasUpper = /[A-Z]/.test(value);
            const hasDigit = /\d/.test(value);
            const minLen = value.length >= 8;
            const passOk = hasLower && hasUpper && hasDigit && minLen;
            return passOk
                ? { valid: true, message: 'Strong enough.' }
                : { valid: false, message: 'Use 8+ chars with upper, lower, and number.' };
        }

        const looksLikeName = ['fname', 'lname', 'profFirst', 'profLast'].includes(input.id);
        if (looksLikeName && value.length < 2) {
            return { valid: false, message: 'Please enter at least 2 characters.' };
        }

        return { valid: true, message: '' };
    }

    function validateFormWithInlineFeedback(form) {
        if (!form) return true;
        const fields = Array.from(form.querySelectorAll('input, select, textarea'));
        let firstInvalid = null;
        let valid = true;

        fields.forEach(field => {
            const result = validateField(field);
            setFieldFeedback(field, result.valid, result.message);
            if (!result.valid && !firstInvalid) firstInvalid = field;
            if (!result.valid) valid = false;
        });

        if (!valid && firstInvalid && typeof firstInvalid.focus === 'function') firstInvalid.focus();
        return valid;
    }

    function initInlineValidationForForm(form) {
        if (!form) return;
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            if (field.type === 'checkbox' || field.type === 'hidden') return;
            ensureFeedbackNode(field);
            field.addEventListener('blur', () => {
                const result = validateField(field);
                setFieldFeedback(field, result.valid, result.message);
            });
            field.addEventListener('input', () => {
                const result = validateField(field);
                if (field.classList.contains('input-invalid') || field.classList.contains('input-valid')) {
                    setFieldFeedback(field, result.valid, result.message);
                }
            });
        });
    }

    function scorePassword(password) {
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return Math.min(score, 5);
    }

    function initPasswordStrengthMeter(passwordInput) {
        if (!passwordInput || passwordInput.dataset.strengthReady === 'true') return;
        passwordInput.dataset.strengthReady = 'true';

        const wrapper = document.createElement('div');
        wrapper.className = 'password-strength';
        wrapper.innerHTML = `
            <div class="password-strength-track">
                <div class="password-strength-bar"></div>
            </div>
            <div class="password-strength-label">Strength: Empty</div>
        `;
        passwordInput.insertAdjacentElement('afterend', wrapper);

        const bar = wrapper.querySelector('.password-strength-bar');
        const label = wrapper.querySelector('.password-strength-label');
        const strengthMeta = [
            { text: 'Very Weak', color: '#EF4444', width: 20 },
            { text: 'Weak', color: '#F97316', width: 35 },
            { text: 'Fair', color: '#F59E0B', width: 55 },
            { text: 'Good', color: '#22C55E', width: 75 },
            { text: 'Strong', color: '#10B981', width: 100 }
        ];

        const render = () => {
            const value = passwordInput.value || '';
            if (!value) {
                bar.style.width = '0%';
                bar.style.backgroundColor = '#CBD5E1';
                label.textContent = 'Strength: Empty';
                return;
            }

            const score = scorePassword(value);
            const index = Math.max(0, score - 1);
            const meta = strengthMeta[index];
            bar.style.width = `${meta.width}%`;
            bar.style.backgroundColor = meta.color;
            label.textContent = `Strength: ${meta.text}`;
        };

        passwordInput.addEventListener('input', render);
        render();
    }

    document.querySelectorAll('#signupForm, #loginForm, #profileForm').forEach(form => {
        initInlineValidationForForm(form);
    });
    document.querySelectorAll('#signupForm input[type="password"]').forEach(input => {
        initPasswordStrengthMeter(input);
    });

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
            if (href === 'dashboard.html' || href === 'doctor-dashboard.html' || href === 'profile.html' || href === 'search.html') {
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
                            <div class="avatar avatar-initials" style="width: 40px; height: 40px; border: 2px solid var(--primary);">JD</div>
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
    const restrictedPages = ['dashboard.html', 'doctor-dashboard.html', 'profile.html', 'search.html', 'doctor-details.html'];
    if (restrictedPages.some(page => window.location.pathname.endsWith(page)) && !isLoggedIn()) {
        window.location.href = 'login.html';
    }

    // 5. Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!validateFormWithInlineFeedback(loginForm)) {
                showToast('Please fix the highlighted fields.', 'error');
                return;
            }
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
            if (!validateFormWithInlineFeedback(signupForm)) {
                showToast('Please fix the highlighted fields.', 'error');
                return;
            }
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
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!validateFormWithInlineFeedback(profileForm)) {
                showToast('Please correct invalid profile fields.', 'error');
                return;
            }
            const confirmed = await window.customConfirm({
                title: 'Save Changes?',
                message: 'Are you sure you want to update your profile details?',
                confirmText: 'Save Profile',
                type: 'info'
            });
            if (!confirmed) return;
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

    function initFabMenu() {
        if (document.querySelector('.fab-menu')) return;
        const fab = document.createElement('div');
        fab.className = 'fab-menu';
        fab.innerHTML = `
            <div class="fab-items">
                <button class="fab-item" data-fab-action="book">Book Visit</button>
                <button class="fab-item" data-fab-action="profile">Profile</button>
                <button class="fab-item" data-fab-action="support">Support</button>
                <button class="fab-item" data-fab-action="top">Top</button>
            </div>
            <button class="fab-main" type="button" aria-label="Quick actions">+</button>
        `;
        document.body.appendChild(fab);

        const mainButton = fab.querySelector('.fab-main');
        mainButton?.addEventListener('click', () => {
            fab.classList.toggle('is-open');
        });

        fab.addEventListener('click', (e) => {
            const actionNode = e.target.closest('[data-fab-action]');
            if (!actionNode) return;
            const action = actionNode.getAttribute('data-fab-action');
            if (action === 'book') {
                document.body.classList.add('page-exit');
                setTimeout(() => { window.location.href = 'search.html'; }, 250);
            }
            if (action === 'profile') {
                document.body.classList.add('page-exit');
                setTimeout(() => { window.location.href = 'profile.html'; }, 250);
            }
            if (action === 'support') {
                showToast('Support is on standby. We will connect shortly.', 'success');
            }
            if (action === 'top') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            fab.classList.remove('is-open');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.fab-menu')) fab.classList.remove('is-open');
        });
    }

    // 9. Dashboard Interactivity
    if (window.location.pathname.endsWith('dashboard.html')) {
        const DASHBOARD_STATE_KEY = 'medcareDashboardState';
        const DASHBOARD_RATING_KEY = 'medcareDashboardRating';

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
            const appointmentsSection = document.getElementById('panel-upcoming');
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

        function updateCareJourneyProgress() {
            const fillNode = document.getElementById('careStepProgressFill');
            const textNode = document.getElementById('careStepProgressText');
            const stepNodes = document.querySelectorAll('.step-item');
            if (!fillNode || !textNode || stepNodes.length === 0) return;

            const state = getDashboardState();
            const appointmentCount = document.querySelectorAll('#panel-upcoming .list-card:not([data-role="appointments-empty"])').length;
            const hydrationDone = state.waterIntake >= state.waterGoal;
            const medsDone = Object.values(state.meds).every(Boolean);

            const stepState = {
                profile: true,
                appointment: appointmentCount > 0,
                hydration: hydrationDone,
                medication: medsDone
            };

            let completed = 0;
            stepNodes.forEach(node => {
                const key = node.getAttribute('data-step');
                const isComplete = Boolean(stepState[key]);
                node.classList.toggle('is-complete', isComplete);
                if (isComplete) completed += 1;
            });

            fillNode.style.width = `${(completed / 4) * 100}%`;
            textNode.textContent = `Step ${completed} of 4 completed`;
        }

        function initDashboardTabs() {
            const tabButtons = document.querySelectorAll('.tab-btn[data-tab-target]');
            const panels = document.querySelectorAll('.tab-panel[data-tab-panel]');
            if (tabButtons.length === 0 || panels.length === 0) return;

            const showPanel = (target) => {
                tabButtons.forEach(btn => {
                    const active = btn.getAttribute('data-tab-target') === target;
                    btn.classList.toggle('is-active', active);
                    btn.setAttribute('aria-selected', active ? 'true' : 'false');
                });
                panels.forEach(panel => {
                    panel.classList.toggle('is-active', panel.getAttribute('data-tab-panel') === target);
                });
            };

            tabButtons.forEach(btn => {
                btn.addEventListener('click', () => showPanel(btn.getAttribute('data-tab-target')));
            });
        }

        function initInteractiveChart() {
            const chartNode = document.getElementById('visitsChart');
            const metaNode = document.getElementById('visitsChartMeta');
            const rangeButtons = document.querySelectorAll('.chart-range-btn');
            if (!chartNode || !metaNode || rangeButtons.length === 0) return;

            const dataSets = {
                '7d': {
                    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                    values: [4, 6, 5, 8, 7, 9, 6]
                },
                '30d': {
                    labels: ['W1', 'W2', 'W3', 'W4'],
                    values: [28, 33, 30, 36]
                }
            };

            const render = (range) => {
                const selected = dataSets[range] || dataSets['7d'];
                const max = Math.max(...selected.values, 1);
                chartNode.innerHTML = '';

                selected.values.forEach((value, index) => {
                    const bar = document.createElement('button');
                    bar.type = 'button';
                    bar.className = 'mini-chart-bar';
                    bar.style.height = `${(value / max) * 100}%`;
                    bar.setAttribute('data-label', selected.labels[index]);
                    bar.setAttribute('aria-label', `${selected.labels[index]} value ${value}`);
                    bar.addEventListener('click', () => {
                        chartNode.querySelectorAll('.mini-chart-bar').forEach(n => n.classList.remove('is-selected'));
                        bar.classList.add('is-selected');
                        metaNode.textContent = `${selected.labels[index]}: ${value} wellness actions completed.`;
                    });
                    chartNode.appendChild(bar);
                });

                const first = chartNode.querySelector('.mini-chart-bar');
                if (first) first.click();
            };

            rangeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    rangeButtons.forEach(b => b.classList.remove('is-active'));
                    btn.classList.add('is-active');
                    render(btn.getAttribute('data-range') || '7d');
                });
            });

            render('7d');
        }

        function initRatingSystem() {
            const stars = document.querySelectorAll('.rating-star');
            const statusNode = document.getElementById('ratingStatus');
            if (stars.length === 0 || !statusNode) return;

            const setRating = (value) => {
                stars.forEach(star => {
                    const starValue = Number(star.getAttribute('data-rating-value') || 0);
                    star.classList.toggle('is-active', starValue <= value);
                });
                if (value > 0) {
                    statusNode.textContent = `You rated ${value}/5. Thanks for your feedback.`;
                } else {
                    statusNode.textContent = 'No rating submitted yet.';
                }
            };

            const saved = Number(localStorage.getItem(DASHBOARD_RATING_KEY) || 0);
            if (saved > 0) setRating(saved);

            stars.forEach(star => {
                star.addEventListener('click', () => {
                    const value = Number(star.getAttribute('data-rating-value') || 0);
                    localStorage.setItem(DASHBOARD_RATING_KEY, String(value));
                    setRating(value);
                    showToast('Rating saved. Thank you!', 'success');
                });
            });
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

        initDashboardTabs();
        initInteractiveChart();
        initRatingSystem();
        hydrateHealthGoalWidgets();
        updateAppointmentsEmptyState();
        updateCareJourneyProgress();

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
                updateCareJourneyProgress();

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
                updateCareJourneyProgress();
                showToast('Water intake reset for today.', 'warning');
            });
        }

        document.querySelectorAll('.med-check').forEach(check => {
            check.addEventListener('change', () => {
                const state = getDashboardState();
                const key = check.getAttribute('data-med');
                state.meds[key] = check.checked;
                setDashboardState(state);
                updateCareJourneyProgress();

                const doneCount = Object.values(state.meds).filter(Boolean).length;
                if (doneCount === 3) {
                    showToast('Medication checklist complete.', 'success');
                }
            });
        });

        document.addEventListener('click', async (e) => {
            const actionNode = e.target.closest('[data-action]');
            if (!actionNode) return;

            const action = actionNode.getAttribute('data-action');

            if (action === 'cancel-appointment') {
                const confirmed = await window.customConfirm({
                    title: 'Cancel Appointment?',
                    message: 'Are you sure? This appointment will be removed from your records.',
                    confirmText: 'Cancel Appointment',
                    type: 'danger'
                });
                if (!confirmed) return;

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
                            updateCareJourneyProgress();
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
                const confirmed = await window.customConfirm({
                    title: 'Reschedule Request',
                    message: 'Send an update request to your provider for this appointment?',
                    confirmText: 'Send Request',
                    type: 'info'
                });
                if (!confirmed) return;

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
        const cardMatchesFilters = (card, query, locStr) => {
            const text = card.textContent.toLowerCase();
            const cardLocation = (card.getAttribute('data-location') || '').toLowerCase();
            const queryMatches = !query || text.includes(query);
            const locationMatches = !locStr || cardLocation === locStr.toLowerCase();
            return queryMatches && locationMatches;
        };

        function simulateSearch(queryStr, locStr) {
            resultsGrid.style.opacity = '0';
            resultsGrid.style.transform = 'translateY(20px)';
            resultsGrid.style.transition = 'all 0.4s ease';

            setTimeout(() => {
                const query = (queryStr || '').toLowerCase();
                const cards = resultsGrid.querySelectorAll('.card');
                let matchCount = 0;

                cards.forEach(card => {
                    if (cardMatchesFilters(card, query, locStr)) {
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

        function liveFilterResults(queryStr, locStr) {
            const query = (queryStr || '').toLowerCase();
            const cards = resultsGrid.querySelectorAll('.card');
            let matchCount = 0;

            cards.forEach(card => {
                if (cardMatchesFilters(card, query, locStr)) {
                    card.style.display = 'block';
                    matchCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            resultsTitle.innerHTML = `Search Results for "${queryStr || 'All Specialties'}"`;
            if (locStr) resultsTitle.innerHTML += ` in ${locStr.toUpperCase()}`;
            resultsCount.textContent = `Showing ${matchCount} result${matchCount !== 1 ? 's' : ''}`;
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

        if (searchInput) {
            let liveFilterTimer = null;
            searchInput.addEventListener('input', () => {
                if (liveFilterTimer) clearTimeout(liveFilterTimer);
                liveFilterTimer = setTimeout(() => {
                    liveFilterResults(searchInput.value, locationSelect?.value || '');
                }, 150);
            });
        }

        if (locationSelect) {
            locationSelect.addEventListener('change', () => {
                liveFilterResults(searchInput?.value || '', locationSelect.value);
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

    // 10b. Doctor Dashboard Interactivity
    if (window.location.pathname.endsWith('doctor-dashboard.html')) {
        const patientSearch = document.getElementById('doctorPatientSearch');
        const patientRows = document.querySelectorAll('#doctorPatientsTable [data-patient-row]');
        const availabilityBtn = document.getElementById('doctorAvailabilityBtn');
        const pendingRxCountNode = document.getElementById('doctorPendingRxCount');

        if (patientSearch) {
            patientSearch.addEventListener('input', () => {
                const query = patientSearch.value.trim().toLowerCase();
                patientRows.forEach(row => {
                    const rowText = row.textContent.toLowerCase();
                    row.style.display = !query || rowText.includes(query) ? '' : 'none';
                });
            });
        }

        if (availabilityBtn) {
            availabilityBtn.addEventListener('click', () => {
                const isOn = availabilityBtn.textContent.trim().toUpperCase() === 'ON';
                availabilityBtn.textContent = isOn ? 'OFF' : 'ON';
                availabilityBtn.style.background = isOn ? '#64748B' : '';
                showToast(`Availability turned ${isOn ? 'OFF' : 'ON'}.`, 'success');
            });
        }

        document.addEventListener('click', async (e) => {
            const actionNode = e.target.closest('[data-action]');
            if (!actionNode) return;
            const action = actionNode.getAttribute('data-action');

            if (action === 'start-doctor-call') {
                const original = actionNode.innerHTML;
                actionNode.innerHTML = '<span class="loading" style="border-top-color: white;"></span> Connecting...';
                actionNode.disabled = true;
                setTimeout(() => {
                    actionNode.innerHTML = '<i class="ph-fill ph-video-camera"></i> In Call';
                    actionNode.style.background = '#10B981';
                    setTimeout(() => {
                        actionNode.innerHTML = original;
                        actionNode.disabled = false;
                        actionNode.style.background = '';
                    }, 2500);
                }, 900);
            }

            if (action === 'doctor-approve-rx') {
                const confirmed = await window.customConfirm({
                    title: 'Approve Prescription?',
                    message: 'This action will authorize the medication for the patient.',
                    confirmText: 'Approve Now',
                    type: 'info'
                });
                if (!confirmed) return;

                actionNode.innerHTML = '<i class="ph-bold ph-check"></i> Approved';
                actionNode.disabled = true;
                actionNode.style.background = 'var(--secondary-light)';
                actionNode.style.color = 'var(--secondary-dark)';
                actionNode.style.borderColor = 'var(--secondary-light)';

                const current = parseInt(pendingRxCountNode?.textContent || '0', 10);
                if (pendingRxCountNode && Number.isFinite(current) && current > 0) {
                    pendingRxCountNode.textContent = String(current - 1);
                }
            }

            if (action === 'open-patient-record') {
                showToast('Opening patient record summary...', 'success');
            }

            if (action === 'doctor-new-slot') {
                showToast('New consultation slot added to your schedule.', 'success');
            }
        });
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
    initFabMenu();
    updateNav();
    populateUserData();
});
