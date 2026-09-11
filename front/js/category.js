/**
 * Загружает статьи для указанной категории с бэкенда
 * и отрисовывает их в контейнере #category-articles-container.
 * 
 * @param {string} categoryName - Название категории (например: 'Красота', 'Здоровье', 'Спорт', 'Астрология')
 */
async function loadCategoryArticles(categoryName) {
    const container = document.getElementById('category-articles-container');
    if (!container) return;

    try {
        const response = await fetch(`http://localhost:3000/api/articles/category/${encodeURIComponent(categoryName)}`);
        
        if (!response.ok) {
            throw new Error(`Ошибка загрузки данных: ${response.status}`);
        }

        const articles = await response.json();

        if (!articles || articles.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #888;">
                    <p>В категории «${categoryName}» пока нет опубликованных статей.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = articles.map(article => `
            <div class="article-card">
                <div class="card-image-wrapper">
                    <img src="${article.coverUrl || 'images/default-cover.jpg'}" alt="${article.title}">
                    <span class="card-category-tag">${article.category}</span>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${article.title}</h3>
                    <p class="card-excerpt">${article.excerpt || ''}</p>
                    <div class="card-footer">
                        <span class="card-author">${article.authorName || 'Редакция'}</span>
                        <a href="article.html?id=${article.id}" class="card-link">Читать →</a>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error(`Ошибка при получении статей для категории ${categoryName}:`, err);
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #e2a9b7;">
                <p>Не удалось загрузить статьи. Проверьте подключение к серверу.</p>
            </div>
        `;
    }
}