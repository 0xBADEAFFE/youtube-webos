/*global navigate*/
import './spatial-navigation-polyfill.js';
import './ui.css';
import { configRead, configWrite } from './config.js';

// We handle key events ourselves.
window.__spatialNavigation__.keyMode = 'NONE';

const ARROW_KEY_CODE = { 37: 'left', 38: 'up', 39: 'right', 40: 'down' };

const KEY_MAPPINGS = {
  red: [403, 166],
  green: [404, 172],
  yellow: [405, 170],
  blue: [406, 167]
};

const uiContainer = document.createElement('div');
uiContainer.classList.add('ytaf-ui-container');
uiContainer.style['display'] = 'none';
uiContainer.setAttribute('tabindex', 0);
uiContainer.addEventListener('focus', () => console.info('uiContainer focused!'), true);
uiContainer.addEventListener('blur', () => console.info('uiContainer blured!'), true);

let cursorVisible = false;
document.addEventListener('cursorStateChange', (evt) => {
  cursorVisible = evt.detail.visibility;
  console.info('Cursor visibility:', cursorVisible);
}, false);

uiContainer.addEventListener("keydown", (evt) => {
  console.info('uiContainer key event:', evt.type, evt.charCode);
  if (evt.charCode !== 404 && evt.charCode !== 172) {
    if (evt.keyCode in ARROW_KEY_CODE) {
      navigate(ARROW_KEY_CODE[evt.keyCode]);
    } else if (evt.keyCode === 13) { // "OK" button
      // Key event is emitted when clicking with a cursor as well, which leads
      // to double activation
      if (!cursorVisible) {
        document.querySelector(':focus').click();
      }
    } else if (evt.keyCode === 27) { // Back button
      uiContainer.style.display = 'none';
      uiContainer.blur();
    }
    evt.preventDefault();
    evt.stopPropagation();
  }
}, true);

uiContainer.innerHTML = `
<h1>webOS YouTube AdFree Settings</h1>
<label for="__notifications"><label class="switch"><input type="checkbox" id="__notifications"><span class="slider round"></span></label> Show notification messages</label>
<label for="__hide_logo"><label class="switch"><input type="checkbox" id="__hide_logo"><span class="slider round"></span></label> Hide YouTube logo (recommended on OLEDs)</label>
<label for="__adblock"><label class="switch"><input type="checkbox" id="__adblock"><span class="slider round"></span></label> Enable AdBlocking</label>
<label for="__sponsorblock"><label class="switch"><input type="checkbox" id="__sponsorblock"><span class="slider round"></span></label> Enable SponsorBlock</label>
<blockquote>
<label for="__sponsorblock_sponsor"><label class="switch"><input type="checkbox" id="__sponsorblock_sponsor"><span class="slider round"></span></label> Skip Sponsor Segments</label>
<label for="__sponsorblock_intro"><label class="switch"><input type="checkbox" id="__sponsorblock_intro"><span class="slider round"></span></label> Skip Intro Segments</label>
<label for="__sponsorblock_outro"><label class="switch"><input type="checkbox" id="__sponsorblock_outro"><span class="slider round"></span></label> Skip Outro Segments</label>
<label for="__sponsorblock_interaction"><label class="switch"><input type="checkbox" id="__sponsorblock_interaction"><span class="slider round"></span></label> Skip Interaction Reminder Segments</label>
<label for="__sponsorblock_selfpromo"><label class="switch"><input type="checkbox" id="__sponsorblock_selfpromo"><span class="slider round"></span></label> Skip Self Promotion Segments</label>
<label for="__sponsorblock_music_offtopic"><label class="switch"><input type="checkbox" id="__sponsorblock_music_offtopic"><span class="slider round"></span></label> Skip Music and Off-topic Segments</label>
</blockquote>
<div><small>Sponsor segments skipping - https://sponsor.ajay.app</small></div>
`;

document.querySelector('body').appendChild(uiContainer);

function bindCheckbox(selector, config) {
  uiContainer.querySelector(selector).checked = configRead(config);
  uiContainer.querySelector(selector).addEventListener('change', (evt) => {
    configWrite(config, evt.target.checked);
  });
}

bindCheckbox('#__notifications', 'enableNotifications');
bindCheckbox('#__adblock', 'enableAdBlock');
bindCheckbox('#__sponsorblock', 'enableSponsorBlock');
bindCheckbox('#__sponsorblock_sponsor', 'enableSponsorBlockSponsor');
bindCheckbox('#__sponsorblock_intro', 'enableSponsorBlockIntro');
bindCheckbox('#__sponsorblock_outro', 'enableSponsorBlockOutro');
bindCheckbox('#__sponsorblock_interaction', 'enableSponsorBlockInteraction');
bindCheckbox('#__sponsorblock_selfpromo', 'enableSponsorBlockSelfPromo');
bindCheckbox('#__sponsorblock_music_offtopic', 'enableSponsorBlockMusicOfftopic');
bindCheckbox('#__hide_logo', 'hideLogo');

