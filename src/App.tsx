import { useState, useEffect } from 'react';
import { TonConnectUI, SendTransactionRequest, Wallet, Account } from '@tonconnect/ui';
import React from 'react';
import NotificationToast from './NotificationToast'; // Импортируем новый компонент уведомлений

// Декларация для Telegram WebApp API
// Это сообщает TypeScript, что объект Telegram.WebApp будет существовать на window.
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: any; // Можно уточнить этот тип, если нужно
        version: string;
        platform: string;
        isClosingConfirmationEnabled: boolean;
        headerColor: string;
        backgroundColor: string;
        BackButton: any; // Добавьте другие свойства, если используете их
        MainButton: any;
        HapticFeedback: any;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        themeParams: any;
        colorScheme: string;
        onEvent: (eventType: string, callback: (...args: any[]) => void) => void;
        offEvent: (eventType: string, callback: (...args: any[]) => void) => void;
        sendData: (data: string) => void;
        ready: () => void;
        expand: () => void;
        close: () => void;
        // Добавьте другие методы и свойства WebApp API по мере необходимости
      };
    };
  }

  // Декларация для веб-компонента <lottie-player>
  // Это сообщает TypeScript, что элемент <lottie-player> существует
  // и какие атрибуты он может принимать.
  namespace JSX {
    interface IntrinsicElements {
      'lottie-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        background?: string;
        speed?: string;
        loop?: string; // Использует строки "true'='false"
        autoplay?: string; // Использует строки "true'='false"
        controls?: string;
        mode?: string;
        direction?: string;
        hover?: string;
        // Добавьте другие атрибуты, если вы их используете
      };
    }
  }
}

let id = 0;
let imya = '';
let auto = 0;
let mistaked = 0;
let welled = 0;
let volume = 0;
let photo = '';
let place = 0;
let usdtHave = 0;
let lang = "en";

let giftsLavkaArray = [
    { name: "string", num: "#0", usdtValue: 0, time: 0, animationUrl: "string" },
  ];
let inventoryArray = [
    { name: "string", num: "#0", usdtValue: 0, animationUrl: "string", selected: false },
  ];
let debtsArray = [
    { id: '#Иван', items: ["80"], animationUrl: 'https://placehold.co/40x40/FF5733/ffffff?text=U1' },
  ];
let historyArray = [
    { id: '13697-2', name: 'Love Candle', price: '4', date: 17877464333, type: 'Bid', imageUrl: 'https://nft.fragment.com/gift/lovecandle-6304.lottie.json', url: 'https://example.com/history/13697-2' },
  ];
let ratingArray = [
    { name: 'Иван', volume: 1500, welled: 120, mistaked: 80, photo: 'https://placehold.co/40x40/FF5733/ffffff?text=U1' },
  ];

//const [activeTab, setActiveTab] = useState('lavka'); // ошибка была

// MATH
function shorter(str: string) {
  const startLength = 4;
  const endLength = 4;

  // Если строка достаточно короткая, чтобы не требовать сокращения
  // (например, её длина меньше или равна сумме желаемых длин начала и конца + 3 точки)
  if (str.length <= startLength + endLength + 3) {
    return str;
  }

  // Извлекаем начало и конец строки
  const start = str.substring(0, startLength);
  const end = str.substring(str.length - endLength);

  return `${start}...${end}`;
}
function toDouble(nanoTonAmount: number) { // ДЛя usdt!!!
  // 1 TON = 1,000,000,000 NanoTON
  const TON_PER_NANOTON = 1_000_000;

  // Конвертируем нанотон в тон
  const tonAmount = nanoTonAmount / TON_PER_NANOTON;

  // Округляем до двух знаков после запятой
  // toFixed(2) возвращает строку, поэтому преобразуем обратно в число, если нужно
  return parseFloat(tonAmount.toFixed(2));
}
function convertMixedNftUrlsToReadableArray(urls: string[]): Array<string | null> {
    if (!Array.isArray(urls)) {
        console.error("Входные данные должны быть массивом строк.");
        return [];
    }

    // Регулярные выражения для каждого типа URL
    const telegramNftRegex = /https:\/\/t\.me\/nft\/([a-zA-Z0-9-]+)-(\d+)/;
    const fragmentNftRegex = /https:\/\/nft\.fragment\.com\/gift\/([a-zA-Z0-9-]+)-(\d+)\.lottie\.json/;

    return urls.map(url => {
        let match;
        let nftName;
        let nftId;

        // Попытка сопоставить с форматом Telegram NFT
        match = url.match(telegramNftRegex);
        if (match && match.length === 3) {
            nftName = match[1];
            nftId = match[2];
            // Логика форматирования названия
            nftName = nftName.replace(/-/g, ' ');
            nftName = nftName.split(' ').map(word => {
                if (word.length === 0) return '';
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }).join(' ');
            return `${nftName} #${nftId}`;
        }

        // Если не Telegram NFT, попытка сопоставить с форматом Fragment NFT
        match = url.match(fragmentNftRegex);
        if (match && match.length === 3) {
            nftName = match[1];
            nftId = match[2];
            // Логика форматирования названия
            nftName = nftName.replace(/-/g, ' ');
            nftName = nftName.split(' ').map(word => {
                if (word.length === 0) return '';
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }).join(' ');
            return `${nftName} #${nftId}`;
        }

        // Если ни один формат не подошел
        console.warn(`URL "${url}" не соответствует известному формату NFT. Будет возвращен null.`);
        return null;
    });
}
/*function convertTelegramNftUrlToReadable(urls: string[]) {
    if (!Array.isArray(urls)) {
        console.error("Входные данные должны быть массивом строк.");
        return [];
    }

    const regex = /https:\/\/t\.me\/nft\/([a-zA-Z0-9-]+)-(\d+)/;

    // Используем map для применения функции к каждому URL в массиве
    return urls.map(url => {
        const match = url.match(regex);

        if (match && match.length === 3) {
            let nftName = match[1];
            const nftId = match[2];

            // Преобразование названия: дефисы в пробелы, каждая первая буква слова заглавная
            nftName = nftName.replace(/-/g, ' ');
            nftName = nftName.split(' ').map(word => {
                if (word.length === 0) return '';
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }).join(' ');

            return `${nftName} #${nftId}`;
        } else {
            console.warn(`URL "${url}" не соответствует ожидаемому формату Telegram NFT. Будет возвращен null.`);
            return null; // Возвращаем null для URL, которые не удалось распарсить
        }
    });
}*/
/*function toNftLink(nftTitleString: string) {
    // Регулярное выражение для извлечения имени и ID.
    // ^ - начало строки
    // ([a-zA-Z\s]+?) - первая группа захвата: одна или более букв или пробелов (нежадный режим)
    // # - символ #
    // (\d+) - вторая группа захвата: одна или более цифр (ID)
    // $ - конец строки
    const regex = /^([a-zA-Z\s]+?)#(\d+)$/;
    let match = nftTitleString.match(regex);

    if (match === null){
      match = ["0", "1", "2"];
    }

    const rawName = match[1].trim(); // "Love Candle " (с пробелом в конце, если был) -> "Love Candle"
    const id = match[2];             // "1673"

    // Преобразование "Love Candle" в "lovecandle" для URL
    const formattedNameForUrl = rawName
        .toLowerCase() // Все в нижний регистр: "love candle"
        .replace(/\s+/g, ''); // Удаляем все пробелы: "lovecandle"

    // Формирование конечной ссылки
    const lottieLink = `https://nft.fragment.com/gift/${formattedNameForUrl}-${id}.lottie.json`;

    return lottieLink;
}*/
function convertUnixToFormattedGMT(unixTimestamp: number) {
  // Определяем, временная метка в секундах или миллисекундах
  // Если число относительно небольшое (например, меньше 10^12),
  // то, скорее всего, это секунды, и их нужно умножить на 1000.
  const timestampInMs = unixTimestamp < 1000000000000 ? unixTimestamp * 1000 : unixTimestamp;

  const date = new Date(timestampInMs);

  // Используем toUTCString(), чтобы получить дату в формате GMT
  // Пример: "Wed, 13 Jun 2025 01:28:25 GMT"
  const utcString = date.toUTCString();

  // Разбиваем строку на части и форматируем
  // Ищем нужные части: день, месяц, время
  const parts = utcString.split(' '); // [ "Wed,", "13", "Jun", "2025", "01:28:25", "GMT" ]

  const day = parts[1]; // "13"
  const month = parts[2]; // "Jun"
  const time = parts[4]; // "01:28:25"
  // const gmt = parts[5]; // "GMT" (уже есть в конце)

  return `${day} ${month} ${time} GMT`;
}
function parseTelegramNftLink(telegramNftLink: string) {
    const regex = /^https:\/\/t\.me\/nft\/([a-zA-Z0-9]+)-(\d+)$/;
    let match = telegramNftLink.match(regex);

    if (match === null){
      match = ["0", "1", "2"];
    }

    //if (match && match.length === 3) {
        const rawName = match[1]; // Например, "LolPop"
        const id = match[2];     // Например, "402343"

        // Преобразование "LolPop" в "Lol Pop"
        // Разделяем CamelCase, затем заменяем дефисы на пробелы, если они были
        const formattedName = rawName
            .replace(/([A-Z])/g, ' $1') // Добавляем пробел перед заглавными буквами
            .trim(); // Удаляем пробел в начале, если он появился

        // Формирование ссылки на Lottie-анимацию
        // Например, "LolPop-402343" -> "lolpop-402343"
        const lottieFileName = rawName.toLowerCase() + '-' + id;
        const lottieLink = `https://nft.fragment.com/gift/${lottieFileName}.lottie.json`;

        return {
            name: formattedName,
            id: id,
            lottieLink: lottieLink
        };
    //}
}
// BASE
function parseIdLinkStringToJson(inputString: string) {
    const jsonArray = [];

    // 1. Разделяем строку по разделителю блоков '='
    //    Используем filter(Boolean) для удаления пустых строк, если разделитель стоит в конце.
    const rawBlocks = inputString.split('=').filter(Boolean);

    // Пример rawBlocks для "id1;link1;/id2;link2;/" будет ["id1;link1;", "id2;link2;"]

    // 2. Итерируем по каждому полученному блоку и разделяем его по ";"
    for (const block of rawBlocks) {
        // Удаляем конечный ';' если он есть, чтобы split не создавал пустой элемент
        const cleanedBlock = block.endsWith(';') ? block.slice(0, -1) : block;
        const parts = cleanedBlock.split(';');

        // Убедимся, что у нас есть ровно две части: id и link
        if (parts.length === 4) {
            jsonArray.push({
                num: parseTelegramNftLink(parts[1]).id,
                name: parseTelegramNftLink(parts[1]).name,
                time: parseInt(parts[3]),
                usdtValue: parseInt(parts[2]),
                animationUrl: parseTelegramNftLink(parts[1]).lottieLink
            });
        } else {
            console.warn(`Предупреждение: Некорректный формат блока "${block}". Пропускаем.`);
        }
    }

    return jsonArray;
}
function parseinVentoryStringToJson(inputString: string) {
    const jsonArray = [];

    // 1. Разделяем строку по разделителю блоков '='
    //    Используем filter(Boolean) для удаления пустых строк, если разделитель стоит в конце.
    const rawBlocks = inputString.split('=').filter(Boolean);

    // Пример rawBlocks для "id1;link1;/id2;link2;/" будет ["id1;link1;", "id2;link2;"]

    // 2. Итерируем по каждому полученному блоку и разделяем его по ";"
    for (const block of rawBlocks) {
        // Удаляем конечный ';' если он есть, чтобы split не создавал пустой элемент
        const cleanedBlock = block.endsWith(';') ? block.slice(0, -1) : block;
        const parts = cleanedBlock.split(';');

        // Убедимся, что у нас есть ровно две части: id и link
        if (parts.length === 2) {
            jsonArray.push({
                num: parseTelegramNftLink(parts[0]).id,
                name: parseTelegramNftLink(parts[0]).name,
                usdtValue: parseInt(parts[1]),
                animationUrl: parseTelegramNftLink(parts[0]).lottieLink,
                selected: false
            });
        } else {
            console.warn(`Предупреждение: Некорректный формат блока "${block}". Пропускаем.`);
        }
    }

    return jsonArray;
}
function parseDebtsToJson(inputString: string) {
    const jsonArray = [];

    // 1. Разделяем строку по разделителю блоков '='
    //    Используем filter(Boolean) для удаления пустых строк, если разделитель стоит в конце.
    const rawBlocks = inputString.split('=').filter(Boolean);

    // 2. Итерируем по каждому полученному блоку и разделяем его по ";"
    for (const block of rawBlocks) {
        // Удаляем конечный ';' если он есть, чтобы split не создавал пустой элемент
        const cleanedBlock = block.endsWith(';') ? block.slice(0, -1) : block;
        const parts = cleanedBlock.split(';');
        const p1 = parts[1].endsWith('*') ? parts[1].slice(0, -1) : parts[1];

        if (parts.length === 2) {
            jsonArray.push({
                id: parts[0],
                items: convertMixedNftUrlsToReadableArray(p1.split('*')), // как Love Candle #1573
                animationUrl: parseTelegramNftLink(p1.split('*')[0])
            });
        } else {
            console.warn(`Предупреждение: Некорректный формат блока "${block}". Пропускаем.`);
        }
    }

    return jsonArray;
}

