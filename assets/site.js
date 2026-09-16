(() => {
    'use strict';
    const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
    const root = document.documentElement, mq = matchMedia('(prefers-reduced-motion: reduce)');
    let setting = null, reduced = mq.matches, timer = null, word = 0, letter = 0, erasing = false;
    const roles = ['full stack development', 'application support', 'CRM integrations'];
    try { setting = localStorage.getItem('jitha-gold-motion'); if (setting !== null) reduced = setting === 'off'; } catch (_) { }
    function type() {
        if (reduced || document.hidden) return;
        const text = roles[word]; letter += erasing ? -1 : 1; $('#typed-role').textContent = text.slice(0, letter);
        let delay = erasing ? 35 : 65;
        if (letter === text.length) { erasing = true; delay = 2300; } else if (letter === 0 && erasing) { erasing = false; word = (word + 1) % roles.length; delay = 250; }
        timer = setTimeout(type, delay);
    }
    function motion() {
        clearTimeout(timer); if (reduced) document.getAnimations().forEach(a => a.cancel()); root.classList.toggle('reduced-motion', reduced); const motionToggle = $('.motion'); if (motionToggle) { motionToggle.setAttribute('aria-pressed', String(reduced)); motionToggle.setAttribute('aria-label', reduced ? 'Enable motion' : 'Reduce motion'); motionToggle.querySelector('span')?.replaceChildren(reduced ? 'off' : 'on'); }
        word = 0; letter = roles[0].length; erasing = true; $('#typed-role').textContent = roles[0]; if (!reduced) timer = setTimeout(type, 2500);
    }
    // $('.motion').addEventListener('click', () => { reduced = !reduced; setting = reduced ? 'off' : 'on'; try { localStorage.setItem('jitha-gold-motion', setting); } catch (_) { } motion(); schedule(); });
    mq.addEventListener('change', () => { if (setting === null) { reduced = mq.matches; motion(); schedule(); } });
    document.addEventListener('visibilitychange', () => { clearTimeout(timer); if (!document.hidden && !reduced) timer = setTimeout(type, 500); });
    const menu = $('.menu-toggle'), nav = $('#navigation');
    function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation'); }
    menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
    $$('#navigation a').forEach(a => a.addEventListener('click', closeMenu)); document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    let pending = false;
    function draw() { pending = false; const portrait = $('.hero-portrait'); const rect = portrait.getBoundingClientRect(); const progress = Math.max(0, Math.min(1, scrollY / Math.max(1, rect.height * .65))); portrait.style.setProperty('--portrait-gray', reduced ? 0 : 1 - progress); const max = root.scrollHeight - innerHeight; $('.reading').style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`; let active = 'home'; for (const id of ['home', 'about', 'expertise', 'experience', 'work', 'contact']) if ($('#' + id).getBoundingClientRect().top < innerHeight * .4) active = id; $$('#navigation a').forEach(a => { const selected = a.hash === '#' + active; a.classList.toggle('active', selected); if (selected) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); }); }
    function schedule() { if (!pending) { pending = true; requestAnimationFrame(draw); } }
    addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', schedule);
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { if (!reduced && e.target.animate) e.target.animate([{ opacity: 0, transform: 'translateY(25px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 650, easing: 'cubic-bezier(.2,.65,.3,1)' }); observer.unobserve(e.target); } }), { threshold: .1 }); $$('.reveal').forEach(el => observer.observe(el));
    }
    $$('[data-case]').forEach(b => b.addEventListener('click', event => {
        event.preventDefault();
        const project = portfolioData.projects[b.dataset.case];
        if (project?.link) window.location.assign(project.link);
    }));
    // Keep native disclosures usable without scripts; only one career entry expands at a time.
    $$('.career').forEach(d => d.addEventListener('toggle', () => { if (d.open) $$('.career').forEach(other => { if (other !== d) other.open = false; }); }));
    motion(); draw();
})();


