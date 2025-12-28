// 1. Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    
    // Animate Hamburger
    hamburger.children[0].classList.toggle('translate_down');
    hamburger.children[1].classList.toggle('fade_out');
    hamburger.children[2].classList.toggle('translate_up');
});


// 2. Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        // Close mobile menu if open
        navLinks.classList.remove('active');

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});


// 3. Scroll Reveal Animations
// Adds the 'active' class to elements with .reveal when they enter viewport
window.addEventListener('scroll', reveal);

function reveal() {
    var reveals = document.querySelectorAll('.reveal');

    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var revealTop = reveals[i].getBoundingClientRect().top;
        var revealPoint = 100; // Adjust to trigger earlier/later

        if (revealTop < windowHeight - revealPoint) {
            reveals[i].classList.add('active');
        }
        // Optional: Remove else block if you don't want them to fade out again
        // else {
        //     reveals[i].classList.remove('active');
        // }
    }
}
// Trigger once on load
reveal();


// 4. Stats Counter Animation
const counters = document.querySelectorAll('.counter');
const speed = 200; // Lower is faster

const animateCounters = () => {
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            
            // Calculate increment step based on target size to make speeds relative
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 20);
            } else {
                // Ensure final number is neat (e.g., 10000 instead of 10001)
                counter.innerText = target.toLocaleString(); 
                // Handle the "10K+" style for the first counter specifically if needed
                if(target === 10000) counter.innerText = "10K+";
                if(target === 50) counter.innerText = "50+";
                if(target === 247) counter.innerText = "24/7";
            }
        };
        updateCount();
    });
};

// Use Intersection Observer to start animation only when stats section is visible
const statsSection = document.querySelector('.stats-section');
const statsObserver = new IntersectionObserver((entries, observer) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(statsSection); // Run only once
    }
}, {
    root: null,
    threshold: 0.4 // Trigger when 40% of section is visible
});

if(statsSection) {
    statsObserver.observe(statsSection);
}

// Hero Sliding Images Functionality
document.addEventListener('DOMContentLoaded', function() {
    const heroSlides = document.querySelectorAll('.hero-slide');
    const heroDots = document.querySelectorAll('.hero-dot');
    const prevHeroBtn = document.getElementById('prev-hero-slide');
    const nextHeroBtn = document.getElementById('next-hero-slide');
    
    if (heroSlides.length > 0) {
        let currentHeroSlide = 0;
        let heroSlideInterval;

        function updateHeroSlide() {
            heroSlides.forEach(slide => {
                slide.classList.remove('active');
            });
            
            heroSlides[currentHeroSlide].classList.add('active');
            
            heroDots.forEach(dot => {
                dot.classList.remove('active');
            });
            heroDots[currentHeroSlide].classList.add('active');
        }

        function nextHeroSlide() {
            currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
            updateHeroSlide();
        }

        function prevHeroSlide() {
            currentHeroSlide = (currentHeroSlide - 1 + heroSlides.length) % heroSlides.length;
            updateHeroSlide();
        }

        function startHeroSlideshow() {
            clearInterval(heroSlideInterval);
            heroSlideInterval = setInterval(nextHeroSlide, 5000);
        }

        // Initialize
        updateHeroSlide();
        startHeroSlideshow();

        // Event listeners
        if (nextHeroBtn) {
            nextHeroBtn.addEventListener('click', () => {
                nextHeroSlide();
                startHeroSlideshow();
            });
        }

        if (prevHeroBtn) {
            prevHeroBtn.addEventListener('click', () => {
                prevHeroSlide();
                startHeroSlideshow();
            });
        }

        heroDots.forEach(dot => {
            dot.addEventListener('click', function() {
                currentHeroSlide = parseInt(this.getAttribute('data-slide'));
                updateHeroSlide();
                startHeroSlideshow();
            });
        });

        // Pause on hover
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => {
                clearInterval(heroSlideInterval);
            });

            heroSection.addEventListener('mouseleave', () => {
                startHeroSlideshow();
            });
        }
    }
});
