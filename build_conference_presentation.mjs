import { Presentation, PresentationFile } from "file:///C:/Users/shibi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const OUT = "C:/BSU/lababot/students/Шибитов/Kursovoi_Project/smart_calendar_conference_12_slides.pptx";

const W = 1280;
const H = 720;

const C = {
  bg: "#f8fafc",
  white: "#ffffff",
  emerald: "#10b981",
  emeraldDark: "#047857",
  emeraldLight: "#d1fae5",
  slate900: "#0f172a",
  slate800: "#1e293b",
  slate600: "#475569",
  slate500: "#64748b",
  slate300: "#cbd5e1",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  blue: "#3b82f6",
  blueLight: "#dbeafe",
  amber: "#fbbf24",
  amberLight: "#fef3c7",
  purple: "#7c3aed",
};

const FONT = {
  title: "Poppins",
  body: "Lato",
};

const presentation = Presentation.create({
  slideSize: { width: W, height: H },
});

presentation.theme.colorScheme = {
  name: "Smart Calendar",
  themeColors: {
    accent1: C.emerald,
    accent2: C.blue,
    accent3: C.amber,
    bg1: C.bg,
    bg2: C.white,
    tx1: C.slate900,
    tx2: C.slate600,
  },
};

function shape(slide, geometry, x, y, w, h, fill = C.white, line = null, radius = 16667) {
  const s = slide.shapes.add({
    geometry,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: line ?? { width: 0, fill: fill },
    ...(geometry === "roundRect" ? { adjustmentList: [{ name: "adj", formula: `val ${radius}` }] } : {}),
  });
  return s;
}

function text(slide, value, x, y, w, h, opts = {}) {
  const s = slide.shapes.add({
    geometry: "rect",
    position: { left: x, top: y, width: w, height: h },
    fill: "#FFFFFF00",
    line: { width: 0, fill: "#FFFFFF00" },
  });
  s.text = value;
  s.text.typeface = opts.typeface ?? FONT.body;
  s.text.fontSize = opts.size ?? 24;
  s.text.color = opts.color ?? C.slate800;
  s.text.bold = opts.bold ?? false;
  s.text.alignment = opts.align ?? "left";
  s.text.verticalAlignment = opts.valign ?? "top";
  s.text.insets = opts.insets ?? { left: 0, right: 0, top: 0, bottom: 0 };
  if (opts.autoFit) s.text.autoFit = opts.autoFit;
  return s;
}

function title(slide, value, subtitle = "") {
  text(slide, value, 64, 42, 780, 54, { typeface: FONT.title, size: 34, bold: true, color: C.slate900 });
  if (subtitle) text(slide, subtitle, 64, 93, 860, 32, { size: 17, color: C.slate500 });
}

function footer(slide, n) {
  shape(slide, "ellipse", 1180, 642, 46, 46, C.emerald);
  text(slide, String(n).padStart(2, "0"), 1180, 653, 46, 22, { size: 15, bold: true, color: C.white, align: "center" });
  shape(slide, "rect", 64, 666, 1030, 2, C.slate200);
  text(slide, "Умный Календарь · научная конференция студентов и аспирантов БГУ", 64, 676, 700, 22, { size: 12, color: C.slate500 });
}

function headerSlide(n, heading, sub = "") {
  const slide = presentation.slides.add();
  slide.background.fill = C.bg;
  shape(slide, "roundRect", 1060, -72, 260, 260, C.emeraldLight, null, 50000);
  shape(slide, "roundRect", 1100, 94, 110, 110, C.emerald, null, 40000);
  text(slide, "УК", 1100, 128, 110, 38, { size: 32, bold: true, color: C.white, align: "center", typeface: FONT.title });
  title(slide, heading, sub);
  footer(slide, n);
  return slide;
}

