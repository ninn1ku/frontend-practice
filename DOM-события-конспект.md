# DOM-события — Подробный конспект

---

## Содержание

1. [Основы DOM-событий](#1-основы-dom-событий)
2. [addEventListener()](#2-addeventlistener)
3. [Объект Event](#3-объект-event)
4. [target / currentTarget](#4-target--currenttarget)
5. [Событие click](#5-событие-click)
6. [Событие input](#6-событие-input)
7. [Событие change](#7-событие-change)
8. [Событие submit](#8-событие-submit)
9. [preventDefault()](#9-preventdefault)
10. [stopPropagation()](#10-stoppropagation)
11. [Событие keydown](#11-событие-keydown)
12. [focus / blur](#12-focus--blur)
13. [Bubbling — всплытие событий](#13-bubbling--всплытие-событий)
14. [Делегирование событий](#14-делегирование-событий)
15. [closest()](#15-closest)
16. [data-* атрибуты](#16-data--атрибуты)
17. [DOMContentLoaded](#17-domcontentloaded)
18. [Debounce для input](#18-debounce-для-input)
19. [removeEventListener()](#19-removeeventlistener)
20. [async/await в обработчиках](#20-asyncawait-в-обработчиках)
21. [Обработка динамически созданных элементов](#21-обработка-динамически-созданных-элементов)
22. [Валидация форм через события](#22-валидация-форм-через-события)
23. [mouseenter / mouseleave](#23-mouseenter--mouseleave)
24. [Scroll events](#24-scroll-events)
25. [this и стрелочные функции в обработчиках](#25-this-и-стрелочные-функции-в-обработчиках)

---

## 1. Основы DOM-событий

**Событие** — это сигнал от браузера о том, что что-то произошло (клик, нажатие клавиши, загрузка страницы и т.д.).

### Как работает система событий

1. **Генерация события** — браузер или код создаёт событие.
2. **Распространение** — событие проходит через дерево DOM (сначала вниз — capturing, затем вверх — bubbling).
3. **Обработка** — вызываются зарегистрированные обработчики.

### Типы событий

| Категория | Примеры |
|---|---|
| Мышь | `click`, `dblclick`, `mousedown`, `mouseup`, `mousemove` |
| Клавиатура | `keydown`, `keyup`, `keypress` |
| Форма | `submit`, `input`, `change`, `focus`, `blur` |
| Документ | `DOMContentLoaded`, `load`, `scroll`, `resize` |
| Drag & Drop | `dragstart`, `dragover`, `drop` |

### Три способа назначить обработчик

```html
<!-- 1. Inline (устаревший способ, не рекомендуется) -->
<button onclick="alert('клик!')">Кликни</button>
```

```javascript
// 2. Через свойство (только один обработчик)
element.onclick = function() {
  console.log('клик');
};

// 3. addEventListener (рекомендуемый способ)
element.addEventListener('click', function() {
  console.log('клик');
});
```

> **Почему inline — плохо:** смешивает HTML и JS, нет возможности добавить несколько обработчиков, сложно тестировать.

---

## 2. addEventListener()

Основной метод для подписки на события.

### Синтаксис

```javascript
element.addEventListener(event, handler, options);
```

| Параметр | Тип | Описание |
|---|---|---|
| `event` | string | Тип события (`'click'`, `'keydown'` и т.д.) |
| `handler` | Function | Функция-обработчик |
| `options` | Object / boolean | Настройки (необязательно) |

### Объект options

```javascript
element.addEventListener('click', handler, {
  once: true,       // сработает только один раз
  capture: false,   // фаза захвата (capturing) — по умолчанию false
  passive: true     // обещание не вызывать preventDefault() (ускоряет скролл)
});
```

### Несколько обработчиков на одно событие

```javascript
const btn = document.querySelector('#myBtn');

btn.addEventListener('click', () => console.log('Обработчик 1'));
btn.addEventListener('click', () => console.log('Обработчик 2'));
// Оба сработают!
```

### Пример с once

```javascript
btn.addEventListener('click', () => {
  console.log('Только один раз!');
}, { once: true });
```

---

## 3. Объект Event

Каждый обработчик получает объект события `event` (или `e`) — он содержит всю информацию о случившемся.

### Основные свойства

```javascript
element.addEventListener('click', function(event) {
  console.log(event.type);          // 'click' — тип события
  console.log(event.target);        // элемент, на котором кликнули
  console.log(event.currentTarget); // элемент, на котором висит обработчик
  console.log(event.timeStamp);     // время события (мс)
  console.log(event.bubbles);       // всплывает ли событие
  console.log(event.cancelable);    // можно ли отменить
});
```

### Свойства для событий мыши

```javascript
element.addEventListener('click', function(e) {
  console.log(e.clientX, e.clientY); // координаты относительно окна
  console.log(e.pageX, e.pageY);     // координаты относительно страницы
  console.log(e.button);             // кнопка мыши (0 — левая, 2 — правая)
  console.log(e.ctrlKey);            // зажат ли Ctrl
  console.log(e.shiftKey);           // зажат ли Shift
  console.log(e.altKey);             // зажат ли Alt
});
```

### Свойства для событий клавиатуры

```javascript
document.addEventListener('keydown', function(e) {
  console.log(e.key);     // 'Enter', 'a', 'ArrowLeft' и т.д.
  console.log(e.code);    // 'KeyA', 'Enter', 'ArrowLeft' (физическая клавиша)
  console.log(e.keyCode); // устарело, не использовать
});
```

> **e.key vs e.code:** `key` — что введено (зависит от языка/раскладки), `code` — какая физическая клавиша нажата.

---

## 4. target / currentTarget

Одно из самых важных различий в обработке событий.

### target

`event.target` — **элемент, на котором произошло событие** (источник события). Не меняется при всплытии.

### currentTarget

`event.currentTarget` — **элемент, на котором зарегистрирован обработчик**. Меняется по мере всплытия. Всегда равен `this` (в обычных функциях).

### Пример

```html
<div id="outer">
  <button id="inner">Нажми меня</button>
</div>
```

```javascript
document.getElementById('outer').addEventListener('click', function(e) {
  console.log(e.target);        // <button id="inner"> — куда кликнули
  console.log(e.currentTarget); // <div id="outer"> — где обработчик
  console.log(this);            // <div id="outer"> — то же, что currentTarget
});
```

### Визуализация

```
Клик по <button>
       ↓
target = <button>      ← не меняется никогда
       ↓
Всплытие вверх...
       ↓
currentTarget = <div>  ← меняется с каждым уровнем
```

---

## 5. Событие click

Срабатывает при нажатии и отпускании левой кнопки мыши.

```javascript
const btn = document.querySelector('#btn');

btn.addEventListener('click', function(e) {
  console.log('Клик!');
  console.log('Координаты:', e.clientX, e.clientY);
});
```

### Отличие click от mousedown/mouseup

| Событие | Когда |
|---|---|
| `mousedown` | При нажатии кнопки мыши |
| `mouseup` | При отпускании кнопки мыши |
| `click` | После mousedown + mouseup на одном элементе |
| `dblclick` | Двойной клик |

### Правый клик

```javascript
element.addEventListener('contextmenu', function(e) {
  e.preventDefault(); // отключить стандартное контекстное меню
  console.log('Правый клик');
});
```

---

## 6. Событие input

Срабатывает **немедленно** при каждом изменении значения поля ввода (каждое нажатие клавиши, вставка, вырезание).

```javascript
const input = document.querySelector('#search');

input.addEventListener('input', function(e) {
  console.log(e.target.value); // текущее значение поля
});
```

### Практический пример — живой поиск

```javascript
const searchInput = document.querySelector('#search');
const results = document.querySelector('#results');

searchInput.addEventListener('input', function(e) {
  const query = e.target.value.trim().toLowerCase();
  
  if (query.length === 0) {
    results.innerHTML = '';
    return;
  }
  
  // Фильтрация данных
  const filtered = data.filter(item => item.toLowerCase().includes(query));
  results.innerHTML = filtered.map(item => `<li>${item}</li>`).join('');
});
```

> **Отличие от `change`:** `input` — при каждом символе, `change` — только после потери фокуса.

---

## 7. Событие change

Срабатывает когда значение элемента **изменилось и потерял фокус** (для `<input>`, `<textarea>`) или немедленно для `<select>`, чекбоксов и радиокнопок.

```javascript
// Для текстового поля — после blur
const textInput = document.querySelector('#name');
textInput.addEventListener('change', function(e) {
  console.log('Значение изменено:', e.target.value);
});

// Для select — немедленно при выборе
const select = document.querySelector('#color');
select.addEventListener('change', function(e) {
  console.log('Выбрано:', e.target.value);
});

// Для checkbox
const checkbox = document.querySelector('#agree');
checkbox.addEventListener('change', function(e) {
  console.log('Чекбокс:', e.target.checked); // true/false
});
```

### Сравнение input и change

| Событие | Когда срабатывает | Подходит для |
|---|---|---|
| `input` | При каждом изменении | Живой поиск, счётчики |
| `change` | После потери фокуса | Валидация после ввода |

---

## 8. Событие submit

Срабатывает при отправке формы (кнопка submit, нажатие Enter в поле).

```html
<form id="myForm">
  <input type="text" name="username" />
  <button type="submit">Отправить</button>
</form>
```

```javascript
const form = document.querySelector('#myForm');

form.addEventListener('submit', function(e) {
  e.preventDefault(); // предотвратить перезагрузку страницы!
  
  // Получить данные формы
  const formData = new FormData(form);
  const username = formData.get('username');
  
  console.log('Отправлено:', username);
  
  // или через elements
  console.log(form.elements['username'].value);
});
```

> **Важно:** всегда вызывать `e.preventDefault()` при обработке submit, иначе страница перезагрузится.

### FormData — удобный сбор данных

```javascript
form.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const data = Object.fromEntries(new FormData(form));
  console.log(data); // { username: 'Иван', email: 'ivan@example.com' }
  
  // Отправка на сервер
  fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
});
```

---

## 9. preventDefault()

Отменяет действие браузера по умолчанию для данного события.

### Примеры использования

```javascript
// 1. Отмена перехода по ссылке
document.querySelector('a').addEventListener('click', function(e) {
  e.preventDefault();
  console.log('Переход отменён');
});

// 2. Отмена отправки формы
form.addEventListener('submit', function(e) {
  e.preventDefault();
  // своя обработка
});

// 3. Отключение контекстного меню
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

// 4. Отмена drag-and-drop по умолчанию
dropZone.addEventListener('dragover', function(e) {
  e.preventDefault(); // необходимо, чтобы разрешить drop
});
```

### Проверка, можно ли отменить событие

```javascript
element.addEventListener('click', function(e) {
  if (e.cancelable) {
    e.preventDefault();
  }
});
```

> **Важно:** `preventDefault()` не останавливает всплытие! Для этого нужен `stopPropagation()`.

---

## 10. stopPropagation()

Останавливает **распространение** (всплытие/погружение) события по DOM-дереву.

```html
<div id="outer">
  <div id="inner">
    <button id="btn">Кнопка</button>
  </div>
</div>
```

```javascript
document.getElementById('outer').addEventListener('click', () => {
  console.log('outer');
});

document.getElementById('inner').addEventListener('click', () => {
  console.log('inner');
});

document.getElementById('btn').addEventListener('click', (e) => {
  console.log('btn');
  e.stopPropagation(); // остановить здесь!
});

// При клике по кнопке в консоли будет только: 'btn'
// Без stopPropagation было бы: 'btn', 'inner', 'outer'
```

### stopImmediatePropagation()

Останавливает и всплытие, и **все остальные обработчики** на текущем элементе:

```javascript
btn.addEventListener('click', (e) => {
  console.log('Обработчик 1');
  e.stopImmediatePropagation();
});

btn.addEventListener('click', () => {
  console.log('Обработчик 2'); // НЕ ВЫЗОВЕТСЯ
});
```

### Различие

| Метод | Что делает |
|---|---|
| `stopPropagation()` | Останавливает всплытие, но остальные обработчики на этом элементе работают |
| `stopImmediatePropagation()` | Останавливает всё — и всплытие, и другие обработчики |
| `preventDefault()` | Отменяет действие браузера, НЕ останавливает всплытие |

> **Осторожно:** злоупотребление `stopPropagation()` ломает делегирование событий.

---

## 11. Событие keydown

Срабатывает при нажатии клавиши. Подписывается обычно на `document`.

```javascript
document.addEventListener('keydown', function(e) {
  console.log(e.key);  // 'Enter', 'Escape', 'a', 'A', ' ' и т.д.
  console.log(e.code); // 'Enter', 'Escape', 'KeyA', 'Space'
});
```

### Частые кейсы

```javascript
document.addEventListener('keydown', function(e) {
  // Закрыть модальное окно по Escape
  if (e.key === 'Escape') {
    closeModal();
  }
  
  // Сохранить по Ctrl+S
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault(); // отменить стандартное сохранение браузера
    saveDocument();
  }
  
  // Навигация стрелками
  if (e.key === 'ArrowUp') moveUp();
  if (e.key === 'ArrowDown') moveDown();
});
```

### Отличие keydown / keyup / keypress

| Событие | Когда | Примечание |
|---|---|---|
| `keydown` | При нажатии клавиши | Срабатывает для любых клавиш |
| `keyup` | При отпускании | Срабатывает после keydown |
| `keypress` | **Устарело!** | Не использовать |

### Популярные значения e.key

```
'Enter', 'Escape', 'Tab', 'Backspace', 'Delete'
'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
'Home', 'End', 'PageUp', 'PageDown'
'F1'–'F12'
' '  ← пробел (Space)
```

---

## 12. focus / blur

События фокуса для интерактивных элементов (`<input>`, `<button>`, `<a>`, `<textarea>`, и т.д.).

```javascript
const input = document.querySelector('#email');

// Элемент получил фокус
input.addEventListener('focus', function(e) {
  e.target.classList.add('focused');
  console.log('Поле активно');
});

// Элемент потерял фокус
input.addEventListener('blur', function(e) {
  e.target.classList.remove('focused');
  validateEmail(e.target.value);
});
```

### Важное отличие: не всплывают!

`focus` и `blur` **не всплывают**. Для делегирования используют `focusin` / `focusout` (они всплывают):

```javascript
// Не сработает для дочерних элементов:
form.addEventListener('focus', () => console.log('фокус')); // ПЛОХО

// Правильно — используй focusin:
form.addEventListener('focusin', () => console.log('фокус внутри формы')); // ХОРОШО
```

### Программный фокус

```javascript
input.focus();  // установить фокус
input.blur();   // снять фокус
input.select(); // выделить весь текст
```

### Пример — плавающий label

```javascript
const input = document.querySelector('.input-field');
const label = document.querySelector('.label');

input.addEventListener('focus', () => label.classList.add('active'));
input.addEventListener('blur', () => {
  if (!input.value) label.classList.remove('active');
});
```

---

## 13. Bubbling — всплытие событий

**Всплытие** — это механизм, при котором событие сначала срабатывает на целевом элементе, а затем "поднимается" вверх по DOM-дереву через всех предков до `document`.

### Порядок фаз события

```
document
  └── <html>
       └── <body>
            └── <div id="outer">
                 └── <button>  ← клик здесь
```

**Capturing (захват)** — сверху вниз: `document → <html> → <body> → <div> → <button>`

**Target** — на целевом элементе

**Bubbling (всплытие)** — снизу вверх: `<button> → <div> → <body> → <html> → document`

### Пример всплытия

```javascript
document.body.addEventListener('click', () => console.log('body'));
document.querySelector('#outer').addEventListener('click', () => console.log('outer'));
document.querySelector('#btn').addEventListener('click', () => console.log('btn'));

// Клик по btn выведет:
// btn
// outer
// body
```

### Фаза захвата

```javascript
// Третий аргумент true — захват (capturing)
document.addEventListener('click', function(e) {
  console.log('Захват:', e.target);
}, true); // или { capture: true }
```

### Какие события НЕ всплывают

- `focus` / `blur`
- `load` / `unload`
- `scroll` (на конкретном элементе)
- `mouseenter` / `mouseleave`

---

## 14. Делегирование событий

**Делегирование** — паттерн, при котором один обработчик ставится на родителя вместо множества обработчиков на каждый дочерний элемент. Работает благодаря всплытию.

### Проблема без делегирования

```javascript
// Плохо — 100 обработчиков для 100 элементов
document.querySelectorAll('li').forEach(li => {
  li.addEventListener('click', function() {
    this.classList.toggle('done');
  });
});
// Новые элементы не получат обработчик!
```

### Решение с делегированием

```javascript
// Хорошо — один обработчик на родителя
const list = document.querySelector('#todo-list');

list.addEventListener('click', function(e) {
  const li = e.target.closest('li'); // ищем ближайший <li>
  if (!li) return; // клик не по элементу списка
  
  li.classList.toggle('done');
});
// Работает для любых элементов — текущих и будущих!
```

### Преимущества делегирования

| Аспект | Без делегирования | С делегированием |
|---|---|---|
| Память | N обработчиков | 1 обработчик |
| Динамические элементы | Нужно добавлять вручную | Работает автоматически |
| Производительность | Хуже | Лучше |

### Пример с data-атрибутами

```html
<ul id="menu">
  <li data-action="copy">Копировать</li>
  <li data-action="paste">Вставить</li>
  <li data-action="cut">Вырезать</li>
</ul>
```

```javascript
document.querySelector('#menu').addEventListener('click', function(e) {
  const action = e.target.dataset.action;
  if (!action) return;
  
  const actions = {
    copy: () => console.log('Копируем'),
    paste: () => console.log('Вставляем'),
    cut: () => console.log('Вырезаем'),
  };
  
  actions[action]?.();
});
```

---

## 15. closest()

Метод элемента, который ищет **ближайшего предка** (включая сам элемент), соответствующего CSS-селектору. Идёт вверх по DOM-дереву.

### Синтаксис

```javascript
const result = element.closest(selector);
// Возвращает элемент или null, если не найден
```

### Примеры

```javascript
// Клик по любому вложенному элементу внутри карточки
document.addEventListener('click', function(e) {
  const card = e.target.closest('.card');
  if (!card) return;
  
  console.log('Клик по карточке:', card);
});
```

```html
<!-- Пример структуры -->
<div class="card">
  <div class="card__header">
    <span class="card__title">Заголовок</span> <!-- клик здесь -->
  </div>
</div>
```

```javascript
// e.target = <span class="card__title">
// e.target.closest('.card') = <div class="card"> ✓
```

### В делегировании событий

```javascript
list.addEventListener('click', function(e) {
  // Клик может быть по тексту внутри <li>, по иконке и т.д.
  const item = e.target.closest('.list-item');
  if (!item || !list.contains(item)) return;
  
  const deleteBtn = e.target.closest('.delete-btn');
  if (deleteBtn) {
    item.remove();
    return;
  }
  
  item.classList.toggle('selected');
});
```

> **Подсказка:** `contains()` проверяет, что найденный элемент действительно находится внутри обработчика (защита от выхода за пределы контейнера).

---

## 16. data-* атрибуты

Позволяют хранить произвольные данные прямо в HTML-элементе.

### Синтаксис в HTML

```html
<button data-user-id="42" data-role="admin" data-is-active="true">
  Пользователь
</button>
```

### Доступ через JavaScript

```javascript
const btn = document.querySelector('button');

// Чтение
console.log(btn.dataset.userId);   // '42' (всегда строка!)
console.log(btn.dataset.role);     // 'admin'
console.log(btn.dataset.isActive); // 'true'

// camelCase в JS ↔ kebab-case в HTML
// data-user-id → dataset.userId
// data-is-active → dataset.isActive

// Запись
btn.dataset.userId = 100;

// Удаление
delete btn.dataset.role;
```

### Практическое применение в событиях

```html
<div id="tabs">
  <button data-tab="profile">Профиль</button>
  <button data-tab="settings">Настройки</button>
  <button data-tab="about">О нас</button>
</div>

<div id="profile" class="tab-content">...</div>
<div id="settings" class="tab-content hidden">...</div>
<div id="about" class="tab-content hidden">...</div>
```

```javascript
document.querySelector('#tabs').addEventListener('click', function(e) {
  const tab = e.target.closest('[data-tab]');
  if (!tab) return;
  
  // Скрыть все вкладки
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  
  // Показать нужную
  document.getElementById(tab.dataset.tab).classList.remove('hidden');
});
```

---

## 17. DOMContentLoaded

Событие, которое срабатывает когда **HTML полностью загружен и разобран**, без ожидания картинок, стилей и других внешних ресурсов.

```javascript
document.addEventListener('DOMContentLoaded', function() {
  // Можно безопасно работать с DOM
  const btn = document.querySelector('#myBtn');
  btn.addEventListener('click', handler);
});
```

### Сравнение событий загрузки

| Событие | Когда | На чём |
|---|---|---|
| `DOMContentLoaded` | HTML разобран, DOM готов | `document` |
| `load` | Всё загружено (картинки, стили) | `window` |
| `beforeunload` | Перед закрытием страницы | `window` |
| `unload` | Страница закрыта | `window` |

```javascript
// DOMContentLoaded — для инициализации JS
document.addEventListener('DOMContentLoaded', initApp);

// load — для работы с изображениями
window.addEventListener('load', function() {
  const img = document.querySelector('img');
  console.log(img.naturalWidth); // теперь доступно
});

// beforeunload — предупреждение перед уходом
window.addEventListener('beforeunload', function(e) {
  e.preventDefault();
  e.returnValue = ''; // показать диалог браузера
});
```

### Когда DOMContentLoaded уже сработал

```javascript
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init(); // DOM уже готов
}
```

---

## 18. Debounce для input

**Debounce** — техника задержки выполнения функции до тех пор, пока не прекратится поток событий. Критически важна для `input`, чтобы не отправлять запрос на каждое нажатие.

### Проблема без debounce

```javascript
input.addEventListener('input', function(e) {
  fetch(`/search?q=${e.target.value}`); // запрос при КАЖДОМ нажатии!
});
// Пользователь вводит "привет" = 6 запросов
```

### Реализация debounce

```javascript
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Использование
const search = debounce(function(e) {
  fetch(`/search?q=${e.target.value}`);
  console.log('Запрос отправлен:', e.target.value);
}, 500); // ждём 500мс после последнего нажатия

input.addEventListener('input', search);
```

### Throttle vs Debounce

| Техника | Поведение | Применение |
|---|---|---|
| `debounce` | Ждёт паузу, потом выполняет | Поиск, валидация |
| `throttle` | Выполняет не чаще раза в N мс | Scroll, resize |

### Пример throttle

```javascript
function throttle(fn, limit) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= limit) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

window.addEventListener('scroll', throttle(function() {
  console.log('Скролл обработан');
}, 200));
```

---

## 19. removeEventListener()

Удаляет ранее добавленный обработчик событий.

### Синтаксис

```javascript
element.removeEventListener(event, handler, options);
```

> **Критически важно:** передать точно ту же функцию, что была передана в `addEventListener`!

### Правильное использование

```javascript
function handleClick() {
  console.log('Клик');
}

// Добавляем
btn.addEventListener('click', handleClick);

// Удаляем (та же ссылка на функцию)
btn.removeEventListener('click', handleClick);
```

### Частая ошибка

```javascript
// НЕПРАВИЛЬНО — анонимные функции нельзя удалить!
btn.addEventListener('click', function() { console.log('клик'); });
btn.removeEventListener('click', function() { console.log('клик'); }); // НЕ СРАБОТАЕТ

// ПРАВИЛЬНО — именованная или сохранённая функция
const handler = () => console.log('клик');
btn.addEventListener('click', handler);
btn.removeEventListener('click', handler); // ✓
```

### Автоудаление через once

```javascript
// Вместо ручного removeEventListener
btn.addEventListener('click', handler, { once: true });
// После первого срабатывания удалится автоматически
```

### Практический пример — модальное окно

```javascript
function openModal() {
  modal.classList.add('open');
  document.addEventListener('keydown', handleEscape);
}

function handleEscape(e) {
  if (e.key === 'Escape') {
    closeModal();
  }
}

function closeModal() {
  modal.classList.remove('open');
  document.removeEventListener('keydown', handleEscape); // чистим за собой
}
```

---

## 20. async/await в обработчиках

Обработчики событий могут быть асинхронными. Это позволяет использовать `await` для работы с API и другими асинхронными операциями.

### Базовое использование

```javascript
btn.addEventListener('click', async function(e) {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Ошибка:', error);
  }
});
```

### Пример с отправкой формы

```javascript
form.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const submitBtn = form.querySelector('[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправляем...';
  
  try {
    const formData = Object.fromEntries(new FormData(form));
    
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) throw new Error('Ошибка сервера');
    
    const result = await response.json();
    showSuccess(`Пользователь ${result.name} создан!`);
    form.reset();
    
  } catch (error) {
    showError('Не удалось сохранить данные');
    console.error(error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Отправить';
  }
});
```

### Важные нюансы

```javascript
// async-обработчик возвращает Promise — ошибки нужно ловить внутри!
btn.addEventListener('click', async (e) => {
  // Если забыть try/catch — ошибка уйдёт в "unhandled promise rejection"
  const data = await riskyOperation();
});

// Глобальный перехват необработанных ошибок промисов
window.addEventListener('unhandledrejection', function(event) {
  console.error('Необработанная ошибка:', event.reason);
});
```

---

## 21. Обработка динамически созданных элементов

Элементы, добавленные в DOM после загрузки страницы, не получают обработчики, установленные через `querySelectorAll`.

### Проблема

```javascript
// Этот код не работает для новых элементов!
document.querySelectorAll('.item').forEach(item => {
  item.addEventListener('click', handleClick);
});

// Добавляем новый элемент
const newItem = document.createElement('div');
newItem.className = 'item';
list.appendChild(newItem);
// newItem НЕ имеет обработчика click!
```

### Решение 1 — делегирование (предпочтительно)

```javascript
// Обработчик на родителе — работает для всех дочерних элементов
document.querySelector('#list').addEventListener('click', function(e) {
  const item = e.target.closest('.item');
  if (item) handleClick(item);
});
```

### Решение 2 — добавлять обработчик при создании элемента

```javascript
function createItem(text) {
  const item = document.createElement('li');
  item.textContent = text;
  item.className = 'item';
  item.addEventListener('click', handleClick); // добавляем сразу!
  return item;
}

list.appendChild(createItem('Новый пункт'));
```

### Решение 3 — MutationObserver (для сложных случаев)

```javascript
const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    mutation.addedNodes.forEach(function(node) {
      if (node.classList?.contains('item')) {
        node.addEventListener('click', handleClick);
      }
    });
  });
});

observer.observe(document.querySelector('#list'), { childList: true });
```

---

## 22. Валидация форм через события

Комбинирование событий для качественной UX-валидации.

### Стратегия валидации

```javascript
const form = document.querySelector('#registrationForm');

// Показываем ошибку только после попытки ввода (blur)
function validateField(input) {
  const error = input.nextElementSibling; // элемент с ошибкой
  
  if (input.validity.valid) {
    input.classList.remove('invalid');
    error.textContent = '';
  } else {
    input.classList.add('invalid');
    error.textContent = getErrorMessage(input);
  }
}

function getErrorMessage(input) {
  if (input.validity.valueMissing) return 'Поле обязательно';
  if (input.validity.typeMismatch) return 'Неверный формат';
  if (input.validity.tooShort) return `Минимум ${input.minLength} символов`;
  if (input.validity.patternMismatch) return 'Неверный формат';
  return 'Ошибка ввода';
}

// Валидация при потере фокуса
form.addEventListener('blur', function(e) {
  if (e.target.matches('input, textarea, select')) {
    validateField(e.target);
  }
}, true); // capturing, так как blur не всплывает

// Живая валидация после первой ошибки
form.addEventListener('input', function(e) {
  if (e.target.classList.contains('invalid')) {
    validateField(e.target);
  }
});

// Финальная проверка при отправке
form.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const inputs = form.querySelectorAll('input, textarea, select');
  let isValid = true;
  
  inputs.forEach(input => {
    validateField(input);
    if (!input.validity.valid) isValid = false;
  });
  
  if (isValid) {
    submitForm();
  } else {
    form.querySelector('.invalid')?.focus(); // фокус на первую ошибку
  }
});
```

### Встроенная валидация браузера (Constraint Validation API)

```html
<input 
  type="email" 
  required 
  minlength="5" 
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
>
```

```javascript
input.validity.valid        // true если всё ок
input.validity.valueMissing // required поле пустое
input.validity.typeMismatch // неверный тип (email, url)
input.validity.tooShort     // меньше minlength
input.validity.tooLong      // больше maxlength
input.validity.patternMismatch // не совпадает с pattern
input.checkValidity()       // возвращает true/false
input.reportValidity()      // показывает встроенный tooltip
```

---

## 23. mouseenter / mouseleave

Срабатывают при **входе и выходе** курсора из элемента.

```javascript
const card = document.querySelector('.card');

card.addEventListener('mouseenter', function() {
  this.classList.add('hovered');
});

card.addEventListener('mouseleave', function() {
  this.classList.remove('hovered');
});
```

### Отличие от mouseover/mouseout

| Событие | Всплытие | Реагирует на дочерние |
|---|---|---|
| `mouseenter` | ❌ Нет | ❌ Нет |
| `mouseleave` | ❌ Нет | ❌ Нет |
| `mouseover` | ✅ Да | ✅ Да |
| `mouseout` | ✅ Да | ✅ Да |

```javascript
// mouseenter/mouseleave — срабатывает один раз при входе/выходе из контейнера
// mouseover/mouseout — срабатывает при каждом переходе между дочерними элементами
```

### Пример — tooltip

```javascript
const btn = document.querySelector('[data-tooltip]');

btn.addEventListener('mouseenter', function(e) {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = e.target.dataset.tooltip;
  
  // Позиционирование
  const rect = btn.getBoundingClientRect();
  tooltip.style.top = `${rect.top - 40}px`;
  tooltip.style.left = `${rect.left}px`;
  
  document.body.appendChild(tooltip);
});

btn.addEventListener('mouseleave', function() {
  document.querySelector('.tooltip')?.remove();
});
```

---

## 24. Scroll events

Событие `scroll` срабатывает при прокрутке страницы или элемента.

### Базовое использование

```javascript
window.addEventListener('scroll', function() {
  console.log(window.scrollY); // текущая позиция прокрутки
});

// Для конкретного элемента
const container = document.querySelector('.scroll-container');
container.addEventListener('scroll', function() {
  console.log(container.scrollTop);
});
```

### Полезные свойства

```javascript
window.scrollY          // пикселей прокручено вертикально
window.scrollX          // пикселей прокручено горизонтально
document.documentElement.scrollTop // то же, кросс-браузерно

// Размеры
window.innerHeight      // видимая высота окна
document.body.scrollHeight // полная высота страницы
```

### Частые задачи со скроллом

```javascript
// 1. Кнопка "наверх"
const backToTop = document.querySelector('#back-to-top');

window.addEventListener('scroll', throttle(function() {
  if (window.scrollY > 300) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}, 100));

backToTop.addEventListener('click', function() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 2. Фиксация шапки
const header = document.querySelector('header');
window.addEventListener('scroll', function() {
  header.classList.toggle('sticky', window.scrollY > 0);
});

// 3. Infinite scroll (бесконечная прокрутка)
window.addEventListener('scroll', throttle(function() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    loadMoreContent(); // загрузить ещё данные
  }
}, 200));

// 4. Прогресс-бар чтения
window.addEventListener('scroll', function() {
  const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  document.querySelector('.progress-bar').style.width = `${scrolled}%`;
});
```

### IntersectionObserver — современная альтернатива

```javascript
// Вместо отслеживания scroll вручную — используй IntersectionObserver
const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 }); // 10% элемента видно

document.querySelectorAll('.animate-on-scroll').forEach(el => {
  observer.observe(el);
});
```

---

## 25. this и стрелочные функции в обработчиках

Одно из самых частых мест путаницы в JavaScript.

### this в обычной функции

В обычной функции-обработчике `this` указывает на **элемент**, к которому привязан обработчик (то есть `currentTarget`):

```javascript
const btn = document.querySelector('#btn');

btn.addEventListener('click', function() {
  console.log(this);          // <button id="btn">
  console.log(this === btn);  // true
  this.classList.toggle('active'); // работает!
});
```

### this в стрелочной функции

Стрелочные функции **не имеют собственного `this`**. Они берут `this` из внешнего (лексического) контекста:

```javascript
btn.addEventListener('click', () => {
  console.log(this); // window (или undefined в strict mode)!
  // this НЕ равен кнопке
});
```

### Практические выводы

```javascript
// Используй обычную функцию, если нужен this как элемент:
btn.addEventListener('click', function() {
  this.textContent = 'Нажато!'; // ✓
});

// Используй стрелочную функцию, если нужен this из внешнего класса/объекта:
class App {
  constructor() {
    this.count = 0;
    const btn = document.querySelector('#btn');
    
    // Стрелочная — this = экземпляр App
    btn.addEventListener('click', () => {
      this.count++; // ✓ this = App
      console.log(this.count);
    });
    
    // Обычная — this = btn, не App!
    btn.addEventListener('click', function() {
      this.count++; // ✗ this.count = undefined (btn не имеет count)
    });
  }
}
```

### Bind — явная привязка this

```javascript
class App {
  constructor() {
    this.count = 0;
    this.handleClick = this.handleClick.bind(this); // привязываем
    document.querySelector('#btn').addEventListener('click', this.handleClick);
  }
  
  handleClick() {
    this.count++; // this = App ✓
    console.log(this.count);
  }
  
  destroy() {
    // Можно удалить, так как это именованная функция
    document.querySelector('#btn').removeEventListener('click', this.handleClick);
  }
}
```

### Таблица сравнения

| Ситуация | Что использовать |
|---|---|
| Нужен `this` как DOM-элемент | Обычная функция |
| Нужен `this` из внешнего класса/объекта | Стрелочная функция |
| Нужно удалить обработчик позже | Именованная функция (не анонимная) |
| Метод класса как обработчик | `bind(this)` или стрелочное поле класса |

### Стрелочное поле класса (Class field syntax)

```javascript
class App {
  count = 0;
  
  // Стрелочное поле — автоматически привязан правильный this
  handleClick = () => {
    this.count++;
  }
  
  init() {
    btn.addEventListener('click', this.handleClick);
  }
  
  destroy() {
    btn.removeEventListener('click', this.handleClick); // можно удалить ✓
  }
}
```

---

## Быстрая шпаргалка

```javascript
// Добавить обработчик
el.addEventListener('click', handler, { once, capture, passive });

// Удалить обработчик (та же функция!)
el.removeEventListener('click', handler);

// Объект события
e.type           // тип события
e.target         // источник события
e.currentTarget  // где обработчик (= this в обычной функции)
e.preventDefault()    // отменить действие браузера
e.stopPropagation()   // остановить всплытие

// Всплытие: target → parent → ... → document
// Нет всплытия: focus, blur, mouseenter, mouseleave

// Делегирование
parent.addEventListener('click', e => {
  const item = e.target.closest('.item');
  if (!item) return;
  // обработка
});

// Debounce
const debouncedFn = debounce(fn, 300);
input.addEventListener('input', debouncedFn);

// this в обработчиках:
// function() {} → this = элемент
// () => {}      → this = внешний контекст
```

---

*Конспект охватывает основные концепции DOM-событий, необходимые для уверенной работы с интерактивностью в браузере.*