function updateCheckbox(selector, config) {
  uiContainer.querySelector(selector).checked = configRead(config);
}

function updateUI() {
  updateCheckbox('#__notifications', 'enableNotifications');
  updateCheckbox('#__adblock', 'enableAdBlock');
  updateCheckbox('#__sponsorblock', 'enableSponsorBlock');
  updateCheckbox('#__sponsorblock_sponsor', 'enableSponsorBlockSponsor');
  updateCheckbox('#__sponsorblock_intro', 'enableSponsorBlockIntro');
  updateCheckbox('#__sponsorblock_outro', 'enableSponsorBlockOutro');
  updateCheckbox('#__sponsorblock_interaction', 'enableSponsorBlockInteraction');
  updateCheckbox('#__sponsorblock_selfpromo', 'enableSponsorBlockSelfPromo');
  updateCheckbox('#__sponsorblock_music_offtopic', 'enableSponsorBlockMusicOfftopic');
  updateCheckbox('#__hide_logo', 'hideLogo');
}

updateUI();
const eventHandler = (evt) => {
  console.info(
    'Key event:',
    evt.type,
    evt.charCode,
    evt.keyCode,
    evt.defaultPrevented
  );
  if (KEY_MAPPINGS.green.includes(evt.charCode)) {
    console.info('Taking over!');
    evt.preventDefault();
    evt.stopPropagation();
    if (evt.type === 'keydown') {
      if (uiContainer.style.display === 'none') {
        console.info('Showing and focusing!');
        uiContainer.style.display = 'block';
        uiContainer.focus();
      } else {
        console.info('Hiding!');
        uiContainer.style.display = 'none';
        uiContainer.blur();
      }
    }
    return false;
  }
  if (KEY_MAPPINGS.red.includes(evt.charCode)) {
    evt.preventDefault();
    evt.stopPropagation();
    if (evt.type === 'keydown') {
      const newValue = !configRead('enableSponsorBlock');
      configWrite('enableSponsorBlock', newValue);
      updateUI();
      showNotification(
        newValue ? 'SponsorBlock toggled on' : 'SponsorBlock toggled off'
      );
    }
    return false;
  }
  return true;
};

// Red, Green, Yellow, Blue
// 403, 404, 405, 406
// ---, 172, 170, 191
document.addEventListener('keydown', eventHandler, true);
document.addEventListener('keypress', eventHandler, true);
document.addEventListener('keyup', eventHandler, true);

export function showNotification(text, time = 3000) {
  console.info('notification:', text);
  if (!configRead('enableNotifications')) return;

  if (!document.querySelector('.ytaf-notification-container')) {
    console.info('Adding notification container');
    const c = document.createElement('div');
    c.classList.add('ytaf-notification-container');
    document.body.appendChild(c);
  }

  const elm = document.createElement('div');
  const elmInner = document.createElement('div');
  elmInner.innerText = text;
  elmInner.classList.add('message');
  elmInner.classList.add('message-hidden');
  elm.appendChild(elmInner);
  document.querySelector('.ytaf-notification-container').appendChild(elm);

  setTimeout(() => {
    elmInner.classList.remove('message-hidden');
  }, 100);
  setTimeout(() => {
    elmInner.classList.add('message-hidden');
    setTimeout(() => {
      elm.remove();
    }, 1000);
  }, time);
}

setTimeout(() => {
  showNotification('Press 🟩 to open YTAF configuration screen');
  showNotification('Press 🟥 to toggle on/off SponsorBlock');
}, 2000);

window.addEventListener("DOMNodeInserted", (evt) => {
  document.querySelector("ytlr-logo-entity").style.visibility = configRead('hideLogo') ? 'hidden' : 'visible';
}, false);

function applyUIFixes() {
  try {
    const tc = window.tectonicConfig;
    tc.clientData.legacyApplicationQuality = 'full-animation';
    tc.featureSwitches.enableAnimations = true;
    tc.featureSwitches.enableListAnimations = true;
    tc.featureSwitches.enableOnScrollLinearAnimation = true;
    tc.featureSwitches.isLimitedMemory = false;
  } catch (e) {
    console.error('error setting tectonicConfig:', e);
  }

  try {
    const bodyClasses = document.body.classList;

    const observer = new MutationObserver(function bodyClassCallback(
      _records,
      _observer
    ) {
      try {
        if (bodyClasses.contains('app-quality-root')) {
          bodyClasses.remove('app-quality-root');
        }
      } catch (e) {
        console.error('error in <body> class observer callback:', e);
      }
    });

    observer.observe(document.body, {
      subtree: false,
      childList: false,
      attributes: true,
      attributeFilter: ['class'],
      characterData: false
    });
  } catch (e) {
    console.error('error setting up <body> class observer:', e);
  }
}

applyUIFixes();
