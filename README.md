# ToDy — соцсети и комишки

Рабочая папка для ведения соцсетей и приёма коммишенов за доллары.

## 🌐 Сайт

| | Ссылка |
|---|---|
| **Рабочий кабинет** (заказы, контент-план, шаблоны) | https://todyhehe.github.io/Yoyo/ |
| **Страница для клиентов** (EN, ставить в био) | https://todyhehe.github.io/Yoyo/commissions.html |

Код сайта — в папке [`docs/`](docs/). Заказы и галочки хранятся в браузере и синхронизируются
между телефоном и ПК через **приватный** репозиторий `Yoyo-data` (настройка — во вкладке «Настройки» на сайте).
Этот репозиторий публичный, поэтому данные клиентов сюда не попадают.

Страница для клиентов собирается из [`docs/site.json`](docs/site.json) (прайс, условия, ссылки, список картинок из `docs/img/`).
Менять её удобнее не здесь, а на сайте: **Настройки → Страница для клиентов → Опубликовать**.

## Что где лежит

| Файл | Что это | Язык |
|---|---|---|
| [`commissions/prices.md`](commissions/prices.md) | Прайс и как он посчитан | RU + EN |
| [`commissions/commission-sheet.md`](commissions/commission-sheet.md) | Текст для commission sheet / поста «Commissions OPEN» | EN |
| [`commissions/terms-of-service.md`](commissions/terms-of-service.md) | Правила (ToS) для клиентов | EN |
| [`commissions/order-form.md`](commissions/order-form.md) | Анкета, которую заполняет клиент | EN |
| [`commissions/client-messages.md`](commissions/client-messages.md) | Готовые ответы клиентам | EN (с переводом) |
| [`commissions/payments-kz.md`](commissions/payments-kz.md) | Как получать доллары из Казахстана | RU |
| [`social/bios.md`](social/bios.md) | Био для каждой соцсети | EN + RU |
| [`social/content-plan.md`](social/content-plan.md) | Контент-план на 4 недели | RU |
| [`social/post-templates.md`](social/post-templates.md) | Подписи к постам и хэштеги | EN + RU |
| [`tracker/commissions.csv`](tracker/commissions.csv) | Запасной трекер в таблице (основной — на сайте) | — |

## План запуска (по порядку)

1. **Оплата.** Завести PayPal (Казахстан), привязать Visa/Mastercard, проверить, что вывод работает → [`payments-kz.md`](commissions/payments-kz.md).
2. **Портфолио на английском.** Перевести текст на 2–3 реф-листах (Джек, Леонида, Генри) на английский.
3. **Примеры под каждый тип заказа.** Минимум 1 пример на каждую позицию прайса.
4. **Профили.** Обновить био везде, завести X/Twitter + Bluesky + VGen → [`bios.md`](social/bios.md).
5. **Commission sheet.** Собрать картинку-прайс (Canva / Clip Studio) по тексту из [`commission-sheet.md`](commissions/commission-sheet.md).
6. **4 недели постов по плану (2 в неделю)** до открытия, чтобы профиль не выглядел пустым.
7. **Открыть 3 слота**, не больше — это подработка, учёба важнее. Первые клиенты = отзывы и примеры.
