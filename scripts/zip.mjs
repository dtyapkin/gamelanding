/**
 * CRC32 — нужен для корректной записи ZIP-архива.
 * Без него распаковщики посчитают файл повреждённым.
 */
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

export function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

/**
 * Собирает ZIP-архив из одного файла (метод «store», без сжатия).
 *
 * Зачем это здесь: скрипту проверки нужен настоящий ZIP, который
 * распакуется и в Windows, и на сервере. Сжатие для теста не нужно,
 * а формат без сжатия пишется корректно и без внешних библиотек —
 * то есть скрипт не тянет за собой зависимостей.
 *
 * @param {string} fileName имя файла внутри архива
 * @param {string} content  текстовое содержимое
 * @returns {Buffer} готовый ZIP
 */
export function createZip(fileName, content) {
  const nameBytes = Buffer.from(fileName, "utf8");
  const dataBytes = Buffer.from(content, "utf8");
  const checksum = crc32(dataBytes);

  // Фиксированная дата: 2024-01-01 00:00. Нужна, потому что в формате
  // DOS-времени 0 — некорректное значение, из-за которого бывают ошибки.
  const dosTime = 0;
  const dosDate = ((2024 - 1980) << 9) | (1 << 5) | 1;

  // --- Локальный заголовок файла -------------------------------------
  const localHeader = Buffer.alloc(30);
  localHeader.writeUInt32LE(0x04034b50, 0); // подпись
  localHeader.writeUInt16LE(20, 4); // версия, достаточная для store
  localHeader.writeUInt16LE(0x0800, 6); // флаг: имя файла в UTF-8
  localHeader.writeUInt16LE(0, 8); // метод: без сжатия
  localHeader.writeUInt16LE(dosTime, 10);
  localHeader.writeUInt16LE(dosDate, 12);
  localHeader.writeUInt32LE(checksum, 14);
  localHeader.writeUInt32LE(dataBytes.length, 18); // сжатый размер
  localHeader.writeUInt32LE(dataBytes.length, 22); // исходный размер
  localHeader.writeUInt16LE(nameBytes.length, 26);
  localHeader.writeUInt16LE(0, 28); // extra

  const localPart = Buffer.concat([localHeader, nameBytes, dataBytes]);

  // --- Запись в центральном каталоге ---------------------------------
  const centralHeader = Buffer.alloc(46);
  centralHeader.writeUInt32LE(0x02014b50, 0); // подпись
  centralHeader.writeUInt16LE(20, 4); // версия
  centralHeader.writeUInt16LE(20, 6); // версия
  centralHeader.writeUInt16LE(0x0800, 8); // флаг: UTF-8
  centralHeader.writeUInt16LE(0, 10); // метод
  centralHeader.writeUInt16LE(dosTime, 12);
  centralHeader.writeUInt16LE(dosDate, 14);
  centralHeader.writeUInt32LE(checksum, 16);
  centralHeader.writeUInt32LE(dataBytes.length, 20);
  centralHeader.writeUInt32LE(dataBytes.length, 24);
  centralHeader.writeUInt16LE(nameBytes.length, 28);
  centralHeader.writeUInt16LE(0, 30); // extra
  centralHeader.writeUInt16LE(0, 32); // комментарий
  centralHeader.writeUInt16LE(0, 34); // номер диска
  centralHeader.writeUInt16LE(0, 36); // внутренние атрибуты
  centralHeader.writeUInt32LE(0, 38); // внешние атрибуты
  centralHeader.writeUInt32LE(0, 42); // смещение локального заголовка

  const centralPart = Buffer.concat([centralHeader, nameBytes]);

  // --- Конец центрального каталога ----------------------------------
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4); // диск
  endRecord.writeUInt16LE(0, 6); // диск с каталогом
  endRecord.writeUInt16LE(1, 8); // записей на этом диске
  endRecord.writeUInt16LE(1, 10); // всего записей
  endRecord.writeUInt32LE(centralPart.length, 12);
  endRecord.writeUInt32LE(localPart.length, 16); // смещение каталога
  endRecord.writeUInt16LE(0, 20); // комментарий

  return Buffer.concat([localPart, centralPart, endRecord]);
}