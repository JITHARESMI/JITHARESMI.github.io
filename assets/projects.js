(() => {
    const root = document.querySelector('.jrr-coverflow');
    if (!root) return;
    const stage = root.querySelector('.jrr-stage');
    const cards = [...stage.querySelectorAll('.project-card')];
    if (cards.length < 2) return;
    const controls = root.querySelector('.jrr-controls');
    const toggle = root.querySelector('.jrr-toggle');
    const dots = cards.map((card, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'jrr-dot';
        dot.setAttribute('aria-label', `Show ${card.querySelector('h3').textContent}`);
        dot.setAttribute('aria-controls', 'jrr-stage');
        dot.addEventListener('click', () => { active = index; render(); });
        root.querySelector('.jrr-dots').append(dot);
        return dot;
    });
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let active = 0, hover = false, visible = false, timer;
    const motionOff = () => reduced.matches || document.documentElement.classList.contains('reduced-motion');
    cards.forEach(card => card.addEventListener('click', event => {
        if (event.target.closest('button, a')) return;
        card.querySelector('.project-open')?.click();
    }));
    function schedule() {
        clearTimeout(timer);
        if (motionOff() || hover || !visible || document.hidden || root.contains(document.activeElement) || document.querySelector('dialog[open]')) return;
        timer = setTimeout(() => go(1), 2000);
    }
    function render() {
        cards.forEach((card, i) => {
            const offset = (i - active + cards.length) % cards.length;
            const position = offset === 0 ? '0' : offset === 1 ? '1' : offset === cards.length - 1 ? '-1' : 'hidden';
            card.dataset.position = position;
            card.inert = i !== active;
            card.setAttribute('aria-hidden', String(i !== active));
            card.setAttribute('aria-label', `${i + 1} of ${cards.length} — ${card.querySelector('h3').textContent}`);
        });
        dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === active)));
        stage.style.height = `${Math.max(...cards.map(card => card.offsetHeight)) + 76}px`;
        schedule();
    }
    function go(step) { active = (active + step + cards.length) % cards.length; render(); }
    root.classList.add('jrr-ready');
    controls.hidden = false;
    root.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        // Keep keyboard focus on a stable control when the active card changes.
        dots[(active + (event.key === 'ArrowLeft' ? -1 : 1) + cards.length) % cards.length].focus();
        go(event.key === 'ArrowLeft' ? -1 : 1);
    });
    root.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hover = true; schedule(); } });
    root.addEventListener('pointerleave', () => { hover = false; schedule(); });
    root.addEventListener('focusin', schedule);
    root.addEventListener('focusout', () => setTimeout(schedule, 0));
    let start;
    stage.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse' || event.target.closest('button,a')) return;
        start = { x: event.clientX, y: event.clientY };
    });
    stage.addEventListener('pointerup', event => {
        if (!start) return;
        const dx = event.clientX - start.x, dy = event.clientY - start.y;
        start = null;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    });
    stage.addEventListener('pointercancel', () => { start = null; });
    document.addEventListener('visibilitychange', schedule);
    reduced.addEventListener('change', schedule);
    new MutationObserver(schedule).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    document.querySelectorAll('dialog').forEach(dialog => new MutationObserver(schedule).observe(dialog, { attributes: true, attributeFilter: ['open'] }));
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, { threshold: .3 }).observe(stage);
    else visible = true;
    function updateStageHeight() {
        stage.style.height =
            `${Math.max(...cards.map(card => card.offsetHeight)) + 76}px`;
    }

    if ('ResizeObserver' in window) {
        const sizeObserver = new ResizeObserver(updateStageHeight);
        cards.forEach(card => sizeObserver.observe(card));
    }

    window.addEventListener('resize', updateStageHeight);

    cards.forEach(card => {
        card.querySelector('img')?.addEventListener('load', updateStageHeight);
    });

    if (document.fonts) {
        document.fonts.ready.then(updateStageHeight);
    }
    render();
})();