function bullet(slide, s, x, y, w, color = C.emerald) {
  shape(slide, "ellipse", x, y + 8, 10, 10, color);
  text(slide, s, x + 22, y, w, 34, { size: 21, color: C.slate800, autoFit: "shrinkText" });
}

function card(slide, x, y, w, h, heading, body, accent = C.emerald) {
  shape(slide, "roundRect", x + 5, y + 7, w, h, "#00000010", { width: 0, fill: "#00000000" }, 12000);
  shape(slide, "roundRect", x, y, w, h, C.white, { width: 1, fill: C.slate200 }, 12000);
  shape(slide, "roundRect", x + 22, y + 22, 42, 42, `${accent}22`, { width: 0, fill: "#FFFFFF00" }, 13000);
  shape(slide, "ellipse", x + 35, y + 35, 16, 16, accent);
  text(slide, heading, x + 78, y + 20, w - 98, 27, { size: 21, bold: true, color: C.slate900, typeface: FONT.title });
  text(slide, body, x + 78, y + 55, w - 98, h - 70, { size: 16, color: C.slate600, autoFit: "shrinkText" });
}

function calendarMock(slide, x, y, w, h) {
  shape(slide, "roundRect", x, y, w, h, C.white, { width: 1, fill: C.slate200 }, 13000);
  text(slide, "Май 2026", x + 28, y + 24, 200, 32, { size: 25, bold: true, color: C.slate900, typeface: FONT.title });
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  days.forEach((d, i) => text(slide, d, x + 28 + i * 56, y + 74, 40, 20, { size: 12, color: C.slate500, align: "center" }));
  let n = 1;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 7; c++) {
      const cx = x + 28 + c * 56;
      const cy = y + 104 + r * 50;
      shape(slide, "roundRect", cx, cy, 44, 38, n === 11 ? C.emeraldLight : C.slate100, { width: 0, fill: "#FFFFFF00" }, 8000);
      text(slide, String(n), cx, cy + 8, 44, 17, { size: 12, bold: n === 11, color: n === 11 ? C.emeraldDark : C.slate600, align: "center" });
      if ([3, 7, 11, 16, 22, 27].includes(n)) {
        shape(slide, "ellipse", cx + 11, cy + 28, 6, 6, C.emerald);
        shape(slide, "ellipse", cx + 20, cy + 28, 6, 6, n % 2 ? C.blue : C.amber);
      }
      n++;
      if (n > 31) break;
    }
  }
}

function phoneMock(slide, x, y) {
  shape(slide, "roundRect", x, y, 210, 410, C.slate900, { width: 0, fill: "#FFFFFF00" }, 26000);
  shape(slide, "roundRect", x + 12, y + 16, 186, 378, C.bg, { width: 0, fill: "#FFFFFF00" }, 20000);
  text(slide, "Умный Календарь", x + 30, y + 44, 150, 24, { size: 14, bold: true, color: C.slate800, align: "center" });
  shape(slide, "roundRect", x + 32, y + 86, 146, 36, C.white, { width: 1, fill: C.slate200 }, 9000);
  text(slide, "Сегодня", x + 50, y + 96, 90, 16, { size: 12, color: C.slate800 });
  for (let i = 0; i < 4; i++) {
    const yy = y + 142 + i * 48;
    shape(slide, "roundRect", x + 30, yy, 150, 34, [C.emeraldLight, C.blueLight, C.amberLight, C.slate100][i], { width: 0, fill: "#FFFFFF00" }, 8000);
    shape(slide, "rect", x + 30, yy, 4, 34, [C.emerald, C.blue, C.amber, C.slate500][i]);
  }
  shape(slide, "roundRect", x + 28, y + 338, 154, 34, C.white, { width: 1, fill: C.slate200 }, 10000);
  ["●", "●", "●"].forEach((d, i) => text(slide, d, x + 58 + i * 36, y + 344, 20, 18, { size: 14, color: [C.emerald, C.blue, C.amber][i], align: "center" }));
}

function addNotes(slide, speaker) {
  slide.speakerNotes.setText(speaker);
}