function parseHistoryToJson(inputString: string) {
    const jsonArray = [];

    // 1. Разделяем строку по разделителю блоков '='
    //    Используем filter(Boolean) для удаления пустых строк, если разделитель стоит в конце.
    const rawBlocks = inputString.split('=').filter(Boolean);

    // 2. Итерируем по каждому полученному блоку и разделяем его по ";"
    for (const block of rawBlocks) {
        // Удаляем конечный ';' если он есть, чтобы split не создавал пустой элемент
        const cleanedBlock = block.endsWith(';') ? block.slice(0, -1) : block;
        const parts = cleanedBlock.split(';');
        const jsonLINK = parseTelegramNftLink(parts[0]);

        if (parts.length === 4) { // именно 4!
            jsonArray.push({
                id: jsonLINK.id + '-1',
                name: jsonLINK.name,
                price: parts[1],
                type: parts[2],
                date: parseInt(parts[3]),
                imageUrl: jsonLINK.lottieLink,
                url: parts[0]
            });
        } else {
            console.warn(`Предупреждение: Некорректный формат блока "${block}". Пропускаем.`);
        }
    }

    return jsonArray;
}

function parseRatingToJson(inputString: string) {
    const jsonArray = [];
    
    // 1. Разделяем строку по разделителю блоков '='
    //    Используем filter(Boolean) для удаления пустых строк, если разделитель стоит в конце.
    const rawBlocks = inputString.split('=').filter(Boolean);

    // 2. Итерируем по каждому полученному блоку и разделяем его по ";"
    for (const block of rawBlocks) {
        // Удаляем конечный ';' если он есть, чтобы split не создавал пустой элемент
        const cleanedBlock = block.endsWith(';') ? block.slice(0, -1) : block;
        const parts = cleanedBlock.split(';');

        if (parts.length === 5) {
            jsonArray.push({  
                name: parts[0],
                volume: parseInt(parts[1]),
                mistaked: parseInt(parts[2]),
                welled: parseInt(parts[3]),
                photo: parts[4]

            });
        } else {
            console.warn(`Предупреждение: Некорректный формат блока "${block}". Пропускаем.`);
        }
    }

    return jsonArray;
}
// MATH

function hideBackBut()
{
  if (window)
  {
    if (window.Telegram)
    {
      if (window.Telegram.WebApp)
      {
          //window.Telegram.WebApp.BackButton.hide();
      }
    }
  }
  
}

function showBackBut()
{
  if (window)
  {
    if (window.Telegram)
    {
      if (window.Telegram.WebApp)
      {
          //window.Telegram.WebApp.BackButton.show();
      }
    }
  }
}

function onBackCalled()
{
  if (window)
  {
    if (window.Telegram)
    {
      if (window.Telegram.WebApp)
      {
          //setActiveTab('lavka');
      }
    }
  }
  
}

if (window)
  {
    if (window.Telegram)
    {
      if (window.Telegram.WebApp)
      {
          window.Telegram.WebApp.BackButton.onClick(onBackCalled);
      }
    }
  }


const tonConnectUI = new TonConnectUI({
    manifestUrl: 'http://localhost:5173/tonconnect-manifest.json',
});

function Setauto (isauto: boolean){
  const sendInitDataToServer = async (initData: string) => {
    const serverUrl = "https://racer.pythonanywhere.com/setauto"; // change

    const formData = new URLSearchParams();
    formData.append('initData', initData); // Ключ 'initData', значение - полная строка initData
    if (isauto){
      formData.append('auto', "1");
    }
    else{
      formData.append('auto', "0");
    }
    

    try {
        const response = await fetch(serverUrl, {
            method: 'POST',
            body: formData, 
        });

        if (!response.ok) {
            console.log("Ошибка на сервере");
        }

    
    } catch (error) {
        console.log("Ошибка при отправке initData на сервер:", error);
    }
  };
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
  sendInitDataToServer(window.Telegram.WebApp.initData);}
}

function Pogasit (id: string){
  const sendInitDataToServer = async (initData: string) => {
    const serverUrl = "https://racer.pythonanywhere.com/pogasit"; // change

    const formData = new URLSearchParams();
    formData.append('initData', initData); // Ключ 'initData', значение - полная строка initData
    formData.append('id', id);
    
    try {
        const response = await fetch(serverUrl, {
            method: 'POST',
            body: formData, 
        });

        if (!response.ok) {
            console.log("Ошибка на сервере");
        }

    
    } catch (error) {
        console.log("Ошибка при отправке initData на сервер:", error);
    }
  };
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
  sendInitDataToServer(window.Telegram.WebApp.initData);}
}

function SetW (address: string){
  const sendInitDataToServer = async (initData: string) => {
    const serverUrl = "https://racer.pythonanywhere.com/setwallet"; 

    const formData = new URLSearchParams();
    formData.append('initData', initData); // Ключ 'initData', значение - полная строка initData
    formData.append('wallet', address);

    try {
        const response = await fetch(serverUrl, {
            method: 'POST',
            body: formData, 
        });

        if (!response.ok) {
            console.log("Ошибка на сервере");
        }

    
    } catch (error) {
        console.log("Ошибка при отправке initData на сервер:", error);
    }
  };
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
  sendInitDataToServer(window.Telegram.WebApp.initData);}
}

// Мы будем использовать Promise для ожидания подключения,
// так как openModal() сам по себе не возвращает информацию.
let resolveConnectionPromise: ((address: string) => void) | null = null;
let rejectConnectionPromise: ((error: Error) => void) | null = null;

// Эта функция будет вызываться, когда статус подключения изменится.
// Она захватит адрес кошелька, если он подключится.
tonConnectUI.onStatusChange(wallet => {
    if (wallet && wallet.account && wallet.account.address) {
        console.log('Статус подключения изменился. Подключен:', wallet.account.address);
        // Если есть ожидающий Promise, разрешаем его с адресом
        if (resolveConnectionPromise) {
            resolveConnectionPromise(wallet.account.address);
            resolveConnectionPromise = null; // Сбрасываем для следующего подключения
            rejectConnectionPromise = null;

            SetW(wallet.account.address);
        }
        // Здесь вы можете обновить состояние React, если эта функция внутри компонента
        // Например: setWalletAddress(wallet.account.address);
    } else {
        console.log('Статус подключения изменился. Кошелек отключен.');
        // Если кошелек отключился и есть ожидающий Promise, отклоняем его.
        if (rejectConnectionPromise) {
            rejectConnectionPromise(new Error('Wallet disconnected during connection attempt.'));
            resolveConnectionPromise = null;
            rejectConnectionPromise = null;
        }
        // Здесь вы можете обновить состояние React: setWalletAddress(null);
    }
});


