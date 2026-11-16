
'use strict';

const STORAGE_KEYS = {
  favorites: 'randomIdeaFavorites',
  history: 'randomIdeaHistory',
  settings: 'randomIdeaSettings'
};

const data = {
  genres: {
    fantasy: {
      label: 'Фэнтези',
      settings: ['древнее королевство', 'затерянный храм', 'магическая академия', 'лес, который меняет дороги'],
      conflicts: ['последний дракон требует вернуть украденное имя', 'магия исчезает каждый раз, когда герой говорит правду', 'наследник престола должен заключить союз с врагом']
    },
    drama: {
      label: 'Драма',
      settings: ['небольшой приморский город', 'семейный дом перед продажей', 'университетский кампус', 'ночной поезд'],
      conflicts: ['старые друзья узнают, что помнят одно событие по-разному', 'герой получает письмо, которое опоздало на двадцать лет', 'семейная тайна ставит под угрозу долгожданное примирение']
    },
    horror: {
      label: 'Хоррор',
      settings: ['заброшенная метеостанция', 'посёлок за густым лесом', 'пустая больница', 'дом с заколоченными окнами'],
      conflicts: ['по радио каждую ночь называют имя следующей пропавшей жертвы', 'зеркала показывают комнату, которой нет', 'местные жители делают вид, что не замечают второго солнца']
    }
  },
  heroes: [
    'молодой архивариус',
    'бывшая исследовательница',
    'молчаливый картограф',
    'неопытный целитель',
    'человек, потерявший память'
  ],
  twists: [
    'но самый важный свидетель — это сам рассказчик',
    'каждая найденная подсказка меняет прошлое героя',
    'помощник скрывает причину, по которой согласился помочь'
  ],
  names: {
    fantasy: {
      female: ['Элиара', 'Мирель', 'Таэна', 'Лиорис'],
      male: ['Эрдан', 'Каэль', 'Тарион', 'Вальрик'],
      any: ['Ариэль', 'Рен', 'Сайри', 'Эллис']
    },
    drama: {
      female: ['Анна', 'Вера', 'Мария', 'Полина'],
      male: ['Илья', 'Марк', 'Артём', 'Даниил'],
      any: ['Саша', 'Женя', 'Алекс', 'Ренат']
    },
    horror: {
      female: ['Морена', 'Лилит', 'Нора', 'Эстер'],
      male: ['Виктор', 'Эдгар', 'Мирон', 'Северин'],
      any: ['Эш', 'Рэй', 'Сэм', 'Роуэн']
    }
  },
  racePrefixes: {
    human: '',
    elf: 'эльфийское имя: ',
    dwarf: 'дварфийское имя: ',
    orc: 'орочье имя: ',
    android: 'обозначение андроида: '
  },
  places: {
    fantasy: ['Серебролесье', 'Эльмарион', 'Туманный Предел', 'Астервальд', 'Лунные Врата'],
    drama: ['Берег Надежды', 'Старый Причал', 'Сосновый Посад', 'Тихая Гавань', 'Южный Сквер'],
    horror: ['Чёрная Отмель', 'Посёлок Без Эха', 'Мёртвый Перевал', 'Станция Полночь', 'Пепельный Бор']
  }
};

let currentIdea = '';
let favorites = load(STORAGE_KEYS.favorites, []);
let history = load(STORAGE_KEYS.history, []);
let settings = load(STORAGE_KEYS.settings, {
  contentType: 'plot',
  genre: 'fantasy',
  race: 'human',
  gender: 'any',
  seed: '',
  absurdity: 35
});

const $ = id => document.getElementById(id);

const controls = [
  'contentType',
  'genre',
  'race',
  'gender',
  'seed',
  'absurdity'
];

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn('Не удалось прочитать сохранённые данные:', error);
    return fallback;
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch (error) {
    showError('Не удалось сохранить данные. Проверьте свободное место в браузере.');
  }
}

function showError(message) {
  $('ideaBox').textContent = message;
  $('resultType').textContent = 'Ошибка';
}