// 1
{
  const slide = presentation.slides.add();
  slide.background.fill = C.bg;
  shape(slide, "roundRect", 70, 74, 1140, 560, C.white, { width: 1, fill: C.slate200 }, 19000);
  shape(slide, "roundRect", 875, 126, 260, 260, C.emeraldLight, null, 50000);
  shape(slide, "roundRect", 936, 186, 136, 136, C.emerald, null, 36000);
  text(slide, "УК", 936, 229, 136, 42, { size: 40, bold: true, color: C.white, align: "center", typeface: FONT.title });
  text(slide, "Реализация Web-приложения", 118, 162, 600, 42, { size: 26, color: C.slate500, typeface: FONT.title });
  text(slide, "«Умный календарь»", 118, 212, 680, 78, { size: 50, bold: true, color: C.slate900, typeface: FONT.title });
  text(slide, "Шибитов Николай · Белорусский государственный университет", 122, 328, 720, 30, { size: 20, color: C.slate600 });
  shape(slide, "roundRect", 122, 394, 410, 48, C.emerald, null, 12000);
  text(slide, "Доклад для научной конференции", 142, 407, 370, 22, { size: 18, bold: true, color: C.white, align: "center" });
  calendarMock(slide, 760, 355, 300, 210);
  addNotes(slide, "Добрый день. Тема моего доклада — реализация Web-приложения «Умный календарь». Работа посвящена созданию приложения для управления событиями, задачами, заметками и анализа пользовательской активности.");
}

// 2
{
  const slide = headerSlide(2, "Актуальность", "Почему задача персонального планирования остается важной");
  card(slide, 86, 165, 320, 150, "Много задач", "Учеба, встречи, дедлайны и личные дела конкурируют за внимание пользователя.", C.emerald);
  card(slide, 480, 165, 320, 150, "Разные сервисы", "Календарь, заметки и переписка часто хранят связанные данные отдельно.", C.blue);
  card(slide, 874, 165, 320, 150, "Нет общей картины", "Сложнее оценить загруженность и вовремя заметить перегрузку.", C.amber);
  shape(slide, "roundRect", 160, 405, 960, 92, C.emeraldLight, { width: 0, fill: "#FFFFFF00" }, 15000);
  text(slide, "Идея проекта: объединить календарь, задачи, заметки и аналитику в одном интерфейсе", 210, 432, 860, 32, { size: 25, bold: true, color: C.emeraldDark, align: "center", typeface: FONT.title });
  addNotes(slide, "Современный пользователь ежедневно работает с большим количеством событий. Часто они хранятся в разных сервисах, из-за чего информация фрагментируется. Это повышает риск пропуска важных задач и усложняет анализ собственного времени.");
}

// 3
{
  const slide = headerSlide(3, "Анализ существующих решений", "Сильные стороны и ограничения популярных сервисов");
  const xs = [86, 454, 822];
  const data = [
    ["Google Calendar", "Развитый календарь", "Зависимость от экосистемы Google", C.emerald],
    ["Doodle", "Согласование встреч", "Нет полноценного личного календаря", C.blue],
    ["Tweek", "Простой недельный план", "Ограниченная аналитика", C.amber],
  ];
  data.forEach((d, i) => {
    card(slide, xs[i], 170, 310, 245, d[0], `${d[1]}\n\nОграничение: ${d[2]}`, d[3]);
  });
  text(slide, "Вывод: нужна независимая система, объединяющая личный календарь, заметки, аналитику и возможность интеллектуального планирования.", 150, 480, 980, 70, { size: 25, bold: true, color: C.slate800, align: "center", autoFit: "shrinkText" });
  addNotes(slide, "Существующие решения хорошо закрывают отдельные сценарии, но редко объединяют личный календарь, заметки, аналитику и возможность дальнейшего интеллектуального планирования в одном независимом приложении.");
}

