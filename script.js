
/* ==========================================
   NOLTRIX APPS — COMPLETE JAVASCRIPT
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  // ---------- LOADING SCREEN ----------
  const loader = $("#loader");
  const loaderBar = $("#loader-bar");
  const loaderStatus = $("#loader-status");

  const loadingMessages = [
    "Preparing experience...",
    "Loading ecosystem...",
    "Initializing interface...",
    "Almost ready..."
  ];

  let loadProgress = 0;

  const loaderTimer = setInterval(() => {
    loadProgress += Math.random() * 9 + 3;
    if (loadProgress > 95) loadProgress = 95;

    if (loaderBar) loaderBar.style.width = loadProgress + "%";

    if (loaderStatus) {
      const messageIndex = Math.min(
        Math.floor(loadProgress / 25),
        loadingMessages.length - 1
      );
      loaderStatus.textContent = loadingMessages[messageIndex];
    }
  }, 160);

  function finishLoading() {
    clearInterval(loaderTimer);
    if (loaderBar) loaderBar.style.width = "100%";
    if (loaderStatus) loaderStatus.textContent = "Experience ready.";

    setTimeout(() => {
      loader?.classList.add("hidden");
    }, 350);
  }

  window.addEventListener("load", finishLoading);
  setTimeout(finishLoading, 3500);

  // ---------- YEAR ----------
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  // ---------- NAVBAR ----------
  const navbar = $("#navbar");
  const menuToggle = $("#menu-toggle");
  const navLinks = $("#nav-links");

  window.addEventListener("scroll", () => {
    navbar?.classList.toggle("scrolled", window.scrollY > 20);
  });

  menuToggle?.addEventListener("click", () => {
    navLinks?.classList.toggle("open");
  });

  $$(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      navLinks?.classList.remove("open");
      $$(".nav-link").forEach(item => item.classList.remove("active"));
      link.classList.add("active");
    });
  });

  $("#games-link")?.addEventListener("click", (event) => {
    event.preventDefault();
    setFilter("games");
    $("#explore")?.scrollIntoView({ behavior: "smooth" });
  });

  // ---------- REVEAL ANIMATIONS ----------
  const revealElements = $$(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach(element => revealObserver.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add("visible"));
  }

  // ---------- PROJECTS ----------
  const cards = $$(".project-card");
  const searchInput = $("#search-input");
  const countDisplay = $("#project-count");
  const emptyState = $("#empty-state");
  const grid = $("#apps-grid");

  let currentFilter = "all";
  let searchTerm = "";
  let favoritesOnly = false;

  let favorites = [];
  try {
    favorites = JSON.parse(localStorage.getItem("noltrix-favorites") || "[]");
  } catch {
    favorites = [];
  }

  const favoriteButtons = $$(".favorite-btn");

  function saveFavorites() {
    try {
      localStorage.setItem("noltrix-favorites", JSON.stringify(favorites));
    } catch {}
  }

  function updateFavoriteButtons() {
    cards.forEach(card => {
      const button = card.querySelector(".favorite-btn");
      const saved = favorites.includes(card.dataset.name);
      button?.classList.toggle("saved", saved);
      button?.setAttribute("aria-pressed", String(saved));
    });
  }

  function applyFilters() {
    let visibleCount = 0;

    cards.forEach(card => {
      const category = card.dataset.category;
      const name = (card.dataset.name || "").toLowerCase();
      const description = (card.dataset.description || "").toLowerCase();
      const details = (card.dataset.details || "").toLowerCase();

      const matchesFilter =
        currentFilter === "all" ||
        category === currentFilter;

      const matchesSearch =
        !searchTerm ||
        name.includes(searchTerm) ||
        description.includes(searchTerm) ||
        details.includes(searchTerm);

      const matchesFavorite =
        !favoritesOnly || favorites.includes(card.dataset.name);

      const show =
        matchesFilter &&
        matchesSearch &&
        matchesFavorite;

      card.classList.toggle("hidden", !show);

      if (show) visibleCount++;
    });

    if (countDisplay) countDisplay.textContent = visibleCount;

    emptyState?.classList.toggle("show", visibleCount === 0);
    grid?.classList.toggle("empty-results", visibleCount === 0);
  }

  function setFilter(filter) {
    currentFilter = filter;
    favoritesOnly = filter === "favorites";

    $$(".filter-btn").forEach(button => {
      button.classList.toggle("active", button.dataset.filter === filter);
    });

    applyFilters();
  }

  $$(".filter-btn").forEach(button => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });

  searchInput?.addEventListener("input", () => {
    searchTerm = searchInput.value.trim().toLowerCase();
    applyFilters();
  });

  $("#reset-search")?.addEventListener("click", () => {
    searchInput.value = "";
    searchTerm = "";
    setFilter("all");
  });

  favoriteButtons.forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();

      const card = button.closest(".project-card");
      const name = card?.dataset.name;
      if (!name) return;

      if (favorites.includes(name)) {
        favorites = favorites.filter(item => item !== name);
      } else {
        favorites.push(name);
      }

      saveFavorites();
      updateFavoriteButtons();
      applyFilters();
    });
  });

  updateFavoriteButtons();

  // ---------- SORT ----------
  $("#project-sort")?.addEventListener("change", event => {
    const sortValue = event.target.value;

    const sorted = [...cards];

    if (sortValue === "az") {
      sorted.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
    } else if (sortValue === "za") {
      sorted.sort((a, b) => b.dataset.name.localeCompare(a.dataset.name));
    } else {
      sorted.sort((a, b) => Number(a.dataset.originalOrder || 0) - Number(b.dataset.originalOrder || 0));
    }

    sorted.forEach(card => grid.appendChild(card));
  });

  cards.forEach((card, index) => {
    card.dataset.originalOrder = index;
  });

  // ---------- GRID / LIST ----------
  const gridButton = $("#grid-view");
  const listButton = $("#list-view");

  function setView(view) {
    const isList = view === "list";

    grid?.classList.toggle("list-view", isList);
    gridButton?.classList.toggle("active", !isList);
    listButton?.classList.toggle("active", isList);

    try {
      localStorage.setItem("noltrix-view", view);
    } catch {}
  }

  gridButton?.addEventListener("click", () => setView("grid"));
  listButton?.addEventListener("click", () => setView("list"));

  try {
    setView(localStorage.getItem("noltrix-view") || "grid");
  } catch {
    setView("grid");
  }

  // ---------- PROJECT MODAL ----------
  const modal = $("#app-modal");
  const modalIcon = $("#modal-icon");
  const modalCategory = $("#modal-category");
  const modalTitle = $("#modal-title");
  const modalDescription = $("#modal-description");
  const modalDetails = $("#modal-details");
  const modalStatus = $("#modal-status");

  function openModal(card) {
    if (!card || !modal) return;

    modalIcon.textContent = card.querySelector(".project-icon")?.textContent.trim() || "N";
    modalCategory.textContent = card.querySelector(".card-category")?.textContent || "PROJECT";
    modalTitle.textContent = card.dataset.name || "Project";
    modalDescription.textContent = card.dataset.description || "";
    modalDetails.textContent = card.dataset.details || "";

    const statusText = card.dataset.status || "In Development";
    const isPlanned = statusText.toLowerCase() !== "in development";

    modalStatus.classList.toggle("planned", isPlanned);
    modalStatus.innerHTML = `<i></i> ${statusText}`;

    modal.classList.add("open");
    document.body.classList.add("lock-scroll");
  }

  function closeModal() {
    modal?.classList.remove("open");
    document.body.classList.remove("lock-scroll");
  }

  cards.forEach(card => {
    card.addEventListener("click", event => {
      if (event.target.closest(".favorite-btn")) return;
      openModal(card);
    });
  });

  $("#modal-close")?.addEventListener("click", closeModal);
  $("#modal-button")?.addEventListener("click", closeModal);

  modal?.addEventListener("click", event => {
    if (event.target === modal) closeModal();
  });

  // ---------- THEME STUDIO ----------
  const themePanel = $("#theme-panel");
  const themeOverlay = $("#theme-overlay");
  const themeOpen = $("#theme-open");
  const themeClose = $("#theme-close");
  const themeName = $("#current-theme-name");

  const themeNames = {
    midnight: "Midnight",
    slate: "Slate",
    light: "Light",
    cyber: "Cyber",
    ocean: "Ocean",
    crimson: "Crimson",
    violet: "Violet",
    emerald: "Emerald",
    sunset: "Sunset",
    rose: "Rose",
    gold: "Gold",
    matrix: "Matrix",
    arctic: "Arctic",
    coffee: "Coffee",
    monochrome: "Monochrome",
    aurora: "Aurora",
    mint: "Mint",
    lavender: "Lavender",
    tangerine: "Tangerine",
    ruby: "Ruby"
  };

  function setTheme(theme) {
    if (!themeNames[theme]) theme = "midnight";

    document.body.dataset.theme = theme;

    if (themeName) themeName.textContent = themeNames[theme];

    $$(".theme-option").forEach(button => {
      button.classList.toggle("active", button.dataset.theme === theme);
    });

    try {
      localStorage.setItem("noltrix-theme", theme);
    } catch {}
  }

  function openThemes() {
    themePanel?.classList.add("open");
    themeOverlay?.classList.add("open");
    document.body.classList.add("lock-scroll");
  }

  function closeThemes() {
    themePanel?.classList.remove("open");
    themeOverlay?.classList.remove("open");
    document.body.classList.remove("lock-scroll");
  }

  themeOpen?.addEventListener("click", openThemes);
  themeClose?.addEventListener("click", closeThemes);
  themeOverlay?.addEventListener("click", closeThemes);

  $$(".theme-option").forEach(button => {
    button.addEventListener("click", () => setTheme(button.dataset.theme));
  });

  try {
    setTheme(localStorage.getItem("noltrix-theme") || "midnight");
  } catch {
    setTheme("midnight");
  }

  // ---------- COMMAND PALETTE ----------
  const commandOverlay = $("#command-overlay");
  const commandInput = $("#command-input");
  const commandItems = [...$$(".command-item")];

  let selectedCommand = 0;

  function openCommand() {
    commandOverlay?.classList.add("open");
    commandInput.value = "";
    selectedCommand = 0;
    filterCommands("");
    setTimeout(() => commandInput?.focus(), 80);
  }

  function closeCommand() {
    commandOverlay?.classList.remove("open");
  }

  function filterCommands(query) {
    const q = query.toLowerCase();
    const visible = commandItems.filter(item =>
      item.textContent.toLowerCase().includes(q)
    );

    commandItems.forEach(item => item.style.display = visible.includes(item) ? "flex" : "none");
    selectedCommand = 0;
    updateCommandSelection(visible);
  }

  function updateCommandSelection(visible) {
    commandItems.forEach(item => item.classList.remove("selected"));
    if (visible[selectedCommand]) visible[selectedCommand].classList.add("selected");
  }

  function runCommand(command) {
    closeCommand();

    switch (command) {
      case "explore":
        setFilter("all");
        $("#explore").scrollIntoView({ behavior: "smooth" });
        break;
      case "games":
        setFilter("games");
        $("#explore").scrollIntoView({ behavior: "smooth" });
        break;
      case "themes":
        openThemes();
        break;
      case "favorites":
        setFilter("favorites");
        $("#explore").scrollIntoView({ behavior: "smooth" });
        break;
      case "about":
        $("#about").scrollIntoView({ behavior: "smooth" });
        break;
    }
  }

  $("#command-open")?.addEventListener("click", openCommand);
  $("#hero-command")?.addEventListener("click", openCommand);

  commandInput?.addEventListener("input", () => filterCommands(commandInput.value));

  commandItems.forEach(item => {
    item.addEventListener("click", () => runCommand(item.dataset.command));
  });

  commandInput?.addEventListener("keydown", event => {
    const visible = commandItems.filter(item => item.style.display !== "none");

    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectedCommand = (selectedCommand + 1) % Math.max(visible.length, 1);
      updateCommandSelection(visible);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      selectedCommand = (selectedCommand - 1 + visible.length) % Math.max(visible.length, 1);
      updateCommandSelection(visible);
    }

    if (event.key === "Enter" && visible[selectedCommand]) {
      runCommand(visible[selectedCommand].dataset.command);
    }
  });

  commandOverlay?.addEventListener("click", event => {
    if (event.target === commandOverlay) closeCommand();
  });

  // ---------- KEYBOARD SHORTCUTS ----------
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeCommand();
      closeModal();
      closeThemes();
      navLinks?.classList.remove("open");
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openCommand();
    }

    if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      event.preventDefault();
      searchInput?.focus();
    }
  });

  // ---------- SECTION NAVIGATION ----------
  const sections = ["home", "explore", "about"].map(id => document.getElementById(id)).filter(Boolean);

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          $$(".nav-link").forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
          });
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });

    sections.forEach(section => sectionObserver.observe(section));
  }

  // Initial render
  applyFilters();

  console.log("Noltrix Apps initialized successfully.");
});