function hashSeed(value) {
  let hash = 2166136261;

  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function randomGenerator(seed) {
  let state = hashSeed(seed || `${Date.now()}-${Math.random()}`);

  return () => {
    state += 0x6D2B79F5;

    let t = state;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);

    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function pick(items, random) {
  return items[Math.floor(random() * items.length)];
}

function generateIdea() {
  try {
    settings = readSettings();

    const random = randomGenerator(settings.seed);
    const genre = data.genres[settings.genre];

    let result;
    let typeLabel;

    if (settings.contentType === 'plot') {
      const realism = Number(settings.absurdity);

      const surreal = realism >= 65
        ? ' В этой истории привычные законы мира постепенно перестают работать.'
        : realism <= 25
          ? ' События развиваются в реалистичных обстоятельствах.'
          : '';

      result =
        `Жанр: ${genre.label}.\n` +
        `Место действия: ${pick(genre.settings, random)}.\n` +
        `Главный герой: ${pick(data.heroes, random)}.\n` +
        `Конфликт: ${pick(genre.conflicts, random)}.\n` +
        `Поворот: ${pick(data.twists, random)}.${surreal}`;

      typeLabel = 'Сюжет';

    } else if (settings.contentType === 'character') {
      const gender = settings.gender;
      const name = pick(data.names[settings.genre][gender], random);

      const race = {
        human: 'человек',
        elf: 'эльф',
        dwarf: 'дварф',
        orc: 'орк',
        android: 'андроид'
      }[settings.race];

      result =
        `${data.racePrefixes[settings.race]}${name}\n` +
        `Раса: ${race}. Жанр: ${genre.label}.`;

      typeLabel = 'Имя персонажа';

    } else {
      const place = pick(data.places[settings.genre], random);

      const suffix = Number(settings.absurdity) >= 65
        ? ' — место, где карта каждый день меняет очертания.'
        : '';

      result = `${place}${suffix}\nСтиль: ${genre.label}.`;
      typeLabel = 'Название локации';
    }

    currentIdea = result;

    $('ideaBox').textContent = result;
    $('resultType').textContent = typeLabel;
    $('saveButton').disabled = false;
    $('copyButton').disabled = false;

    history.unshift({
      text: result,
      type: typeLabel,
      date: new Date().toLocaleString('ru-RU')
    });

    history = history.slice(0, 30);

    persist();
    renderLists();

  } catch (error) {
    console.error(error);
    showError('Не удалось создать идею. Проверьте настройки и попробуйте ещё раз.');
  }
}

function readSettings() {
  return {
    contentType: $('contentType').value,
    genre: $('genre').value,
    race: $('race').value,
    gender: $('gender').value,
    seed: $('seed').value.trim(),
    absurdity: Number($('absurdity').value)
  };
}

function saveFavorite() {
  if (!currentIdea) return;

  if (favorites.some(item => item.text === currentIdea)) {
    alert('Эта идея уже есть в избранном.');
    return;
  }

  favorites.unshift({
    text: currentIdea,
    date: new Date().toLocaleString('ru-RU')
  });

  persist();
  renderLists();
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const area = document.createElement('textarea');
    area.value = text;

    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
}

function renderLists() {
  renderCollection('favoritesList', favorites, true);
  renderCollection('historyList', history, false);
}

function renderCollection(elementId, items, removable) {
  const root = $(elementId);
  root.replaceChildren();

  if (!items.length) {
    const empty = document.createElement('p');

    empty.className = 'empty-state';

    empty.textContent = elementId === 'favoritesList'
      ? 'Пока здесь пусто.'
      : 'История появится после первой генерации.';

    root.append(empty);
    return;
  }

  items.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'idea-item';

    const p = document.createElement('p');
    p.textContent = item.text;
    card.append(p);

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const copy = document.createElement('button');
    copy.textContent = 'Копировать';
    copy.addEventListener('click', () => copyText(item.text));

    actions.append(copy);

    if (removable) {
      const remove = document.createElement('button');

      remove.className = 'remove';
      remove.textContent = 'Удалить';

      remove.addEventListener('click', () => {
        favorites.splice(index, 1);
        persist();
        renderLists();
      });

      actions.append(remove);
    }

    card.append(actions);
    root.append(card);
  });
}

function exportTxt() {
  if (!favorites.length) {
    alert('В избранном пока нет идей.');
    return;
  }

  const content = favorites
    .map((x, i) => `${i + 1}. ${x.text}`)
    .join('\n\n---\n\n');

  downloadFile(
    'izbrannoe.txt',
    content,
    'text/plain;charset=utf-8'
  );
}