// 4
{
  const slide = headerSlide(4, "Цель и задачи", "Что необходимо реализовать в проекте");
  shape(slide, "roundRect", 86, 154, 1108, 98, C.emerald, null, 15000);
  text(slide, "Цель: разработать Web-приложение для управления событиями, задачами и заметками", 128, 183, 1020, 36, { size: 28, bold: true, color: C.white, align: "center", autoFit: "shrinkText", typeface: FONT.title });
  const tasks = ["Спроектировать клиент-серверную архитектуру", "Реализовать авторизацию и хранение данных", "Создать календарь, заметки и аналитику", "Подготовить приложение к локальному развертыванию"];
  tasks.forEach((b, i) => bullet(slide, b, 178, 315 + i * 58, 850, [C.emerald, C.blue, C.amber, C.purple][i]));
  addNotes(slide, "Целью работы стала разработка Web-приложения «Умный календарь». Для достижения цели были поставлены задачи анализа предметной области, проектирования архитектуры, создания модели данных, реализации REST API и разработки адаптивного пользовательского интерфейса.");
}

// 5
{
  const slide = headerSlide(5, "Общая архитектура приложения", "Три уровня: интерфейс, серверная логика и база данных");
  const boxes = [
    ["Frontend", "Next.js · React · TypeScript", 100, 180, C.emerald],
    ["Backend", "FastAPI · REST API · JWT", 490, 180, C.blue],
    ["Database", "PostgreSQL · SQLAlchemy", 880, 180, C.amber],
  ];
  boxes.forEach(([h, b, x, y, col]) => card(slide, x, y, 300, 170, h, b, col));
  shape(slide, "rect", 407, 250, 70, 2, C.slate300, { width: 0, fill: C.slate300 });
  shape(slide, "rect", 797, 250, 70, 2, C.slate300, { width: 0, fill: C.slate300 });
  text(slide, "HTTP / JSON", 414, 215, 80, 24, { size: 14, color: C.slate500, align: "center" });
  text(slide, "SQL", 820, 215, 60, 24, { size: 14, color: C.slate500, align: "center" });
  shape(slide, "roundRect", 180, 465, 920, 72, C.white, { width: 1, fill: C.slate200 }, 14000);
  text(slide, "Разделение ответственности позволяет развивать интерфейс, API и хранение данных независимо.", 220, 486, 840, 28, { size: 24, bold: true, color: C.slate800, align: "center", autoFit: "shrinkText" });
  addNotes(slide, "Приложение построено по клиент-серверной архитектуре. Frontend отвечает за интерфейс и действия пользователя. Backend реализует бизнес-логику, авторизацию и работу с базой данных. PostgreSQL используется как постоянное хранилище данных.");
}

// 6
{
  const slide = headerSlide(6, "Выбор технологий", "Инструменты выбраны под задачи разработки и демонстрации");
  const items = [
    ["React + Next.js", "компоненты и маршрутизация", C.emerald],
    ["TypeScript", "типизация клиента и API", C.blue],
    ["Tailwind CSS", "адаптивная верстка", C.amber],
    ["FastAPI", "быстрый REST API", C.purple],
    ["SQLAlchemy + PostgreSQL", "модель данных и хранение", C.emerald],
    ["Docker Compose", "воспроизводимый запуск", C.blue],
  ];
  items.forEach((it, i) => {
    const x = i % 2 === 0 ? 110 : 660;
    const y = 160 + Math.floor(i / 2) * 125;
    card(slide, x, y, 500, 96, it[0], it[1], it[2]);
  });
  addNotes(slide, "React удобен для построения интерфейса из компонентов, Next.js дает понятную структуру страниц, TypeScript снижает риск ошибок при обмене данными. FastAPI выбран из-за быстрой разработки API и автоматической документации, а PostgreSQL подходит для реляционной модели данных календаря.");
}