async function connectTonWallet(): Promise<string> { // Указываем, что функция возвращает Promise<string>
    return new Promise(async (resolve, reject) => {
        // Сохраняем resolve и reject для использования в onStatusChange
        resolveConnectionPromise = resolve;
        rejectConnectionPromise = reject;

        try {
            if (!tonConnectUI.connected) {
                console.log('Попытка подключения кошелька...');
                await tonConnectUI.openModal(); // Просто открываем модальное окно. Оно возвращает void.
                // Дальнейшая логика будет в onStatusChange
            } else {
                // Если кошелек уже подключен
                if (tonConnectUI.wallet && tonConnectUI.wallet.account && tonConnectUI.wallet.account.address) {
                    console.log('Кошелек уже подключен:', tonConnectUI.wallet.account.address);
                    resolve(tonConnectUI.wallet.account.address); // Разрешаем Promise сразу
                } else {
                    console.log('Кошелек подключен, но не удалось получить его адрес.');
                    reject(new Error('Wallet connected, but address not available.'));
                }
            }
        } catch (error) {
            console.log('Ошибка при открытии модального окна TonConnect:', error);
            // Если openModal() вызывает ошибку, отклоняем Promise
            reject(error instanceof Error ? error : new Error(String(error)));
            resolveConnectionPromise = null;
            rejectConnectionPromise = null;
        }
    });
}

async function disconnectTonWallet() {
    try {
        if (tonConnectUI.connected) {
            await tonConnectUI.disconnect();
            console.log('Кошелек отключен.');
        } else {
            console.log('Кошелек не подключен.');
        }
    } catch (error) {
        console.log('Ошибка отключения кошелька TON:', error);
        //throw error;
    }
}

async function sendUsdt(
    recipientAddress: string, // User-friendly address
    amountUsdt: number,
    sen: string,
    usdtMasterContractAddress: string = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
    comment?: string,
    
): Promise<any> { // Указываем тип возвращаемого значения
    // Проверки
    if (!tonConnectUI.connected || !tonConnectUI.wallet) {
        console.error('Кошелек не подключен. Пожалуйста, подключите кошелек перед отправкой USDT.');
        throw new Error('Wallet not connected.'); // Или возвращайте null/false
    }

    if (amountUsdt <= 0) {
        console.error('Сумма USDT должна быть больше нуля.');
        throw new Error('Amount must be positive.');
    }

    // USDT имеет 6 децималов. Конвертируем USDT в нано-USDT.
    // Используем BigInt для точных расчетов
   //const amountInNanoUsdt = BigInt(Math.floor(amountUsdt * 1_000_000)); // 1_000_000 = 10^6

    console.log(`Attempting to send ${amountUsdt} USDT (${amountUsdt.toString()} nano-USDT) to ${recipientAddress}`);

    const JETTON_TRANSFER_OP_CODE = 0xf8a7ea5; // op_code для transfer_notification Jetton
    
    const sendInitDataToServer = async (initData: string, rec: string, sen: string, amo: number): Promise<string>  => {
    // !!! ЗАМЕНИТЕ ЭТО НА ВАШ РЕАЛЬНЫЙ URL СЕРВЕРА PYTHONANYWHERE !!!
    const serverUrl = "https://racer.pythonanywhere.com/hash"; 

    const formData = new URLSearchParams();
    formData.append('initData', initData); // Ключ 'initData', значение - полная строка initData
    formData.append('rec', rec);
    formData.append('sen', sen);
    formData.append('amo', amo.toString());

    const response = await fetch(serverUrl, {
        method: 'POST',
        body: formData, 
    });

    if (!response.ok) {
        const errorData = await response.json(); 
        //throw new Error(`Ошибка сервера: ${response.status} - ${errorData.message}`);
        console.log("Ошибка сервера: ${response.status} - ${errorData.message}");
    }

    const result = await response.text();
    return result;
  };


    // Проверяем наличие Telegram WebApp API и initData
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
        const initData = window.Telegram.WebApp.initData;
         let finalPayloadBoc = await sendInitDataToServer(initData, recipientAddress, sen, amountUsdt);
         const transaction: SendTransactionRequest = {
        messages: [
            {
                address: usdtMasterContractAddress, // Адрес мастер-контракта USDT
                amount: '200000000', // Небольшая сумма TON для оплаты комиссий за форвард-сообщение (0.2 TON)
                                     // Реальная комиссия будет меньше, остаток вернется.
                payload: finalPayloadBoc // <<< ЭТО ВАЖНО: ПРАВИЛЬНЫЙ SERIALIZED PAYLOAD
            }
        ],
        validUntil: Math.floor(Date.now() / 1000) + 300, // Транзакция действительна 5 минут
    };

    console.log('Sending transaction request:', transaction);

    try {
        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('USDT transaction sent successfully:', result);
        //alert(`USDT transaction sent! BOC: ${result.boc.substring(0, 30)}...`);
        return result;
    } catch (error) {
        console.error('Error sending USDT transaction:', error);
        //alert('Error sending USDT: ' + (error instanceof Error ? error.message : String(error)));
        throw error; // Перебрасываем ошибку, чтобы вызывающий код мог ее обработать
    }
    }

    

    
}


async function testSendUsdt(amount:number, message:string) {
    try {
        const recipient = 'UQAa2EUhADJ1fO98BCWvRm2wjN5NWW0HLvXCLq4OTWMzeLy7'; // GiftCashData (основной адрес проекта)
        await sendUsdt(recipient, amount, message);
    } catch (error) {
        console.log('Произошла ошибка при тестовой отправке USDT:', error);
    }
}



