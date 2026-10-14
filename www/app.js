'use strict';

const $ = (id) => document.getElementById(id);
const lang = () => $('language').value;
const apiBase = String(window.TARA_CONFIG?.apiBaseUrl || '').replace(/\/$/, '');

function setVoiceStatus(message) {
  $('voice-status').textContent = message;
}

function speak(text) {
  if (!('speechSynthesis' in window)) {
    setVoiceStatus('Text-to-speech is not available on this device.');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang();
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
  setVoiceStatus('Speaking in ' + (lang() === 'te-IN' ? 'Telugu' : 'English') + '.');
}

$('speak').addEventListener('click', () => {
  speak(lang() === 'te-IN'
    ? 'నమస్కారం. నేను తారా. మీ పోస్టల్ శాఖ పనుల్లో సహాయం చేయడానికి సిద్ధంగా ఉన్నాను.'
    : 'Hello. I am TARA, your Postal Department assistant. I am ready to help.');
});

$('listen').addEventListener('click', () => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    setVoiceStatus('Speech recognition is unavailable in this WebView. Try Google voice typing or a supported browser.');
    return;
  }
  const recognition = new Recognition();
  recognition.lang = lang();
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onstart = () => setVoiceStatus('Listening… speak now.');
  recognition.onerror = (event) => setVoiceStatus('Voice input error: ' + event.error);
  recognition.onresult = (event) => {
    $('question').value = event.results[0][0].transcript;
    setVoiceStatus('Voice input captured. You can now check the backend connection.');
  };
  recognition.onend = () => {};
  recognition.start();
});

$('send').addEventListener('click', async () => {
  $('answer').textContent = 'Checking TARA backend…';
  if (!apiBase || apiBase.includes('YOUR-RENDER-SERVICE')) {
    $('answer').textContent = 'Set the deployed Render URL in www/config.js first. The backend is not configured yet.';
    $('api-status').textContent = 'Not configured';
    return;
  }
  try {
    const response = await fetch(apiBase + '/health', { method: 'GET' });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error('Health check failed (HTTP ' + response.status + ')');
    $('api-status').textContent = 'API online';
    $('answer').textContent = 'Backend connected successfully.\n' + JSON.stringify(data, null, 2) +
      '\n\nAI answers and cloud sync are not implemented yet.';
  } catch (error) {
    $('api-status').textContent = 'API offline';
    $('answer').textContent = 'Could not reach the Render API. Check the service URL and deployment logs.\n' + error.message;
  }
});

(async function checkInitialHealth() {
  if (!apiBase || apiBase.includes('YOUR-RENDER-SERVICE')) return;
  try {
    const response = await fetch(apiBase + '/health');
    if (response.ok) {
      const data = await response.json();
      if (data.ok) $('api-status').textContent = 'API online';
    }
  } catch (_) {
    $('api-status').textContent = 'API offline';
  }
})();
