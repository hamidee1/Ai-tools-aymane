document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & CONFIG ---
    let state = {
        language: localStorage.getItem('language') || 'en',
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        currentPage: 'home', // 'home', 'categories', 'rankedList'
        currentCategory: null,
    };

    // --- DOM ELEMENTS ---
    const app = document.getElementById('app');
    const headerEl = document.getElementById('main-header');
    const footerEl = document.getElementById('main-footer');
    const docElement = document.documentElement;

    // --- TRANSLATIONS ---
    const translations = {
        en: { siteName: "AI Tools Hub", discover: "Discover, Rank & Master AI Tools", heroSubtitle: "Your ultimate ranked guide to the best AI tools for productivity, creativity, and growth.", searchAITools: "Search AI Tools", chooseCategory: "Choose a Category", sponsored: "Sponsored", reviews: "Details", tryFree: "Visit Site" },
        ar: { siteName: "مركز أدوات الذكاء الاصطناعي", discover: "اكتشف، صنّف، وأتقن أدوات الذكاء الاصطناعي", heroSubtitle: "دليلك النهائي المصنف لأفضل أدوات الذكاء الاصطناعي للإنتاجية والإبداع والنمو.", searchAITools: "ابحث عن الأدوات", chooseCategory: "اختر فئة", sponsored: "ممَوَّل", reviews: "التفاصيل", tryFree: "زيارة الموقع" }
    };
    const t = (key) => translations[state.language][key] || key;
    const formatNumber = (num) => num >= 1000 ? (num / 1000).toFixed(1).replace('.0', '') + 'k' : num.toString();

    // --- PAGE RENDER FUNCTIONS ---
    
    const renderHomePage = () => {
        app.innerHTML = `
            <div class="page hero-background">
                <div class="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center text-white p-4 relative z-10 bg-black/40">
                    <h1 class="text-5xl md:text-7xl font-extrabold">${t('siteName')}</h1>
                    <h2 class="text-2xl md:text-4xl font-bold text-primary mt-2">${t('discover')}</h2>
                    <p class="max-w-3xl mx-auto mt-6 text-lg text-gray-200">${t('heroSubtitle')}</p>
                    <button id="search-btn" class="mt-12 bg-primary text-white font-bold py-4 px-10 rounded-full text-xl hover:bg-primary/90 transition-all duration-300 shadow-lg transform hover:scale-105">
                        <i class="fas fa-search mr-2"></i> ${t('searchAITools')}
                    </button>
                </div>
            </div>`;
        document.getElementById('search-btn').addEventListener('click', () => navigateTo('categories'));
    };

    const renderCategoriesPage = () => {
        const categoryButtons = categories.map(cat => `
            <button data-category-id="${cat.id}" class="category-btn bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center">
                <i class="${cat.icon} text-4xl text-primary"></i>
                <span class="text-lg font-bold text-light-text dark:text-dark-text">${cat.name[state.language]}</span>
            </button>
        `).join('');

        app.innerHTML = `
            <div class="page container mx-auto px-4 py-12">
                <h1 class="text-4xl font-extrabold text-center mb-10">${t('chooseCategory')}</h1>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    ${categoryButtons}
                </div>
            </div>`;
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => navigateTo('rankedList', btn.dataset.categoryId));
        });
    };

    const renderRankedListPage = (categoryId) => {
        const getScore = tool => tool.rating * Math.log10(tool.reviewCount + 1) + (tool.isSponsored ? 5 : 0);
        
        const toolsInCategory = toolsData
            .filter(tool => tool.category === categoryId)
            .sort((a, b) => getScore(b) - getScore(a));

        const categoryName = categories.find(c => c.id === categoryId)?.name[state.language];

        app.innerHTML = `
            <div class="page container mx-auto px-4 py-12">
                <button id="back-to-categories-btn" class="mb-8 text-primary font-bold hover:underline"><i class="fas fa-arrow-left mr-2"></i> ${t('chooseCategory')}</button>
                <h1 class="text-4xl font-extrabold text-center mb-10">${categoryName}</h1>
                <div class="grid grid-cols-1 gap-x-6 gap-y-16">
                    ${toolsInCategory.map((tool, index) => renderToolCard(tool, index + 1)).join('')}
                </div>
            </div>`;
        document.getElementById('back-to-categories-btn').addEventListener('click', () => navigateTo('categories'));
    };

    // --- COMPONENT RENDER FUNCTIONS ---
    
    const renderHeader = () => { /* ... Same as before ... */ };
    const renderFooter = () => { /* ... Same as before ... */ };
    
    const renderToolCard = (tool, rank) => {
        const lang = state.language;
        return `
            <div class="relative pl-16">
                <div class="rank-badge">#${rank}</div>
                <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 flex flex-col gap-4 border border-gray-200 dark:border-gray-700 h-full">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-2 flex-shrink-0"><img loading="lazy" alt="${tool.name[lang]}" src="${tool.logo}" class="max-h-full max-w-full object-contain"/></div>
                        <div><h3 class="text-xl font-bold text-light-text dark:text-dark-text">${tool.name[lang]}</h3></div>
                    </div>
                    <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-grow">${tool.short_description[lang]}</p>
                    <div class="flex items-center gap-2 text-gray-700 dark:text-gray-200"><i class="fas fa-star text-yellow-400"></i><span class="font-bold">${tool.rating}</span><span class="text-gray-500 dark:text-gray-400 text-sm">(${formatNumber(tool.reviewCount)})</span></div>
                    <div class="text-sm text-gray-700 dark:text-gray-300"><strong class="font-bold">${t('pricing') || 'Pricing'}:</strong> ${tool.pricing[lang]}</div>
                    <div class="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
                        <a href="${tool.website}" target="_blank" rel="noopener noreferrer" class="flex-grow text-center bg-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"><i class="fas fa-external-link-alt"></i> ${t('tryFree')}</a>
                    </div>
                </div>
            </div>`;
    };

    // --- NAVIGATION & ROUTING ---
    const navigateTo = (page, categoryId = null) => {
        state.currentPage = page;
        state.currentCategory = categoryId;
        window.scrollTo(0, 0);
        updateURL();
        render();
    };

    const render = () => {
        docElement.lang = state.language;
        docElement.dir = state.language === 'ar' ? 'rtl' : 'ltr';
        renderHeader();
        renderFooter();

        if (state.currentPage === 'home') renderHomePage();
        else if (state.currentPage === 'categories') renderCategoriesPage();
        else if (state.currentPage === 'rankedList') renderRankedListPage(state.currentCategory);
    };
    
    const updateURL = () => {
        let hash = `#${state.currentPage}`;
        if (state.currentPage === 'rankedList' && state.currentCategory) {
            hash += `/${state.currentCategory}`;
        }
        history.pushState(state, '', hash);
    };

    const handleURLChange = () => {
        const hash = window.location.hash.substring(1);
        const [page, categoryId] = hash.split('/');
        state.currentPage = page || 'home';
        state.currentCategory = categoryId || null;
        render();
    };

    // --- EVENT LISTENERS ---
    const addGlobalEventListeners = () => {
        document.getElementById('lang-switcher')?.addEventListener('click', () => {
            state.language = state.language === 'en' ? 'ar' : 'en';
            localStorage.setItem('language', state.language);
            render();
        });
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', state.theme);
            docElement.classList.toggle('dark');
        });
    };
    
    // --- INITIALIZATION ---
    window.addEventListener('popstate', (e) => {
        if (e.state) {
            state = e.state;
            render();
        }
    });

    handleURLChange(); // Initial load based on URL
});
