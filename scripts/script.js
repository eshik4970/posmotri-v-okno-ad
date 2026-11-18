/* РљРћРќР¤РР“ */
const preloaderWaitindTime = 1200;
const cardsOnPage = 5;
const BASE_URL = 'https://v-content.ffapi.ru';
const endpoint = `${BASE_URL}/api/videos?pagination[pageSize]=${cardsOnPage}&`;

/* РР›Р•РњР•РќРўР« РЎРўР РђРќРР¦Р« */
const cardsList = document.querySelector('.content__list');
const cardsContainer = document.querySelector('.content__list-container');
const videoContainer = document.querySelector('.result__video-container');
const videoElement = document.querySelector('.result__video');
const form = document.querySelector('form');

/* РўР•РњРџР›Р•Р™РўР« */
const cardTmp = document.querySelector('.cards-list-item-template');
const preloaderTmp = document.querySelector('.preloader-template');
const videoNotFoundTmp = document.querySelector('.error-template');
const moreButtonTmp = document.querySelector('.more-button-template');

/* РњР•РҐРђРќРРљРђ */

// РќСѓР¶РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ РїРµСЂРµРєР»СЋС‡Р°С‚РµР»СЏРјРё
let cardsOnPageState = [];

// РџРµСЂРІР°СЏ Р·Р°РіСЂСѓР·РєР°

showPreloader(preloaderTmp, videoContainer);
showPreloader(preloaderTmp, cardsContainer);
mainMechanics(endpoint);

// РѕСЃСѓС‰РµСЃС‚РІР»СЏРµС‚СЃСЏ РїРѕРёСЃРє
form.onsubmit = (e) => {
  e.preventDefault();

  cardsList.textContent = '';
  const buttonInDOM = cardsContainer.querySelector('.more-button');
  if (buttonInDOM) {
    buttonInDOM.remove();
  }

  [...videoContainer.children].forEach((el) => {
    el.className === 'error' && el.remove();
  });

  showPreloader(preloaderTmp, videoContainer);
  showPreloader(preloaderTmp, cardsContainer);

  const formData = serializeFormData(form);
  const requestUrl = generateFilterRequest(
    endpoint,
    formData.city,
    formData.timeArray
  );

  mainMechanics(requestUrl);
};

/* Р¤РЈРќРљР¦РРЇ, РљРћРўРћР РђРЇ Р’РЎР• Р“Р•РќР•Р РРў */