// 7
{
  const slide = headerSlide(7, "Модель данных", "Основные сущности и связь с пользователем");
  const centerX = 520, centerY = 265;
  shape(slide, "roundRect", centerX, centerY, 240, 100, C.emerald, null, 15000);
  text(slide, "users", centerX, centerY + 30, 240, 30, { size: 30, bold: true, color: C.white, align: "center", typeface: FONT.title });
  const nodes = [
    ["events", 135, 175, C.blue],
    ["notes", 910, 175, C.amber],
    ["event_templates", 135, 415, C.emerald],
    ["notifications", 910, 415, C.purple],
  ];
  nodes.forEach(([name, x, y, col]) => {
    shape(slide, "roundRect", x, y, 255, 82, C.white, { width: 1, fill: C.slate200 }, 12000);
    shape(slide, "ellipse", x + 24, y + 26, 28, 28, col);
    text(slide, name, x + 68, y + 27, 160, 22, { size: 22, bold: true, color: C.slate800, typeface: FONT.title });
  });
  text(slide, "Ключевая связь: все пользовательские данные привязаны к user_id", 240, 558, 800, 32, { size: 24, bold: true, color: C.emeraldDark, align: "center" });
  addNotes(slide, "Основой приложения является реляционная модель данных. События, заметки, шаблоны и уведомления связаны с конкретным пользователем. Это позволяет изолировать данные разных пользователей и получать только те записи, которые принадлежат текущему аккаунту.");
}

// 8
{
  const slide = headerSlide(8, "Авторизация и безопасность", "JWT-токены и разграничение пользовательских данных");
  const steps = [
    ["1", "Регистрация / вход", "email + пароль"],
    ["2", "Хэширование пароля", "пароль не хранится открыто"],
    ["3", "Access token", "для защищенных запросов"],
    ["4", "Refresh token", "для продления сессии"],
    ["5", "Фильтрация", "данные только текущего пользователя"],
  ];
  steps.forEach((st, i) => {
    const x = 82 + i * 230;
    shape(slide, "roundRect", x, 215, 170, 210, C.white, { width: 1, fill: C.slate200 }, 13000);
    shape(slide, "ellipse", x + 58, 185, 54, 54, i % 2 ? C.blue : C.emerald);
    text(slide, st[0], x + 58, 199, 54, 22, { size: 20, bold: true, color: C.white, align: "center" });
    text(slide, st[1], x + 18, 260, 134, 34, { size: 19, bold: true, color: C.slate900, align: "center", autoFit: "shrinkText", typeface: FONT.title });
    text(slide, st[2], x + 18, 322, 134, 50, { size: 15, color: C.slate600, align: "center", autoFit: "shrinkText" });
  });
  addNotes(slide, "Авторизация реализована на основе JWT-токенов. После входа пользователь получает токены, которые используются при обращении к защищенным маршрутам API. Пароли не хранятся в открытом виде. Сервер определяет пользователя по токену и возвращает только его события и заметки.");
}

// 9
{
  const slide = headerSlide(9, "Основные функции интерфейса", "Календарь, события и заметки в адаптивном UI");
  calendarMock(slide, 70, 155, 470, 355);
  phoneMock(slide, 900, 150);
  const features = ["Месяц и неделя", "CRUD событий", "Встречи · задачи · заметки", "Отдельный раздел заметок", "Адаптивный интерфейс"];
  features.forEach((f, i) => bullet(slide, f, 590, 180 + i * 58, 270, [C.emerald, C.blue, C.amber, C.purple, C.emerald][i]));
  addNotes(slide, "Главный экран приложения — календарь. Пользователь может переключаться между месяцем и неделей, выбирать дату и видеть список событий. Для хранения текстовой информации реализован отдельный раздел заметок. Интерфейс адаптирован для работы как на компьютере, так и на мобильном устройстве.");
}