// Вспомогательная функция для форматирования времени (секунды в Дни:Часы:Минуты:Секунды)
const formatTime = (seconds: number) => {
  // Убедимся, что секунды - это целое число
  seconds = Math.floor(seconds);

  const days = Math.floor(seconds / (3600 * 24));
  seconds %= (3600 * 24);
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(remainingSeconds).padStart(2, '0')}s`;
};

/*const parseGiftsString = (dataString: string): { [key: string]: [number, number, string] } => {
  const parts = dataString.split(';');
  // Словарь: {id: [timeLeft, usdtValue, lottieUrl]}
  const gifts: { [key: string]: [number, number, string] } = {}; 
  for (let i = 0; i < parts.length; i += 4) { // Изменено на 4, так как теперь 4 элемента на подарок
    const id = parts[i];
    const timeLeft = parseInt(parts[i + 1], 10);
    const usdtRequired = parseInt(parts[i + 2], 10);
    const lottieUrl = parts[i + 3];
    if (!isNaN(timeLeft) && !isNaN(usdtRequired) && lottieUrl) {
      gifts[id] = [timeLeft, usdtRequired, lottieUrl]; // <-- Assigning [number, number, string]
    } else {
      console.warn(`Некорректные данные для подарка ${id}: время, USDT или URL Lottie не число/строка.`);
    }
  }
  return gifts;
};*/

// Компонент LottieAnimation, который оборачивает веб-компонент <lottie-player>
// Для его работы необходимо глобально загрузить скрипт lottie-player в HTML-документе:
const LottieAnimation = ({ animationUrl, loop = true, autoplay = true, className = "", altText = "" }: { animationUrl: string; loop?: boolean; autoplay?: boolean; className?: string; altText?: string }) => {
  // Проверяем, содержит ли className какой-либо класс для закругления
  // и добавляем 'overflow-hidden' для корректного обрезания содержимого
  const hasRoundedClass = className.split(' ').some(cls => cls.startsWith('rounded-'));
  const finalClassName = hasRoundedClass ? `${className} overflow-hidden` : className;

  return (
    <div className={finalClassName} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <lottie-player
        src={animationUrl}
        loop={loop ? "true" : "false"} // Веб-компонент Lottie использует строки для булевых атрибутов
        autoplay={autoplay ? "true" : "false"}
        style={{ width: '100%', height: '100%' }} // Lottie заполнит свой родительский div
        aria-label={altText} // Для доступности
      ></lottie-player>
    </div>
  );
};

// Компонент App
function App() {
  // Общий URL Lottie-анимации, предоставленный пользователем.
  const COMMON_LOTTIE_URL = "https://nft.fragment.com/gift/lovecandle-6304.lottie.json";
    // Состояние для управления видимостью загрузочного экрана
  const [isLoading, setIsLoading] = useState(true);

  const [notificationKey, setNotificationKey] = useState(0);

  // Состояние для отображения значения счетчика в верхней левой кнопке
  const [count, setCount] = useState(0); 
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false); // Состояние для симуляции подключения кошелька

  //let [usdtBalanceNano, setUsdtBalanceNano] = useState<string | null>(null); // Возьмем с node.js сервера!
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState('');
 
  // Новое состояние для подарков, загруженных с бэкенда для "Лавки"
  // Теперь содержит lottieUrl как третий элемент массива
  //const [shopGifts, setShopGifts] = useState<{ [key: string]: [number, number, string] }>({}); // work here
  const [shopGifts, setShopGifts] = useState(giftsLavkaArray);
  // Состояние для статуса загрузки подарков
  const [loadingShopGifts, setLoadingShopGifts] = useState(true);
  // Состояние для ошибок при загрузке подарков
  const [errorShopGifts, setErrorShopGifts] = useState<string | null>(null);

  // Состояние для управления активной вкладкой нижней навигации
  //const [activeTab, setActiveTab] = useState('lavka'); // 'lavka', 'inventory', 'profile'
  // Состояние для управления активной подвкладкой в разделе Профиль
  const [profileSubTab, setProfileSubTab] = useState('lavka_sub'); // 'lavka_sub', 'friends', 'history', 'rating'
  // Состояние для отображения сообщения о копировании
  const [copyMessage, setCopyMessage] = useState('');

  const [activeTab, setActiveTab] = useState('lavka');

    // Состояние для управления видимостью информационной панели
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showInfo2Panel, setShowInfo2Panel] = useState(false);
  // Состояние для управления переключателем "Internal Purchase"
  const [isInternalPurchaseEnabled, setIsInternalPurchaseEnabled] = useState(false);

  // Состояние для управления уведомлением (тостом)
    const [notification, setNotification] = useState<{ message: string; animationUrl: string; type: 'success' | 'warning' | 'info' } | null>(null);
    // URL-ы для Lottie-анимаций уведомлений
    const SUCCESS_TOAST_ANIMATION_URL = "https://assets5.lottiefiles.com/packages/lf20_t0y02l5b.json"; // Пример: зеленая галочка
    const WARNING_TOAST_ANIMATION_URL = "https://assets5.lottiefiles.com/packages/lf20_k2g6v6j2.json"; // Пример: желтый восклицательный знак
    const INFO_TOAST_ANIMATION_URL = "https://assets10.lottiefiles.com/packages/lf20_3y3x7y2e.json"; // Пример: синяя информация

    // Функция для показа уведомления
    const showNotification = (message: string, animationUrl: string, type: 'success' | 'warning' | 'info') => {
        setNotification({ message, animationUrl, type });
        setNotificationKey(prevKey => prevKey + 1); // Увеличиваем ключ при каждом показе
    };

    // Функция для скрытия уведомления
    const hideNotification = () => {
        setNotification(null);
    };

  // Состояние для списка подарков в инвентаре
  // Изменено imageUrl на animationUrl // work here!!!
  const [inventoryGifts, setInventoryGifts] = useState(inventoryArray/*[
    { id: 'gift_1', name: 'Love Candle', num: '778', usdtValue: 88, animationUrl: COMMON_LOTTIE_URL, selected: false },
    { id: 'gift_2', name: 'Love Candle', num: '7240', usdtValue: 120, animationUrl: COMMON_LOTTIE_URL, selected: false },
    { id: 'gift_3', name: 'Love Candle', num: '123', usdtValue: 45, animationUrl: COMMON_LOTTIE_URL, selected: false },
    { id: 'gift_4', name: 'Love Candle', num: '456', usdtValue: 90, animationUrl: COMMON_LOTTIE_URL, selected: false },
    { id: 'gift_5', name: 'Love Candle', num: '789', usdtValue: 60, animationUrl: COMMON_LOTTIE_URL, selected: false },
    { id: 'gift_6', name: 'Love Candle', num: '101', usdtValue: 75, animationUrl: COMMON_LOTTIE_URL, selected: false },
    // Новый подарок для демонстрации условия
    { id: 'gift_7', name: 'Legendary Artifact', num: '777', usdtValue: 7777777, animationUrl: COMMON_LOTTIE_URL, selected: false },
  ]*/);

  // Вычисляемое значение для общей стоимости выбранных подарков в инвентаре
  const totalSelectedUsdt = inventoryGifts
    .filter(gift => gift.selected)
    .reduce((sum, gift) => sum + gift.usdtValue, 0);

  // Пример реферальной ссылки
  const referralLink = "https://t.me/giftcash/?start=" + id.toString();

  // useEffect для подписки на изменения статуса кошелька
  useEffect(() => {
      // Подписываемся на изменения статуса
      const unsubscribe = tonConnectUI.onStatusChange(wallet => {
          if (wallet && wallet.account && wallet.account.address) {
              setWalletAddress(wallet.account.address);
              setWalletConnected(true);
              console.log('React: Статус подключения изменился. Подключен:', wallet.account.address);
          } else {
              setWalletAddress(null);
              setWalletConnected(false);
              console.log('React: Статус подключения изменился. Кошелек отключен.');
          }
      });

      // Проверяем начальное состояние при монтировании
      if (tonConnectUI.connected && tonConnectUI.wallet && tonConnectUI.wallet.account && tonConnectUI.wallet.account.address) {
          setWalletAddress(tonConnectUI.wallet.account.address);
          setWalletConnected(true);
      }

      // Функция очистки: отписываемся при размонтировании компонента
      return () => {
          unsubscribe();
      };
  }, []); // Пустой массив зависимостей: эффект запускается один раз при монтировании и очищается при размонтировании.

  // Функция для подключения кошелька (вызывается по кнопке)
  const handleConnectWallet = async () => {
      try {
          const address = await connectTonWallet(); // Вызываем асинхронную функцию
          console.log('Подключение завершено, адрес:', address);
          showNotification('Кошелек успешно подключен!', SUCCESS_TOAST_ANIMATION_URL, 'success');
          // Состояние walletAddress и walletConnected будет обновлено через onStatusChange
      } catch (error) {
          console.log('Ошибка в handleConnectWallet:', error);
          showNotification('Не удалось подключить кошелек', WARNING_TOAST_ANIMATION_URL, 'warning');
          //alert('Не удалось подключить кошелек: ' + (error instanceof Error ? error.message : String(error)));
      }
  };

  const handleDisconnectWallet = async () => {
      try {
          await disconnectTonWallet();
          showNotification('Кошелек отключен', INFO_TOAST_ANIMATION_URL, 'info');
          // Состояние walletAddress и walletConnected будет обновлено через onStatusChange
      } catch (error) {
          console.log('Ошибка в handleDisconnectWallet:', error);
          showNotification('Не удалось отключить кошелек', WARNING_TOAST_ANIMATION_URL, 'warning');
          //alert('Не удалось отключить кошелек: ' + (error instanceof Error ? error.message : String(error)));
      }
  };

  const handleConnectOrDisconnectWallet = async () => {
      switch (walletConnected)
      {
          case true:
            handleDisconnectWallet();
            break;
          case false:
            handleConnectWallet();
            break;
      }
  };

   /*const fetchUsdtBalance = useCallback(async () => {
    if (!tonConnectUI.wallet) {
      setUsdtBalanceNano(null);
      setBalanceError('');
      return; // No wallet connected, so no balance to fetch
    }

    setIsLoadingBalance(true);
    setBalanceError('');

    try {
      const client = new TonClient({ endpoint: TON_RPC_ENDPOINT });
      const ownerAddress = Address.parse(tonConnectUI.wallet.account.address);
      const usdtMasterAddress = Address.parse(USDT_JETTON_MASTER_ADDRESS_STRING);

      // 1. Get the Jetton wallet address for USDT owned by the connected TON address
      // This calls the 'get_wallet_address' method on the USDT Jetton Master contract.
      // It expects a Cell containing the owner's address.
      const walletAddressResult = await client.runMethod(
        usdtMasterAddress,
        "get_wallet_address",
        [{ type: "slice", cell: beginCell().storeAddress(ownerAddress).endCell() }]
      );

      if (!walletAddressResult.stack || walletAddressResult.stack.remaining === 0) {
        //throw new Error("Failed to get Jetton wallet address from master contract.");
        console.log("Failed to get Jetton wallet address from master contract.");
      }

      const jettonWalletAddress = walletAddressResult.stack.readAddress();
      console.log("Your USDT Jetton Wallet Address:", jettonWalletAddress.toString());

      // 2. Get data (including balance) from the obtained Jetton wallet
      // This calls the 'get_wallet_data' method on the specific Jetton wallet.
      // It typically returns balance, owner, master address, code, and data.
      const jettonWalletDataResult = await client.runMethod(
        jettonWalletAddress,
        "get_wallet_data",
        [] // This method usually doesn't require arguments
      );

      if (!jettonWalletDataResult.stack || jettonWalletDataResult.stack.remaining === 0) {
        //throw new Error("Failed to get data from Jetton wallet. You might not own USDT or the wallet is not activated.");
        console.log("Failed to get data from Jetton wallet. You might not own USDT or the wallet is not activated.");
      }

      // The first element in the stack is the balance, which is a BigNumber in nano-units
      const balanceBigNumber = jettonWalletDataResult.stack.readBigNumber();
      setUsdtBalanceNano(balanceBigNumber.toString()); // Store as string for precision

    } catch (err: any) { // Use 'any' for error if not strictly typed, or 'Error'
      console.log("Error fetching USDT balance:", err);
      setBalanceError(`Error: ${err.message || 'Unknown error'}.`);
      setUsdtBalanceNano(null);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [tonConnectUI.wallet]); // Re-fetch balance when 'wallet' object changes (connect/disconnect)


  // --- Effect to run balance fetching when wallet state changes ---
  useEffect(() => {
    fetchUsdtBalance();
  }, [fetchUsdtBalance]);*/

  // Функция для копирования текста в буфер обмена
  const copyToClipboard = (text: string) => {
    try {
      // Создаем временный textarea для копирования
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed'; // Делаем его невидимым
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy'); // Выполняем команду копирования
      document.body.removeChild(textarea); // Удаляем временный textarea

      setCopyMessage('Скопировано!');
      showNotification('Текст скопирован!', SUCCESS_TOAST_ANIMATION_URL, 'success');
      setTimeout(() => setCopyMessage(''), 2000); // Скрываем сообщение через 2 секунды
    } catch (err) {
      console.log('Не удалось скопировать текст: ', err);
      setCopyMessage('Ошибка при копировании!');
      showNotification('Ошибка при копировании!', WARNING_TOAST_ANIMATION_URL, 'warning');
      setTimeout(() => setCopyMessage(''), 2000);
    }
  };

  // Обработчик выбора/снятия выбора подарка
   const handleGiftSelect = (selectedGift: { name: string, num: string, usdtValue: number, animationUrl: string, selected: boolean }) => {
    setInventoryGifts(prevGifts =>
      prevGifts.map(gift =>
        // Сравниваем по 'id', так как он уникален для каждого объекта подарка
        // Хотя функция принимает весь объект, для обновления состояния
        // всё равно нужен уникальный идентификатор. Если у вас нет 'id',
        // то нужно будет найти другой уникальный ключ, например, комбинацию 'name' и 'num'.
        gift.animationUrl === selectedGift.animationUrl ? { ...gift, selected: !gift.selected } : gift
      )
    );
  };

  // Обработчик кнопки "Отмена"
  const handleCancelSelection = () => {
    setInventoryGifts(prevGifts =>
      prevGifts.map(gift => ({ ...gift, selected: false }))
    );
    setActiveTab('lavka'); // Возвращаемся в Лавку при отмене
  };

  // Обработчик кнопки "Сдать в лавку" (POST и GET запросы)
  const handleSellGifts = async () => {
    const selected = inventoryGifts.filter(gift => gift.selected);
    if (selected.length === 0) {
      showNotification('Подарки для сдачи не выбраны', WARNING_TOAST_ANIMATION_URL, 'warning');
      return;
    }

    console.log('Выбранные подарки для сдачи:', selected);

    const sendInitDataToServer = async (initData: string) => {
    // !!! ЗАМЕНИТЕ ЭТО НА ВАШ РЕАЛЬНЫЙ URL СЕРВЕРА PYTHONANYWHERE !!!
    const serverUrl = "https://racer.pythonanywhere.com/sellgifts"; 

    const formData = new URLSearchParams();
    formData.append('initData', initData); // Ключ 'initData', значение - полная строка initData
    formData.append('gifts', JSON.stringify(selected.map(g => g.animationUrl)));

    try {
        const response = await fetch(serverUrl, {
            method: 'POST',
            body: formData, 
        });

        if (!response.ok) {
            const errorData = await response.json(); 
            //throw new Error(`Ошибка сервера: ${response.status} - ${errorData.message}`);
            console.log("Ошибка сервера: ${response.status} - ${errorData.message}");
        }

        const result = await response.json();

        if (result.status === "success") {
            showNotification('Подарки успешно возвращены!', SUCCESS_TOAST_ANIMATION_URL, 'success');
        } else {
            showNotification('Возврат подарков не удался', WARNING_TOAST_ANIMATION_URL, 'warning');
        }
        return result;
    } catch (error) {
        showNotification('Ошибка при возврате подарков', WARNING_TOAST_ANIMATION_URL, 'warning');
    }};
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
  sendInitDataToServer(window.Telegram.WebApp.initData);}

    // Закрываем окно Инвентарь и возвращаемся в Лавку
    setActiveTab('lavka');
    handleCancelSelection(); // Очищаем выбор после сдачи

    // Через секунду отправляем GET запрос
    setTimeout(async () => {
      try {
        // ВНИМАНИЕ: Замените 'https://api.example.com/update_data' на реальный URL вашего бэкенда!
        const getResponse = await fetch('https://api.example.com/update_data');
        if (!getResponse.ok) {
          //throw new Error(`HTTP error! status: ${getResponse.status}`);
          console.log("HTTP error! status: ${getResponse.status}");
        }
        const getResult = await getResponse.json();
        console.log('GET запрос успешен:', getResult);
        // Здесь можно обновить какие-либо данные в приложении после GET запроса
        // Например, снова вызвать fetchShopGifts() если данные Лавки зависят от сдачи подарков
        /*fetchShopGifts();*/
      } catch (error) {
        console.log('Ошибка при GET запросе:', error);
        showNotification('Ошибка при обновлении данных после сдачи', WARNING_TOAST_ANIMATION_URL, 'warning');
      }
    }, 1000); // 1 секунда
  };

  // НОВАЯ ФУНКЦИЯ: Обработчик кнопки "Вернуть"
  const handleReturnGifts = async () => {
    const selected = inventoryGifts.filter(gift => gift.selected);
    if (selected.length === 0) {
      console.log('Подарки для возврата не выбраны.');
      // Можно показать сообщение, что подарки не выбраны
      return;
    }
    let s = "";
    for (const gift of selected)
    {
        s = s + gift.animationUrl;
        s += ";";
    }
    
    console.log('Выбранные подарки для возврата:', selected);

    const sendInitDataToServer = async (initData: string) => {
    // !!! ЗАМЕНИТЕ ЭТО НА ВАШ РЕАЛЬНЫЙ URL СЕРВЕРА PYTHONANYWHERE !!!
    const serverUrl = "https://racer.pythonanywhere.com/return_several_gifts"; 

    const formData = new URLSearchParams();
    formData.append('initData', initData); // Ключ 'initData', значение - полная строка initData
    formData.append('gifts', s);

    try {
        const response = await fetch(serverUrl, {
            method: 'POST',
            body: formData, 
        });

        if (!response.ok) {
            const errorData = await response.json(); 
            //throw new Error(`Ошибка сервера: ${response.status} - ${errorData.message}`);
            console.log("Ошибка сервера: ${response.status} - ${errorData.message}");
        }

        const result = await response.json();

        if (result.status === "success") {
            showNotification('Подарки успешно возвращены!', SUCCESS_TOAST_ANIMATION_URL, 'success');
        } else {
            showNotification('Возврат подарков не удался', WARNING_TOAST_ANIMATION_URL, 'warning');
        }
        return result;
    } catch (error) {
        showNotification('Ошибка при возврате подарков', WARNING_TOAST_ANIMATION_URL, 'warning');
    }
  };
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
  sendInitDataToServer(window.Telegram.WebApp.initData);}
  };

 // Функция для "загрузки" подарков из бэкенда, суть была в setShopGifts(giftsLavkaArray)
  /*const fetchShopGifts = async () => {
    setLoadingShopGifts(true);
    setErrorShopGifts(null);
    try {
      console.log("l");
      // Симулируем ответ бэкенда строкой с URL Lottie анимации
      // ВНИМАНИЕ: В реальном приложении замените на fetch к вашему бэкенду
    } catch (error) {
      console.log('Ошибка при загрузке подарков:', error);
      showNotification('Не удалось загрузить подарки.', WARNING_TOAST_ANIMATION_URL, 'warning');
      setErrorShopGifts('Не удалось загрузить подарки. Попробуйте позже.');
    } finally {
      setLoadingShopGifts(false);
    }
  };*/

  // Функция для отправки initData на сервер для валидации
  const sendInitDataToServer = async (initData: string) => {
    // !!! ЗАМЕНИТЕ ЭТО НА ВАШ РЕАЛЬНЫЙ URL СЕРВЕРА PYTHONANYWHERE !!!
    const serverUrl = "https://racer.pythonanywhere.com/validate_webapp_user"; 

    const formData = new URLSearchParams();
    formData.append('initData', initData); // Ключ 'initData', значение - полная строка initData

    try {
        const response = await fetch(serverUrl, {
            method: 'POST',
            body: formData, 
        });

        if (!response.ok) {
            const errorData = await response.json(); 
            //throw new Error(`Ошибка сервера: ${response.status} - ${errorData.message}`);
            console.log("Ошибка сервера: ${response.status} - ${errorData.message}");
        }

        const result = await response.json();
        console.log("Ответ сервера о валидации:", result);
        if (result.status === "success") {
            console.log("Пользователь валидирован! ID:", result.user_id);

            setLoadingShopGifts(false);
            console.log(loadingShopGifts);
            setErrorShopGifts(null);

            id = result.user_id;
            imya = result.imya;
            let gifts = result.giftsLavka;
            let invGifts = result.giftsInv;
            //address = result.address;
            let debts = result.debts;
            auto = result.auto; // 0 или 1
            mistaked = result.mistaked;
            welled = result.welled;
            volume = result.volume;
            let history = result.history;
            let rating = result.rating;
            photo = result.photo;
            place = result.place;
            usdtHave = result.usdtHave;
            lang = result.language_code;

            giftsLavkaArray = parseIdLinkStringToJson(gifts);
            inventoryArray = parseinVentoryStringToJson(invGifts);
            debtsArray = parseDebtsToJson(debts);
            historyArray = parseHistoryToJson(history);
            ratingArray = parseRatingToJson(rating);

            // Здесь вы можете сохранить user_id в состоянии или контексте React
            // Например, setUser(result.user_id);
        } else {
            console.log("Валидация не удалась:", result.message);
            // Можно показать сообщение об ошибке пользователю на загрузочном экране
        }
        return result;
    } catch (error) {
        console.log("Ошибка при отправке initData на сервер:", error);
        // Обработка ошибки, возможно, показать сообщение пользователю
        //throw error;
    }
  };

  useEffect(() => { // work here333
    console.log('Компонент App загружен.');

    /*// Загружаем подарки при монтировании компонента
    fetchShopGifts();*/

    // Проверяем наличие Telegram WebApp API и initData
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
        const initData = window.Telegram.WebApp.initData;
        console.log("Обнаружены initData Telegram WebApp. Отправка на валидацию...");
        sendInitDataToServer(initData)
            .then(() => {
                // Валидация завершена (успешно или с ошибкой), скрываем загрузочный экран
                setIsLoading(false);
            })
            .catch(error => {
                console.log("Ошибка при валидации initData:", error);
                // В случае ошибки также скрываем загрузочный экран,
                // но можно показать сообщение об ошибке
                setIsLoading(false);
            });
    } else {
        console.log("Telegram WebApp API или initData не обнаружены. Возможно, приложение запущено вне Telegram.");
        // Для разработки: скрыть загрузочный экран через несколько секунд,
        // чтобы можно было тестировать приложение вне Telegram
        setTimeout(() => {
            setIsLoading(false);
        }, 3000); // Скрыть через 3 секунды
    }

    // Таймер для обратного отсчета времени на карточках подарков в "Лавке"
   const timer = setInterval(() => {
      setShopGifts(prevGifts => {
        // 1. Правильно клонируем массив, чтобы создать новую копию.
        // Это поверхностная копия массива, но она нужна, чтобы React видел изменение состояния.
        const updatedGifts = prevGifts.map(gift => {
          // Клонируем текущий объект подарка
          // и обновляем только свойство 'time'.
          return {
            ...gift, // Копируем все существующие свойства подарка
            time: Math.max(0, gift.time - 1) // Декрементируем 'time', убедившись, что оно не опускается ниже 0
          };
        });

        return updatedGifts; // Возвращаем новый, обновленный массив
      });
    }, 1000);

    return () => clearInterval(timer); // Очистка таймера при размонтировании компонента
  }, []); // Пустой массив зависимостей гарантирует, что эффект запускается один раз при монтировании


  // --- Функции для рендеринга различных центральных экранов ---

  // Экран "Лавка" (подарки)
  const renderLavkaScreen = () => (
    // Этот div теперь занимает всю доступную высоту в 'main' и центрирует контент
    <div className="flex-grow w-full flex flex-col items-center justify-center p-4">
      {/* Статусы загрузки и ошибок (я убрал {loadingShopGifts && <p className="text-gray-400 text-lg">Загрузка подарков...</p>}) */}
      
      {errorShopGifts && <p className="text-red-400 text-lg">{errorShopGifts}</p>}
      {!loadingShopGifts && !errorShopGifts && Object.keys(shopGifts).length === 0 && (
        <p className="text-gray-400 text-lg">Подарки в лавке отсутствуют.</p>
      )}

      {/* Контейнер для горизонтального скролла подарков */}
      <div className="flex overflow-x-auto space-x-6 w-full pl-4 pr-4 md:px-0 scrollbar-hide overscroll-x-contain">
        {Object.entries(shopGifts).map(([id, values]) => (
          <div key={id} className="flex-shrink-0 w-64 bg-gray-800 rounded-lg p-4 shadow-xl flex flex-col items-center">
            {/* Изображение подарка (теперь LottieAnimation) */}
            <LottieAnimation
              animationUrl={values.animationUrl} // Используем URL из данных бэкенда
              className="w-48 h-48 mb-2 rounded-lg" // Сохраняем размеры
            />
            <p className="text-gray-300 text-base mb-1">{formatTime(values.time)}</p>
            <p className="text-white text-lg font-semibold">{values.usdtValue} USDT required</p>
          </div>
        ))}
      </div>

      {/* Большая кнопка под подарками */}
      <button
        className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition duration-200 ease-in-out flex items-center justify-center text-lg focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-75"
        onClick={() => setActiveTab('inventory')} // Переход на экран Инвентаря/Предложить подарки
      >
        <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Предложить подарки
      </button>
    </div>
  );

  // Экран "Инвентарь" (или после нажатия "Предложить подарки")
  const renderInventoryScreen = () => (
    <div className="flex-grow w-full flex flex-col items-center">
      {/* Текст с общей стоимостью выбранных подарков - ФИКСИРОВАН ВВЕРХУ MAIN */}
      <div className="w-full max-w-2xl text-center bg-gray-900 py-3 px-4 z-10 sticky top-0"> 
          <p className="text-gray-300 text-lg">
              Выбранные подарки оцениваются в <span className="font-bold text-white">{totalSelectedUsdt} USDT</span>
          </p>
      </div>

      {/* СКРОЛЛЮЩАЯСЯ ОБЛАСТЬ (ПОДАРКИ И ТЕКСТ "ЗАГРУЗИТЬ ПОДАРОК") */}
      <div className="flex-grow w-full flex flex-col items-center overflow-y-auto scrollbar-hide">
        {/* Вертикальный Scroll View из подарков */}
        <div className="w-full max-w-2xl grid grid-cols-2 gap-4 p-2 pt-4">
          {inventoryGifts.map(gift => (
            // Весь блок подарка теперь кликабелен для выбора/снятия выбора
            <div
              key={gift.animationUrl}
              className={`bg-gray-800 rounded-lg p-4 shadow-xl flex flex-col items-center relative 
                          ${gift.usdtValue === 7777777 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} 
                          ${gift.selected ? 'border-2 border-blue-500' : ''}`}
            // Условие для onClick: клик срабатывает только если usdtValue НЕ равно 7777777
            onClick={() => gift.usdtValue !== 7777777 && handleGiftSelect(gift)}
            >
              {/* Кружочек-визуальный индикатор выделения */}
              <div
                className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 ${gift.selected && gift.usdtValue !== 7777777 ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}
              >
                {/* Отметка о выборе показывается только если подарок не '7777777' и выбран */}
                {gift.selected && gift.usdtValue !== 7777777 && (
                  <svg className="w-4 h-4 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
              
              {/* Изображение подарка (теперь LottieAnimation) */}
              <LottieAnimation
                animationUrl={gift.animationUrl}
                className="w-32 h-32 mb-2 rounded-lg" // Сохраняем размеры
              />
              
              {/* Название и номер подарка */}
              <div className="text-white text-center text-base font-semibold">
                {gift.name} <span className="text-gray-400 text-sm"># {gift.num}</span>
              </div>
              
              {/* Текст "За такой дадут X USDT" или "Эксперты оценивают стоимость" */}
              <p className="text-gray-400 text-sm mt-1">
                {gift.usdtValue === 7777777 ? (
                  <span className="font-bold">Эксперты оценивают стоимость</span>
                ) : (
                  <>За такой дадут <span className="font-bold">{gift.usdtValue} USDT</span></>
                )}
              </p>
            </div>
          ))}
        </div>

        {/* Текст для загрузки подарков (перемещен ниже кнопок) */}
        <p className="text-gray-300 text-sm md:text-base mt-4 pb-20 text-center px-4">
          Чтобы загрузить свой подарок в Инвентарь, отправьте его{' '}
          <a href="https://t.me/mtshgames" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-bold">@mtshgames</a>
        </p>
      </div>

      {/* Новые кнопки Отмена, Сдать в лавку и Вернуть, появляются при выбранных подарках */}
      {totalSelectedUsdt > 0 && (
        <div className="w-full flex justify-center px-4 py-3 bg-gray-900 z-10 sticky bottom-0"> 
          <div className="flex w-full max-w-2xl space-x-4">
            <button
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-full shadow-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 text-lg"
              onClick={handleCancelSelection}
            >
              Отмена
            </button>
            <button
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 rounded-full shadow-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
              onClick={handleSellGifts}
            >
              Сдать в лавку
            </button>
            {/* НОВАЯ КНОПКА: Вернуть */}
            <button
              className="flex-1 bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 text-white font-bold py-3 rounded-full shadow-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
              onClick={handleReturnGifts}
            >
              Вернуть
            </button>
          </div>
        </div>
      )}
    </div>
  );

    // Данные для истории

  // Данные для рейтинга (моковые)
  /*const ratingUsers = [
    { id: 'user_1', name: 'Иван', volume: 1500, successful: 120, claimed: 80, imageUrl: 'https://placehold.co/40x40/FF5733/ffffff?text=U1' },
    { id: 'user_2', name: 'Мария', volume: 1200, successful: 100, claimed: 70, imageUrl: 'https://placehold.co/40x40/33FF57/ffffff?text=U2' },
    { id: 'user_3', name: 'Алексей', volume: 950, successful: 80, claimed: 60, imageUrl: 'https://placehold.co/40x40/3357FF/ffffff?text=U3' },
    { id: 'user_4', name: 'Елена', volume: 800, successful: 75, claimed: 55, imageUrl: 'https://placehold.co/40x40/FF33F5/ffffff?text=U4' },
    { id: 'user_5', name: 'Дмитрий', volume: 700, successful: 60, claimed: 45, imageUrl: 'https://placehold.co/40x40/F5FF33/000000?text=U5' },
    { id: 'user_6', name: 'Анна', volume: 650, successful: 55, claimed: 40, imageUrl: 'https://placehold.co/40x40/AABBCC/000000?text=U6' },
    { id: 'user_7', name: 'Сергей', volume: 580, successful: 50, claimed: 38, imageUrl: 'https://placehold.co/40x40/CCBBAA/000000?text=U7' },
    { id: 'user_8', name: 'Ольга', volume: 520, successful: 48, claimed: 35, imageUrl: 'https://placehold.co/40x40/DDCCBB/000000?text=U8' },
    { id: 'user_9', name: 'Павел', volume: 490, successful: 42, claimed: 30, imageUrl: 'https://placehold.co/40x40/EECCDD/000000?text=U9' },
    { id: 'user_10', name: 'Ксения', volume: 450, successful: 40, claimed: 28, imageUrl: 'https://placehold.co/40x40/CCDDEE/000000?text=U10' },
  ];*/

  // Моя карточка пользователя для рейтинга
  const myUserCard = {
    id: id,
    name: imya,
    volume: volume,
    successful: welled,
    claimed: mistaked,
    imageUrl: photo,
    rank: '#' + place.toString(), // Пример моего места в рейтинге
  };

  // Экран "История"
  const renderHistoryScreen = () => (
    <div className="flex-grow w-full flex flex-col items-center p-4 overflow-y-auto scrollbar-hide"> {/* flex-grow и overflow-y-auto для скролла */}
      {/* Новый центрированный текст над историей */}
      <div className="w-full max-w-lg text-center mb-4 p-3 rounded-lg cursor-pointer hover:underline" onClick={() => { setActiveTab('profile'); setProfileSubTab('rating'); }}>
        <p className="text-gray-300 text-sm md:text-base">
          Лучшие 50 клиентов нашей лавки за июль получат крутые NFT подарки!
          <br />
          Не пропусти: <a href="https://t.me/giftcashnews" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-bold">@giftcashnews</a>
        </p>
      </div>

      {/* Заголовки таблицы */}
      <div className="w-full max-w-lg flex text-gray-400 text-sm mb-2 px-2">
        <span className="w-5/12 text-left">Подарок</span>
        <span className="w-2/12 text-right">Цена</span>
        <span className="w-5/12 text-right">Тип</span>
      </div>

      {/* Список элементов истории */}
      <div className="w-full max-w-lg space-y-2"> {/* Убрал overflow-y-auto отсюда, теперь это на родительском div */}
        {historyArray.map((item) => (
          <div key={item.id} 
          className="bg-gray-800 rounded-lg p-3 flex items-center justify-between shadow-md" 
          onClick={() => {
              console.log(`Нажат блок истории: ${item.name} (${item.id})`);
              if (item.url) {
                window.open(item.url, '_blank');
              }
            }}>
            {/* Левая часть: Изображение, Название, ID */}
            <div className="flex items-center w-5/12 flex-shrink-0 pr-2">
              <LottieAnimation
                animationUrl={item.imageUrl}
                className="w-12 h-12 rounded-lg flex-shrink-0 mr-2" // Сохраняем размеры
              />
              <div className="flex flex-col text-left flex-grow overflow-hidden">
                <span className="text-white text-base font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                <span className="text-gray-400 text-xs"># {item.id.split('-')[0]}</span>
              </div>
            </div>

            {/* Средняя часть: Цена и Дата */}
            <div className="flex flex-col justify-center w-2/12 text-right flex-shrink-0">
              <span className="text-blue-400 text-base font-bold">{item.price}</span>
              <span className="text-gray-500 text-xs">{convertUnixToFormattedGMT(item.date).split('GMT')[0]}</span>
            </div>

            {/* Правая часть: Тип и Стрелка */}
            <div className="flex items-center justify-end w-5/12 flex-shrink-0">
              <span className="text-yellow-400 text-base font-semibold mr-2">{item.type}</span>
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Новый экран "Рейтинг"
  const renderRatingScreen = () => (
    <div className="flex-grow w-full flex flex-col items-center p-4 overflow-y-auto scrollbar-hide"> {/* flex-grow и overflow-y-auto для скролла */}
      {/* Новый центрированный текст над историей */}
      <div className="w-full max-w-lg text-center mb-4 p-3 rounded-lg">
        <p className="text-gray-300 text-sm md:text-base">
          Лучшие 50 клиентов нашей лавки за июль получат крутые NFT подарки!
          <br />
          Не пропусти: <a href="https://t.me/giftcashnews" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-bold">@giftcashnews</a>
        </p>
      </div>
      {/* Моя карточка пользователя */}
      <div className="w-full max-w-lg bg-blue-800 rounded-lg p-4 shadow-xl flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img src={myUserCard.imageUrl} alt="Мой Аватар" className="w-16 h-16 rounded-full mr-4 object-cover" />
          <div className="flex flex-col text-left">
            <p className="text-white text-lg font-bold">Моя Карточка</p>
            <p className="text-gray-300 text-sm">Объем: <span className="font-bold">{myUserCard.volume} USDT</span></p>
            <p className="text-gray-300 text-sm">Успешно: <span className="font-bold">{myUserCard.successful}</span></p>
            <p className="text-gray-300 text-sm">Забрано: <span className="font-bold">{myUserCard.claimed}</span></p>
          </div>
        </div>
        <span className="text-xl font-bold text-yellow-300">{myUserCard.rank}</span>
      </div>

      {/* Заголовки для списка рейтинга */}
      <div className="w-full max-w-lg flex text-gray-400 text-sm mb-2 px-2">
        <span className="w-4/12 text-left flex-shrink-0">Пользователь</span>
        <span className="w-2/12 text-right flex-shrink-0">Объем</span>
        <span className="w-3/12 text-right flex-shrink-0">Успешно</span>
        <span className="w-3/12 text-right flex-shrink-0">Забрано</span>
      </div>

      {/* Вертикальный Scroll View для других пользователей в рейтинге */}
      <div className="w-full max-w-lg space-y-2"> {/* Убрал h-64/md:h-80 и overflow-y-auto, теперь на родительском div */}
        {ratingArray.map((user) => (
          <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between shadow-md">
            <div className="flex items-center w-4/12 flex-shrink-0">
              <img src={user.photo} alt={""} className="w-10 h-10 rounded-full mr-3 flex-shrink-0" />
              <div className="flex flex-col text-left overflow-hidden pr-2">
                <span className="text-white text-base font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{user.name}</span>
              </div>
            </div>
            <span className="w-2/12 text-right text-blue-400 font-bold flex-shrink-0">{user.volume}</span>
            <span className="w-3/12 text-right text-green-400 font-bold flex-shrink-0">{user.welled}</span>
            <span className="w-3/12 text-right text-yellow-400 font-bold flex-shrink-0">{user.mistaked}</span>
          </div>
        ))}
      </div>
    </div>
  );

  /*// Моковые данные для карточек в "Лавочке Профиля", а надо бы с БД их брать
  const profileLavkaItems = [
    {
      id: '124370',
      items: ['Plush Pepe #124', 'Love Candle #52', 'Santa Hat #2023'],
      animationUrl: COMMON_LOTTIE_URL,
    },
    {
      id: '987654',
      items: ['Rare Item #001', 'Magic Orb #7', 'Dragon Scale #12'],
      animationUrl: COMMON_LOTTIE_URL,
    },
    {
      id: '112233',
      items: ['Golden Coin #5', 'Silver Bar #10', 'Bronze Statue #1'],
      animationUrl: COMMON_LOTTIE_URL,
    },
    {
      id: '445566',
      items: ['Ancient Scroll #99', 'Mystic Potion #3', 'Shadow Cloak #1'],
      animationUrl: COMMON_LOTTIE_URL,
    },
    {
      id: '778899',
      items: ['Crystal Shard #77', 'Enchanted Ring #2', 'Phoenix Feather #5'],
      animationUrl: COMMON_LOTTIE_URL,
    },
    {
      id: '101010',
      items: ['Divine Blade #1', 'Heroic Shield #2', 'Valiant Helmet #3'],
      animationUrl: COMMON_LOTTIE_URL,
    },
  ];*/

// Экран "Лавочка" в Профиле (profileSubTab === 'lavka_sub')
  const renderProfileLavkaScreen = () => (
    <div className="flex-grow w-full flex flex-col items-center p-4 overflow-y-auto scrollbar-hide relative">
       {/* Toggle Switch Block */}
            <div className="w-full max-w-lg bg-gray-800 rounded-lg p-4 shadow-xl flex items-center justify-between mb-4">
                <div className="flex items-center">
                    {/* Toggle switch visual */}
                    <div
                        className={`relative w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-0 ease-in-out ${isInternalPurchaseEnabled ? 'bg-blue-500' : 'bg-gray-600'}`}
                        onClick={() => {
                            setIsInternalPurchaseEnabled(prev => !prev);
                            // Setauto(isInternalPurchaseEnabled); // Эта функция пока не определена в предоставленном коде
                        }}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-150 ease-in-out ${isInternalPurchaseEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="text-white text-lg ml-3">Автопогашение</span>
                </div>
                {/* "i" icon for info panel */}
                <button
                    onClick={() => setShowInfoPanel(true)}
                    className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9.5 9.5a1.5 1.5 0 00-1.5 1.5v3a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-3a1.5 1.5 0 00-1.5-1.5h-1z" clipRule="evenodd"></path>
                    </svg>
                </button>
            </div>
      {/* Scroll View из карточек */}
      <div className="w-full max-w-lg space-y-4 pb-20"> {/* Добавлен pb-20 для отступа от кнопки */}
        {debtsArray.map((card) => (
          <div key={card.id} className="bg-gray-800 p-4 shadow-xl flex items-start rounded-lg relative min-h-48"> {/* УМЕНЬШЕНА min-h-48 (было min-h-56) */}
            {/* "i" icon */}
            <div>
            <button 
            onClick={() => setShowInfo2Panel(true)}
             className="absolute top-2 left-2 p-1 hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 rounded-full">
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9.5 9.5a1.5 1.5 0 00-1.5 1.5v3a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-3a1.5 1.5 0 00-1.5-1.5h-1z" clipRule="evenodd"></path>
              </svg> </button>
            </div>
            
            {/* ID on top right */}
            <span className="absolute top-2 right-2 text-gray-400 text-sm font-mono">#{card.id}</span>

            <div className="flex-1 flex flex-col ml-8 mr-4 pt-4"> {/* Adjusted margin for icon, добавлено pt-4 */}
              {card.items.map((item, index) => (
                <span key={index} className="text-white text-base py-0.5">{item}</span>
              ))}
            </div>

{/* Image placeholder (теперь LottieAnimation) */}
            <LottieAnimation
              animationUrl={card.animationUrl}
              className="w-24 h-24 rounded-lg flex-shrink-0 border border-gray-600 mt-4 mr-2" // Сохраняем размеры
            />


            {/* Return Gifts button */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)]"> {/* Full width minus padding */}
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500" onClick={() => { // Modified onClick handler
                  if (walletConnected) {
                    // запрос долга на сервер
                    // Берем с сервера баланс кошелька!
                    /*let BausdtlanceNano;
                    const sendInitDataToServer = async (): Promise<string> => {
                      try {
                        console.log("Отправляем запрос на сервер...");
                        // ИЗМЕНИТЕ ЭТУ СТРОКУ НА АДРЕС ВАШЕГО РАЗВЕРНУТОГО HEROKU СЕРВЕРА
                        const response = await fetch('https://ВАШЕ_УНИКАЛЬНОЕ_ИМЯ_ПРИЛОЖЕНИЯ.herokuapp.com/api/initData', { // <-- ИЗМЕНЕНО ЗДЕСЬ
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ userId: 'user123', someOtherData: 'hello' }),
                        });

                        if (!response.ok) {
                          console.log("Ошибка сервера:", response.statusText);
                          throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
                        }
                        const responseText = await response.text();
                        console.log("Получен ответ от сервера:", responseText);
                        usdtBalanceNano = parseInt(responseText);
                        return responseText;
                      } catch (error: any) {
                        console.error("Ошибка при отправке initData на сервер:", error);
                        throw new Error("Ошибка при отправке initData на сервер.");
                      }
                    };*/

                    const usdtBalanceNano = usdtHave;
                    
                    if (usdtBalanceNano)
                    {
                        const have = usdtBalanceNano;
                        // запрос долга на сервер
                        const sendInitDataToServer = async (initData: string) => {
                          // !!! ЗАМЕНИТЕ ЭТО НА ВАШ РЕАЛЬНЫЙ URL СЕРВЕРА PYTHONANYWHERE !!!
                          const serverUrl = "https://racer.pythonanywhere.com/getdebtrequired"; // сколько нужно на его закрытие?

                          const formData = new URLSearchParams();
                          formData.append('initData', initData);
                          formData.append('id', card.id);

                          try {
                              const response = await fetch(serverUrl, {
                                  method: 'POST',
                                  body: formData, 
                              });

                              if (!response.ok) {
                                  //throw new Error(`Ошибка сервера`);
                                  console.log("Ошибка сервера");
                              } else{
                                const result = await response.json();
                                const required  = result.required;
                                const intRequired = parseInt(required);

                                const s = "";

                                if (intRequired > have)
                                {
                                    testSendUsdt(required - have, s)
                                }
                                else
                                {
                                  // Помечаем долг как погашенный (JS скрипт прогоняется по всем таковым долгам, закрывая их)
                                  Pogasit(card.id);
                                  // Show green screen
                                }
                                
                                

                                
                              }
                              
                          } catch (error) {
                              console.log("Ошибка при отправке initData на сервер:", error);
                              return "333333333333333333333"
                          }
                        };
                        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
  sendInitDataToServer(window.Telegram.WebApp.initData);}
                    };   
                  }
                  else {
                    handleConnectWallet(); // Call the same logic as the main connect button
                  }
                }}>
                Вернуть подарки
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Фиксированная прозрачная кнопка "+" "Забрать больше USDT" */}
      <div className="w-full flex justify-center sticky bottom-0 z-10 p-4 pt-0">
        <button 
          className="flex items-center justify-center w-full max-w-sm bg-transparent border border-blue-400 text-blue-400 font-semibold py-2 px-4 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg hover:bg-blue-900 hover:bg-opacity-20"
          onClick={() => { setActiveTab('inventory'); setProfileSubTab('lavka_sub'); }} // Переход на Инвентарь
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Забрать больше USDT
        </button>
      </div>
      {/* Info Panel Modal */}
      {showInfoPanel && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInfoPanel(false)} // Close when clicking outside the panel content
        >
          <div
            className="bg-gray-800 rounded-lg p-6 shadow-2xl max-w-sm w-full relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the panel content
          >
            <h3 className="text-xl font-bold text-white mb-4">Как это работает?</h3>
            <p className="text-gray-300 text-base">
              При включенной функции каждое достаточное пополнение баланса USDT будет само закрывать долги, причем в случайном порядке.
              Не используйте эту фунцкцию, если хотите забрать некоторые подарки очереднее других!
            </p>
            {/* Optional close button inside the panel */}
            <button
              onClick={() => setShowInfoPanel(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
      {showInfo2Panel && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInfo2Panel(false)} // Close when clicking outside the panel content
        >
          <div
            className="bg-gray-800 rounded-lg p-6 shadow-2xl max-w-sm w-full relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the panel content
          >
            <p className="text-gray-300 text-base">
              Только 1-3 подарка могут показываться на этой карточке
            </p>
            {/* Optional close button inside the panel */}
            <button
              onClick={() => setShowInfo2Panel(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );


  // Экран "Профиль"
  const renderProfileScreen = () => (
    // Этот div теперь занимает всю доступную высоту в 'main' и содержит свой скролл
    <div className="flex-grow w-full flex flex-col items-center">
      {/* Локальный хедер с кнопками подвкладок - ФИКСИРОВАН ВВЕРХУ ЭТОГО ЭКРАНА */}
      <div className="w-full flex justify-around items-center py-3 px-4 mb-4 bg-gray-800 shadow-md flex-shrink-0 sticky top-0 z-20"> 
        <button
          onClick={() => setProfileSubTab('lavka_sub')}
          className={`text-lg sm:text-xl font-bold px-3 py-1 sm:px-4 sm:py-2 rounded-full ${profileSubTab === 'lavka_sub' ? 'text-blue-400 bg-gray-700' : 'text-gray-400'} hover:text-white transition-colors duration-200 focus:outline-none`}
        >
          Лавка
        </button>
        <button
          onClick={() => setProfileSubTab('friends')}
          className={`text-lg sm:text-xl font-bold px-3 py-1 sm:px-4 sm:py-2 rounded-full ${profileSubTab === 'friends' ? 'text-blue-400 bg-gray-700' : 'text-gray-400'} hover:text-white transition-colors duration-200 focus:outline-none`}
        >
          Друзья
        </button>
        <button
          onClick={() => setProfileSubTab('history')}
          className={`text-lg sm:text-xl font-bold px-3 py-1 sm:px-4 sm:py-2 rounded-full ${profileSubTab === 'history' ? 'text-blue-400 bg-gray-700' : 'text-gray-400'} hover:text-white transition-colors duration-200 focus:outline-none`}
        >
          История
        </button>
        {/* Кнопка Рейтинг удалена отсюда */}
        {/* <button
          onClick={() => setProfileSubTab('rating')}
          className={`text-lg sm:text-xl font-bold px-3 py-1 sm:px-4 sm:py-2 rounded-full ${profileSubTab === 'rating' ? 'text-blue-400 bg-gray-700' : 'text-gray-400'} hover:text-white transition-colors duration-200 focus:outline-none`}
        >
          Рейтинг
        </button> */}
      </div>

      {/* Условный рендеринг содержимого подвкладок - этот div теперь прокручивается */}
      <div className="flex-grow w-full flex flex-col items-center overflow-y-auto scrollbar-hide">
        {profileSubTab === 'lavka_sub' && renderProfileLavkaScreen()} {/* ИСПОЛЬЗУЕМ НОВЫЙ ЭКРАН */}
        {profileSubTab === 'friends' && (
          <div className="w-full bg-gray-800 p-6 shadow-xl text-center"> 
            <h2 className="text-2xl font-bold text-white mb-2">Приглашай друзей</h2>
            <p className="text-gray-300 text-base mb-6">Зарабатывай 40% с комиссионных каждого реферала!</p>

            <div className="flex items-center justify-center space-x-3 mb-4">
              {/* Кнопка-иконка для копирования */}
              <button
                onClick={() => copyToClipboard(referralLink)}
                className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 p-3 rounded-full shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v4m0 0l-3 3m3-3l3 3m0 0V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-4"></path>
                </svg>
              </button>

              {/* Поле для отображения и копирования ссылки */}
              <div
                onClick={() => copyToClipboard(referralLink)}
                className="flex-grow bg-gray-700 text-gray-200 text-sm px-4 py-3 cursor-pointer select-all break-words text-left hover:bg-gray-600 transition duration-200 ease-in-out" 
                title="Нажмите, чтобы скопировать"
              >
                {referralLink}
              </div>
            </div>

            {/* Сообщение о копировании */}
            {copyMessage && (
              <p className="text-green-400 text-sm mt-2 animate-fade-in-out">
                {copyMessage}
              </p>
            )}
          </div>
        )}
        {profileSubTab === 'history' && renderHistoryScreen()}
        {profileSubTab === 'rating' && renderRatingScreen()}
      </div>
    </div>
  );

  // --- Основная структура приложения ---
  return (
    <>
    {/* Загрузочный экран - показывается, когда isLoading === true */}
      {isLoading ? (
        <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
          <LottieAnimation animationUrl={"https://nft.fragment.com/gift/plushpepe-1173.lottie.json"} className="w-128 h-128" />
          <p className="text-white text-xl mt-4">Загрузка и проверка данных...</p>
        </div>
      ) : (
    // Главный контейнер приложения. h-screen для полной высоты, flex-col для вертикального размещения
    <div className="h-screen w-full bg-gray-900 flex flex-col items-center justify-between font-inter text-white">
      {/* Верхняя панель: фиксирована */}
      <header className="w-full flex justify-between items-center px-4 py-5 sm:px-6 md:px-8 max-w-7xl flex-shrink-0"> 
        {/* Левая верхняя кнопка: значение счетчика */}
        <button
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 sm:py-2 sm:px-4 rounded-full shadow-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 text-sm sm:text-base"
          onClick={() => { setActiveTab('profile'); setProfileSubTab('rating'); }} // Переход на Рейтинг
        >
          
          {/* Текст */}
          <span>{myUserCard.rank}</span>
        </button>

        {/* Баланс */}
        <div
          className="flex items-center bg-green-600 text-white font-bold py-1 px-3 sm:py-2 sm:px-4 rounded-full shadow-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 text-sm sm:text-base"
        >
           {/* Изображение 1 (TON) */}
          <img src="https://placehold.co/20x20/1DA1F2/ffffff?text=T" alt="[Иконка TON]" className="w-5 h-5 mr-1 rounded-full" />
          
          {/* Текст */}
          <span>{toDouble(usdtHave)} USDT</span>
        </div>

        {/* Правая верхняя кнопка: подключение кошелька TON */}
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 sm:py-2 sm:px-4 rounded-full shadow-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 text-sm sm:text-base"
        onClick={handleConnectOrDisconnectWallet}
        >
          {/* Текст: теперь текст зависит от статуса подключения TonConnectUI */}
          <span className="whitespace-nowrap">{walletConnected ? shorter(walletAddress) : 'Подключить кошелек'}</span>
      
        </button>
      </header>

      {/* Центральная часть: теперь она сама прокручивается */}
      <main className="flex-grow w-full flex flex-col items-center overflow-y-auto">
        {/* Условный рендеринг центрального контента в зависимости от активной вкладки */}
        {activeTab === 'lavka' && (
                <>
                    {hideBackBut()} {/* Эта функция выполняется первой */}
                    {renderLavkaScreen()} {/* А эта возвращает JSX для отображения */}
                </>
            )}
        {activeTab === 'inventory' && (
                <>
                    {showBackBut()} {/* Эта функция выполняется первой */}
                    {renderInventoryScreen()} {/* А эта возвращает JSX для отображения */}
                </>
            )}
        {activeTab === 'profile' && (
                <>
                    {showBackBut()} {/* Эта функция выполняется первой */}
                    {renderProfileScreen()} {/* А эта возвращает JSX для отображения */}
                </>
            )}
      </main>

      {/* Нижняя панель с 3 кнопками: фиксирована */}
      <footer className="w-full bg-gray-800 shadow-xl p-4 flex justify-around items-center flex-shrink-0">
        {/* Кнопка 1: ЛАВКА */}
        <button
          className={`flex flex-col items-center p-2 transition duration-200 ease-in-out focus:outline-none flex-grow mx-1 ${activeTab === 'lavka' ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}
          onClick={() => setActiveTab('lavka')}
        >
          {/* Иконка SVG для "ЛАВКА" */}
          <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m7 0V5a2 2 0 012-2h2a2 2 0 012 2v6m-6 0H6"></path>
          </svg>
          <span className="text-sm">Лавка</span>
        </button>

        {/* Кнопка 2: ИНВЕНТАРЬ */}
        <button
          className={`flex flex-col items-center p-2 transition duration-200 ease-in-out focus:outline-none flex-grow mx-1 ${activeTab === 'inventory' ? 'text-blue-400' : 'text-gray-300'} hover:text-white transition-colors duration-200`}
          onClick={() => setActiveTab('inventory')}
        >
          {/* Иконка SVG для "ИНВЕНТАРЬ" */}
          <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          <span className="text-sm">Инвентарь</span>
        </button>

        {/* Кнопка 3: Профиль */}
        <button
          className={`flex flex-col items-center p-2 transition duration-200 ease-in-out focus:outline-none flex-grow mx-1 ${activeTab === 'profile' ? 'text-blue-400' : 'text-gray-300'} hover:text-white transition-colors duration-200`}
          onClick={() => setActiveTab('profile')}
        >
          {/* Иконка SVG для "Профиль" */}
          <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <span className="text-sm">Профиль</span>
        </button>
      </footer>
    </div>
  )}
  {/* Уведомление (тост) */}
            {notification && (
                <NotificationToast
                    key={notificationKey} // Добавлен уникальный ключ
                    message={notification.message}
                    animationUrl={notification.animationUrl}
                    type={notification.type}
                    onClose={hideNotification}
                />
            )}
    </>
  );
}

export default App;