async function mainMechanics(endpoint) {
  try {
    const data = await (await fetch(endpoint)).json();
    cardsOnPageState = data.results;

    if (!data?.results?.[0]) {
      throw new Error('not-found');
    }

    appendCards({
      baseUrl: BASE_URL,
      dataArray: data.results,
      cardTmp,
      container: cardsList,
    });

    setVideo({
      baseUrl: BASE_URL,
      video: videoElement,
      videoUrl: data.results[0].video.url,
      posterUrl: data.results[0].poster.url,
    });
    document
      .querySelectorAll('.content__card-link')[0]
      .classList.add('content__card-link_current');
    await waitForReadyVideo(videoElement);
    await delay(preloaderWaitindTime);
    removePreloader(videoContainer, '.preloader');
    removePreloader(cardsContainer, '.preloader');

    // Р”РѕР±Р°РІР»СЏРµРј РєР»Р°СЃСЃ РґР»СЏ СЃС‚РёР»РёР·Р°С†РёРё СЃРєСЂРѕР»Р»Р±Р°СЂР°
    cardsContainer.classList.add('custom-scrollbar');

    chooseCurrentVideo({
      baseUrl: BASE_URL,
      videoData: cardsOnPageState,
      cardLinksSelector: '.content__card-link',
      currentLinkClassName: 'content__card-link_current',
      mainVideo: videoElement,
    });

    showMoreCards({
      dataArray: data,
      buttonTemplate: moreButtonTmp,
      cardsList,
      buttonSelector: '.more-button',
      initialEndpoint: endpoint,
      baseUrl: BASE_URL,
      cardTmp: cardTmp,
    });
  } catch (err) {
    if (err.message === 'not-found') {
      showError(videoContainer, videoNotFoundTmp, 'РќРµС‚ РїРѕРґС…РѕРґСЏС‰РёС… РІРёРґРµРѕ =(');
    } else {
      showError(videoContainer, videoNotFoundTmp, 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РґР°РЅРЅС‹С… :(');
    }
    console.log(err);
    removePreloader(videoContainer, '.preloader');
    removePreloader(cardsContainer, '.preloader');
  }
}

/* РЈРўРР›РРўР« */

// РџСЂРѕСЃС‚РѕР№ РїСЂРѕРјРёСЃ, С‡С‚РѕР±С‹ Р»РµРіС‡Рµ СЃС‚Р°РІРёС‚СЊ РїР°СѓР·Сѓ

async function delay(ms) {
  return await new Promise((resolve) => {
    return setTimeout(resolve, ms);
  });
}

// РџСЂРѕРјРёСЃ, РєРѕС‚РѕСЂС‹Р№ СЂРµР·РѕР»РІРёС‚СЃСЏ, РµСЃР»Рё РІРёРґРµРѕ С†РµР»РёРєРѕРј РіРѕС‚РѕРІРѕ Рє РїСЂРѕРёРЅСЂС‹РІР°РЅРёСЋ Р±РµР· РїР°СѓР·

async function waitForReadyVideo(video) {
  return await new Promise((resolve) => {
    video.oncanplaythrough = resolve;
  });
}

// РЈСЃС‚Р°РЅР°РІР»РёРІР°РµС‚ РїСЂРµР»РѕР°РґРµСЂ РЅР° РІСЂРµРјСЏ Р·Р°РіСЂСѓР·РєРё РґР°РЅРЅС‹С…
function showPreloader(tmp, parent) {
  const node = tmp.content.cloneNode(true);
  parent.append(node);
  console.log('РїРѕРєР°Р·Р°Р» РїСЂРµР»РѕР°РґРµСЂ');
}

// РЈР±РёСЂР°РµС‚ РїСЂРµР»РѕР°РґРµСЂ РёР· DOM
function removePreloader(parent, preloaderSelector) {
  const preloader = parent.querySelector(preloaderSelector);
  if (preloader) {
    preloader.remove();
  }

  console.log('СѓР±СЂР°Р» РїСЂРµР»РѕР°РґРµСЂ');
}

// Р”РѕР±Р°РІР»СЏРµС‚ РєР°СЂС‚РѕС‡РєРё РІ РєРѕРЅС‚РµР№РЅРµСЂ, СЃРѕР±РёСЂР°СЏ РёС… РёР· РґР°РЅРЅС‹С… API
function appendCards({ baseUrl, dataArray, cardTmp, container }) {
  dataArray.forEach((el) => {
    const node = cardTmp.content.cloneNode(true);
    node.querySelector('a').setAttribute('id', el.id);
    node.querySelector('.content__video-card-title').textContent = el.city;
    node.querySelector('.content__video-card-description').textContent =
      el.description;
    node
      .querySelector('.content__video-card-thumbnail')
      .setAttribute('src', `${baseUrl}${el.thumbnail.url}`);
    node
      .querySelector('.content__video-card-thumbnail')
      .setAttribute('alt', el.description);
    container.append(node);
  });
  console.log('РЎРіРµРЅРµСЂРёСЂРѕРІР°Р» РєР°СЂС‚РѕС‡РєРё');
}

// РЈСЃС‚Р°РЅР°РІР»РёРІРµС‚ РІРЅСѓР¶РЅРѕРµ РІРёРґРµРѕ РІ РєРѕРЅС‚РµР№РЅРµСЂ
function setVideo({ baseUrl, video, videoUrl, posterUrl }) {
  video.setAttribute('src', `${baseUrl}${videoUrl}`);
  video.setAttribute('poster', `${baseUrl}${posterUrl}`);
  console.log('РџРѕРґСЃС‚Р°РІРёР» РІРёРґРµРѕ РІ РѕСЃРЅРѕРІРЅРѕР№ Р±Р»РѕРє');
}

// РїРѕР»СѓС‡Р°РµС‚ РґР°РЅРЅС‹Рµ РёР· С„РѕСЂРјС‹ Рё СЃРµСЂРёР°Р»РёР·СѓРµС‚ РєР°Рє РЅР°РґРѕ

function serializeFormData(form) {
  const city = form.querySelector('input[name="city"]');
  const checkboxes = form.querySelectorAll('input[name="time"]');
  const checkedValuesArray = [...checkboxes].reduce((acc, item) => {
    item.checked && acc.push(item.value);
    return acc;
  }, []);
  console.log('РЎРѕР±СЂР°Р» РґР°РЅРЅС‹Рµ С„РѕСЂРјС‹ РІ РѕР±СЉРµРєС‚');
  return {
    city: city.value,
    timeArray: checkedValuesArray,
  };
}

// Р“РµРЅРµСЂРёСЂСѓРµС‚ СЃС‚СЂРѕРєСѓ СЃ С„РёР»СЊС‚СЂР°РјРё Р·Р°РїСЂРѕСЃРѕРІ РІ API РІ Р·Р°РІРёСЃРёРјРѕСЃС‚Рё РѕС‚ РґР°РЅРЅС‹С… РёР· С„РѕСЂРјС‹
function generateFilterRequest(endpoint, city, timeArray) {
  if (city) {
    endpoint += `filters[city][$containsi]=${city}&`;
  }
  if (timeArray) {
    timeArray.forEach((timeslot) => {
      endpoint += `filters[time_of_day][$eqi]=${timeslot}&`;
    });
  }
  console.log('РЎРіРµРЅРµСЂРёСЂРѕРІР°Р» СЃС‚СЂРѕРєСѓ Р°РґСЂРµСЃР° Р·Р°РїСЂРѕСЃР° РІ API РёР· РґР°РЅРЅС‹С… С„РѕСЂРјС‹');
  return endpoint;
}

// РїРµСЂРµРєР»СЋС‡Р°РµС‚ С‚РµРєСѓС‰РµРµ РІРёРґРµРѕ
function chooseCurrentVideo({
  baseUrl,
  videoData,
  cardLinksSelector,
  currentLinkClassName,
  mainVideo,
}) {
  const cardsList = document.querySelectorAll(cardLinksSelector);
  if (cardsList) {
    cardsList.forEach((item) => {
      item.onclick = async (e) => {
        e.preventDefault();
        cardsList.forEach((item) => {
          item.classList.remove(currentLinkClassName);
        });
        item.classList.add(currentLinkClassName);
        showPreloader(preloaderTmp, videoContainer);
        const vidoObj = videoData.find(
          (video) => String(video.id) === String(item.id)
        );
        setVideo({
          baseUrl,
          video: mainVideo,
          videoUrl: vidoObj.video.url,
          posterUrl: vidoObj.poster.url,
        });
        await waitForReadyVideo(mainVideo);
        await delay(preloaderWaitindTime);
        removePreloader(videoContainer, '.preloader');
        console.log('РџРµСЂРµРєР»СЋС‡РёР» РІРёРґРµРѕ');
      };
    });
  }
}

// РІС‹РІРѕР¶Сѓ РёРЅС‚РµСЂС„РµР№СЃ, РєРѕРіРґР° РІРёРґРµРѕ РЅРµ РЅР°Р№РґРµРЅРѕ 
function showError(container, errorTemplate, errorMessage) {
  const node = errorTemplate.content.cloneNode(true);
  node.querySelector('.error__title').textContent = errorMessage;
  container.append(node);
  console.log('РїРѕРєР°Р·Р°Р», РѕС€РёР±РєСѓ');
}

// РІС‹РІРѕР¶Сѓ Р±РѕР»СЊС€Рµ РІРёРґРµРѕ, РµСЃР»Рё РІ РїР°РіРёРЅР°С†РёРё Р±РѕР»СЊС€Рµ СЃС‚СЂР°РЅРёС†, С‡РµРј РїРѕРєР°Р·Р°РЅРѕ

function showMoreCards({
  dataArray,
  buttonTemplate,
  cardsList,
  buttonSelector,
  initialEndpoint,
  baseUrl,
  cardTmp,
}) {
  if (dataArray.pagination.page === dataArray.pagination.pageCount) return;
  // РґРѕР±Р°РІРёС‚СЊ РєРЅРѕРїРєСѓ РёР· С‚РµРјРїР»РµР№С‚Р° РІ РєРѕРЅРµС† СЃРїРёСЃРєР° РєР°СЂС‚РѕС‡РµРє
  const button = buttonTemplate.content.cloneNode(true);
  cardsContainer.append(button);
  // Р’С‹Р±РµСЂРµРј РґРѕР±Р°РІР»РµРЅРЅС‹Р№ СЌР»РµРјРµРЅС‚ РїРѕ СЃРµР»РµРєС‚РѕСЂСѓ Рё РґРѕР±Р°РІРёРј СЃР»СѓС€Р°С‚РµР»СЊ РєР»РёРєР°
  const buttonInDOM = cardsContainer.querySelector(buttonSelector);
  buttonInDOM.addEventListener('click', async () => {
    // РїРѕ РєР»РёРєСѓ Р·Р°РїСЂРѕСЃРёРј РґР°РЅРЅС‹Рµ РґР»СЏ СЃР»РµРґСѓСЋС‰РµР№ СЃС‚СЂР°РЅРёС†С‹
    let currentPage = dataArray.pagination.page;
    let urlToFetch = `${initialEndpoint}pagination[page]=${(currentPage += 1)}&`;
    try {
      let data = await (await fetch(urlToFetch)).json();
      buttonInDOM.remove();
      cardsOnPageState = cardsOnPageState.concat(data.results);
      appendCards({
        baseUrl,
        dataArray: data.results,
        cardTmp,
        container: cardsList,
      });
      chooseCurrentVideo({
        baseUrl: BASE_URL,
        videoData: cardsOnPageState,
        cardLinksSelector: '.content__card-link',
        currentLinkClassName: 'content__card-link_current',
        mainVideo: videoElement,
      });
      showMoreCards({
        dataArray: data,
        buttonTemplate,
        cardsList,
        buttonSelector,
        initialEndpoint,
        baseUrl,
        cardTmp,
      });
    } catch (err) {
      return err;
    }
  });
}