// 10
{
  const slide = headerSlide(10, "Аналитика и AI-модуль", "От календарных данных к рекомендациям");
  shape(slide, "roundRect", 80, 158, 520, 360, C.white, { width: 1, fill: C.slate200 }, 15000);
  text(slide, "События за неделю", 112, 190, 260, 26, { size: 21, bold: true, color: C.slate900, typeface: FONT.title });
  const bars = [160, 230, 110, 280, 190, 90, 130];
  bars.forEach((v, i) => {
    const x = 120 + i * 60;
    shape(slide, "roundRect", x, 440 - v, 32, v, i % 3 === 0 ? C.emerald : i % 3 === 1 ? C.blue : C.amber, null, 6000);
    text(slide, ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"][i], x - 6, 458, 44, 16, { size: 12, color: C.slate500, align: "center" });
  });
  card(slide, 665, 168, 470, 125, "AI-анализ", "Краткие рекомендации на основе событий и заметок пользователя за неделю.", C.purple);
  card(slide, 665, 325, 470, 125, "Локальная обработка", "Использование Ollama позволяет не отправлять данные во внешние коммерческие сервисы.", C.emerald);
  addNotes(slide, "Раздел аналитики позволяет пользователю оценивать свою активность: сколько событий запланировано, как они распределяются по типам и дням. Дополнительно реализован AI-модуль, который анализирует события и заметки за неделю и формирует краткие рекомендации по продуктивности.");
}

// 11
{
  const slide = headerSlide(11, "Практическая значимость и развитие", "Как проект может применяться и расширяться дальше");
  card(slide, 90, 155, 510, 130, "Практическая значимость", "Единое пространство для календаря, задач и заметок. Подходит для студентов и специалистов.", C.emerald);
  card(slide, 680, 155, 510, 130, "Независимость", "Приложение не привязано к одной внешней экосистеме и может запускаться локально.", C.blue);
  text(slide, "Возможные расширения", 90, 345, 480, 36, { size: 28, bold: true, color: C.slate900, typeface: FONT.title });
  ["Групповое планирование", "Уведомления", "Синхронизация с внешними календарями", "Импорт и экспорт iCal"].forEach((f, i) => {
    shape(slide, "roundRect", 95 + i * 285, 415, 245, 62, [C.emeraldLight, C.blueLight, C.amberLight, C.slate100][i], { width: 0, fill: "#FFFFFF00" }, 12000);
    text(slide, f, 115 + i * 285, 432, 205, 22, { size: 16, bold: true, color: C.slate800, align: "center", autoFit: "shrinkText" });
  });
  addNotes(slide, "Практическая значимость проекта состоит в том, что приложение может использоваться как персональный инструмент планирования. Оно также является основой для дальнейшего развития: можно добавить групповые встречи, уведомления, интеграцию с внешними календарями и более сложные интеллектуальные рекомендации.");
}

// 12
{
  const slide = headerSlide(12, "Выводы", "Результаты реализации Web-приложения");
  const conclusions = [
    "Спроектирована клиент-серверная архитектура",
    "Реализованы авторизация, календарь, события, заметки и аналитика",
    "Использован современный стек Web-разработки",
    "Подготовлено локальное развертывание через Docker",
    "Проект может быть расширен до системы персонального и группового планирования",
  ];
  conclusions.forEach((b, i) => bullet(slide, b, 150, 165 + i * 64, 850, [C.emerald, C.blue, C.amber, C.purple, C.emerald][i]));
  shape(slide, "roundRect", 820, 470, 250, 90, C.emerald, null, 18000);
  text(slide, "Спасибо за внимание", 846, 500, 198, 28, { size: 24, bold: true, color: C.white, align: "center", typeface: FONT.title });
  addNotes(slide, "В результате работы было создано полнофункциональное Web-приложение «Умный календарь». Оно объединяет календарное планирование, заметки, авторизацию и аналитику. Полученный результат подтверждает, что выбранная архитектура подходит для разработки расширяемого приложения.");
}

const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(OUT);
console.log(OUT);
