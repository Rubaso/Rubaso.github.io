---
layout: default
title: Rubaso — proyectos y experimentos
---

<link rel="stylesheet" href="{{ "assets/style.css" | relative_url }}">

<div class="portfolio-shell">
  <header class="site-header">
    <a class="brand" href="{{ "/" | relative_url }}" aria-label="Volver al inicio">
      <span class="brand-mark" aria-hidden="true">R</span>
      <span>rubaso<span class="brand-dot">.</span>dev</span>
    </a>
    <nav class="site-nav" aria-label="Navegación principal">
      <a href="#proyectos">Proyectos</a>
      <a href="#sobre-mi">Sobre mí</a>
      <a class="nav-github" href="https://github.com/Rubaso" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
    </nav>
  </header>

  <main>
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow"><span class="status-dot" aria-hidden="true"></span> Construyendo cosas en internet</p>
        <h1 id="hero-title">Ideas pequeñas.<br><em>Experiencias útiles.</em></h1>
        <p class="hero-intro">Soy Rubaso. Este es mi rincón para compartir proyectos, experimentos y herramientas que voy creando mientras aprendo.</p>
        <div class="hero-actions">
          <a class="button button-primary" href="#proyectos">Ver proyectos <span aria-hidden="true">↓</span></a>
          <a class="button button-ghost" href="https://github.com/Rubaso" target="_blank" rel="noreferrer">Visitar GitHub <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="orb orb-large"></div>
        <div class="orb orb-small"></div>
        <div class="code-card">
          <span class="code-line code-muted">&lt;creative</span>
          <span class="code-line code-accent">mind<span class="code-muted"> /&gt;</span></span>
          <span class="code-cursor"></span>
        </div>
        <span class="floating-label label-top">01 / portfolio</span>
        <span class="floating-label label-bottom">made with curiosity</span>
      </div>
    </section>

    <section class="projects-section" id="proyectos" aria-labelledby="projects-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Selección personal</p>
          <h2 id="projects-title">Proyectos destacados</h2>
        </div>
        <span class="project-count">03 / 03</span>
      </div>

      <div class="project-grid">
        <a class="project-card project-featured" href="{{ "/ruleta/" | relative_url }}">
          <div class="project-visual roulette-visual">
            <span class="visual-number">01</span>
            <span class="roulette-wheel" aria-hidden="true">✦</span>
            <span class="visual-caption">gira la suerte</span>
          </div>
          <div class="project-info">
            <div class="project-title-row">
              <h3>Ruleta</h3>
              <span class="arrow" aria-hidden="true">↗</span>
            </div>
            <p>Una ruleta sencilla para tomar decisiones al azar cuando necesitas un pequeño empujón.</p>
            <div class="tag-list"><span>JavaScript</span><span>Interacción</span></div>
          </div>
        </a>

        <a class="project-card" href="{{ "/tinderpelis/" | relative_url }}">
          <div class="project-visual movies-visual">
            <span class="visual-number">02</span>
            <span class="film-strip" aria-hidden="true">▣</span>
            <span class="visual-caption">¿qué vemos hoy?</span>
          </div>
          <div class="project-info">
            <div class="project-title-row">
              <h3>Tinder de pelis</h3>
              <span class="arrow" aria-hidden="true">↗</span>
            </div>
            <p>Desliza, descubre y encuentra una película para tu próxima sesión.</p>
            <div class="tag-list"><span>JavaScript</span><span>Películas</span></div>
          </div>
        </a>

        <a class="project-card" href="{{ "/tools/" | relative_url }}">
          <div class="project-visual tools-visual">
            <span class="visual-number">03</span>
            <span class="tools-symbol" aria-hidden="true">{ }</span>
            <span class="visual-caption">recursos que ayudan</span>
          </div>
          <div class="project-info">
            <div class="project-title-row">
              <h3>Recursos útiles</h3>
              <span class="arrow" aria-hidden="true">↗</span>
            </div>
            <p>Una colección de enlaces, herramientas y referencias para programar mejor.</p>
            <div class="tag-list"><span>Bookmarks</span><span>Recursos</span></div>
          </div>
        </a>
      </div>
    </section>

    <section class="about-section" id="sobre-mi" aria-labelledby="about-title">
      <p class="eyebrow">Un poco sobre este espacio</p>
      <div class="about-content">
        <h2 id="about-title">Aprender haciendo,<br><em>una idea cada vez.</em></h2>
        <div class="about-copy">
          <p>Este portfolio es un laboratorio abierto. Aquí conviven proyectos terminados, pruebas rápidas y cualquier idea que merezca convertirse en algo real.</p>
          <a class="text-link" href="https://github.com/Rubaso" target="_blank" rel="noreferrer">Conoce el código en GitHub <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <span>© 2025 Rubaso</span>
    <span>Hecho con curiosidad <span class="footer-star" aria-hidden="true">✦</span></span>
  </footer>
</div>
