/*global navigate*/
import './spatial-navigation-polyfill.js';
import './ui.css';
import { configRead, configWrite } from './config.js';

// We handle key events ourselves.
window.__spatialNavigation__.keyMode = 'NONE';

const ARROW_KEY_CODE = { 37: 'left', 38: 'up', 39: 'right', 40: 'down' };

const uiContainer = document.createElement('div');
uiContainer.classList.add('ytaf-ui-container');
uiContainer.style['display'] = 'none';
uiContainer.setAttribute('tabindex', 0);
uiContainer.addEventListener(
  'focus',
  () => console.info('uiContainer focused!'),
  true
);
uiContainer.addEventListener(
  'blur',
  () => console.info('uiContainer blured!'),
  true
);

uiContainer.addEventListener(
  'keydown',
  (evt) => {
    console.info('uiContainer key event:', evt.type, evt.charCode);
    if (evt.charCode !== 404 && evt.charCode !== 172) {
      if (evt.keyCode in ARROW_KEY_CODE) {
        navigate(ARROW_KEY_CODE[evt.keyCode]);
      } else if (evt.keyCode === 13) {
        // "OK" button
        document.querySelector(':focus').click();
      } else if (evt.keyCode === 27) {
        // Back button
        uiContainer.style.display = 'none';
        uiContainer.blur();
      }
      evt.preventDefault();
      evt.stopPropagation();
    }
  },
  true
);

uiContainer.innerHTML = `
<h1>webOS YouTube Extended</h1>
<label for="__notifications"><input type="checkbox" id="__notifications" /> Show notification messages</label>
<label for="__adblock"><input type="checkbox" id="__adblock" /> Enable AdBlocking</label>
<label for="__sponsorblock"><input type="checkbox" id="__sponsorblock" /> Enable SponsorBlock</label>
<blockquote>
<label for="__sponsorblock_sponsor"><input type="checkbox" id="__sponsorblock_sponsor" /> Skip Sponsor Segments</label>
<label for="__sponsorblock_intro"><input type="checkbox" id="__sponsorblock_intro" /> Skip Intro Segments</label>
<label for="__sponsorblock_outro"><input type="checkbox" id="__sponsorblock_outro" /> Skip Outro Segments</label>
<label for="__sponsorblock_interaction"><input type="checkbox" id="__sponsorblock_interaction" /> Skip Interaction Reminder Segments</label>
<label for="__sponsorblock_selfpromo"><input type="checkbox" id="__sponsorblock_selfpromo" /> Skip Self Promotion Segments</label>
<label for="__sponsorblock_music_offtopic"><input type="checkbox" id="__sponsorblock_music_offtopic" /> Skip Music and Off-topic Segments</label>
</blockquote>
<div><small>Sponsor segments skipping - https://sponsor.ajay.app</small></div>
<label for="__hide_logo"><input type="checkbox" id="__hide_logo" /> Hide YouTube logo (recommended on OLEDs)</label>
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
bindCheckbox(
  '#__sponsorblock_music_offtopic',
  'enableSponsorBlockMusicOfftopic'
);

uiContainer.querySelector('#__hide_logo').checked = configRead('hideLogo');
uiContainer.querySelector('#__hide_logo').addEventListener('change', (evt) => {
  configWrite('hideLogo', evt.target.checked);
});

const eventHandler = (evt) => {
  console.info(
    'Key event:',
    evt.type,
    evt.charCode,
    evt.keyCode,
    evt.defaultPrevented
  );
  if (evt.charCode == 404 || evt.charCode == 172) {
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
  showNotification('Press [GREEN] to open YTAF configuration screen');
}, 2000);

window.addEventListener("DOMNodeInserted", (evt) => {
  document.querySelector("ytlr-logo-entity").style.visibility = configRead('hideLogo') ? 'hidden' : 'visible';
}, false);
