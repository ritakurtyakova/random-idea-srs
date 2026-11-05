const ideas = [
  "Приложение для учёта привычек",
  "Сервис для обмена книгами",
  "Трекер времени на соцсети",
  "Генератор рецептов из того, что есть в холодильнике",
  "Платформа для поиска попутчиков",
  "Менеджер личных финансов",
  "Игра-тренажёр памяти",
  "Сервис для планирования путешествий"
];

function generateIdea() {
  const ideaBox = document.getElementById('ideaBox');
  const randomIndex = Math.floor(Math.random() * ideas.length);
  ideaBox.textContent = ideas[randomIndex];
}