function exportDocx() {
  if (!favorites.length) {
    alert('В избранном пока нет идей.');
    return;
  }

  const paragraphs = favorites
    .map((x, i) =>
      `<w:p><w:r><w:t xml:space="preserve">${escapeXml(`${i + 1}. ${x.text}`)}</w:t></w:r></w:p>`
    )
    .join('');

  const documentXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
    `<w:body>${paragraphs}<w:sectPr/></w:body></w:document>`;

  const contentTypes =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '</Types>';

  const rels =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '</Relationships>';

  const zip = createZip([
    ['[Content_Types].xml', contentTypes],
    ['_rels/.rels', rels],
    ['word/document.xml', documentXml]
  ]);

  downloadFile(
    'izbrannoe.docx',
    zip,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
}

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, ch => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;'
  }[ch]));
}

function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();

  URL.revokeObjectURL(url);
}

/* Минимальная ZIP-упаковка для формирования настоящего .docx без внешних библиотек. */
function createZip(entries) {
  const encoder = new TextEncoder();

  const local = [];
  const central = [];

  let offset = 0;

  const crcTable = createCrcTable();

  const crc32 = bytes => {
    let c = 0xffffffff;

    for (const b of bytes) {
      c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
    }

    return (c ^ 0xffffffff) >>> 0;
  };

  const u16 = n => [
    n & 255,
    n >>> 8 & 255
  ];

  const u32 = n => [
    n & 255,
    n >>> 8 & 255,
    n >>> 16 & 255,
    n >>> 24 & 255
  ];

  const join = arrays => {
    const out = new Uint8Array(
      arrays.reduce((s, a) => s + a.length, 0)
    );

    let p = 0;

    arrays.forEach(a => {
      out.set(a, p);
      p += a.length;
    });

    return out;
  };

  entries.forEach(([name, content]) => {
    const n = encoder.encode(name);
    const d = encoder.encode(content);
    const crc = crc32(d);

    const header = new Uint8Array([
      ...u32(0x04034b50),
      ...u16(20),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(d.length),
      ...u32(d.length),
      ...u16(n.length),
      ...u16(0)
    ]);

    local.push(header, n, d);

    const ch = new Uint8Array([
      ...u32(0x02014b50),
      ...u16(20),
      ...u16(20),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(d.length),
      ...u32(d.length),
      ...u16(n.length),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(offset)
    ]);

    central.push(ch, n);

    offset += header.length + n.length + d.length;
  });

  const centralBytes = join(central);
  const localBytes = join(local);

  const end = new Uint8Array([
    ...u32(0x06054b50),
    ...u16(0),
    ...u16(0),
    ...u16(entries.length),
    ...u16(entries.length),
    ...u32(centralBytes.length),
    ...u32(localBytes.length),
    ...u16(0)
  ]);

  return join([
    localBytes,
    centralBytes,
    end
  ]);
}

function createCrcTable() {
  const table = new Uint32Array(256);

  for (let n = 0; n < 256; n++) {
    let c = n;

    for (let k = 0; k < 8; k++) {
      c = c & 1
        ? 0xedb88320 ^ c >>> 1
        : c >>> 1;
    }

    table[n] = c >>> 0;
  }

  return table;
}

function clearHistory() {
  if (!confirm('Очистить историю генераций?')) return;

  history = [];

  persist();
  renderLists();
}

function init() {
  controls.forEach(id => {
    if ($(id) && settings[id] !== undefined) {
      $(id).value = settings[id];
    }
  });

  $('absurdityValue').textContent =
    `${$('absurdity').value}%`;

  controls.forEach(id => {
    $(id).addEventListener('change', () => {
      settings = readSettings();
      persist();
    });
  });

  $('absurdity').addEventListener('input', () => {
    $('absurdityValue').textContent =
      `${$('absurdity').value}%`;
  });

  $('generateButton').addEventListener('click', generateIdea);
  $('saveButton').addEventListener('click', saveFavorite);

  $('copyButton').addEventListener('click', () => {
    if (currentIdea) copyText(currentIdea);
  });

  $('exportTxtButton').addEventListener('click', exportTxt);
  $('exportDocxButton').addEventListener('click', exportDocx);
  $('clearHistoryButton').addEventListener('click', clearHistory);

  renderLists();
}

document.addEventListener('DOMContentLoaded', init);
