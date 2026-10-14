'use strict';

const $ = (id) => document.getElementById(id);
const lang = () => $('language').value;
const apiBase = String(window.TARA_CONFIG?.apiBaseUrl || '').replace(/\/$/, '');
let recognition = null;

function setVoiceStatus(message) { $('voice-status').textContent = message; }
function setApiStatus(message) { $('api-status').textContent = message; }

function speak(text) {
  if (!('speechSynthesis' in window)) {
    setVoiceStatus('Speech output is not available on this device. You can still read the answer on screen.');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang();
  utterance.rate = 0.95;
  utterance.onerror = () => setVoiceStatus('Speech output failed. Check your Android text-to-speech engine.');
  window.speechSynthesis.speak(utterance);
  setVoiceStatus('Speaking in ' + (lang() === 'te-IN' ? 'Telugu' : 'English') + '.');
}

async function checkBackend(showResult = false) {
  if (!apiBase || apiBase.includes('YOUR-RENDER-SERVICE')) {
    setApiStatus('Not configured');
    if (showResult) $('answer').textContent = 'Render URL is not configured.';
    return false;
  }
  setApiStatus('Checking…');
  try {
    const response = await fetch(apiBase + '/health', { method: 'GET', cache: 'no-store' });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error('Health check returned HTTP ' + response.status);
    setApiStatus('API online');
    if (showResult) $('answer').textContent = 'Connected to TARA backend.\nService: ' + data.service + '\nStatus: healthy';
    return true;
  } catch (error) {
    setApiStatus('API offline');
    if (showResult) $('answer').textContent = 'Could not connect to Render. Open ' + apiBase + '/health in your browser to test it.\nDetails: ' + error.message;
    return false;
  }
}

$('speak').addEventListener('click', () => {
  speak(lang() === 'te-IN'
    ? 'నమస్కారం. నేను తారా. మీ పోస్టల్ శాఖ పనుల్లో సహాయం చేయడానికి సిద్ధంగా ఉన్నాను.'
    : 'Hello. I am TARA, your Postal Department assistant. I am ready to help.');
});

$('listen').addEventListener('click', async () => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    setVoiceStatus('Speech recognition is unavailable in this app. Tap the question box and use the keyboard microphone for voice typing.');
    $('question').focus();
    return;
  }
  try {
    if (recognition) { try { recognition.abort(); } catch (_) {} }
    recognition = new Recognition();
    recognition.lang = lang();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setVoiceStatus('Listening… speak now.');
    recognition.onerror = (event) => {
      const hint = event.error === 'not-allowed'
        ? ' Microphone permission was denied. Allow microphone access in Android Settings, or use the keyboard microphone.'
        : event.error === 'network'
          ? ' Speech service network error. Try Google voice typing from the keyboard.'
          : '';
      setVoiceStatus('Voice input error: ' + event.error + '.' + hint);
      if (event.error === 'not-allowed') $('question').focus();
    };
    recognition.onresult = (event) => {
      $('question').value = event.results?.[0]?.[0]?.transcript || '';
      setVoiceStatus('Voice text captured. Tap Ask TARA to submit it.');
    };
    recognition.onend = () => {};
    recognition.start();
  } catch (error) {
    setVoiceStatus('Could not start voice input. Use the keyboard microphone instead. ' + (error.message || ''));
  }
});

$('send').addEventListener('click', async () => {
  const question = $('question').value.trim();
  if (!question) {
    $('answer').textContent = 'Type or dictate a question first.';
    $('question').focus();
    return;
  }
  $('send').disabled = true;
  $('send').textContent = 'Working…';
  $('answer').textContent = 'Connecting to TARA…';
  try {
    const response = await fetch(apiBase + '/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, language: lang() })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Request failed (HTTP ' + response.status + ')');
    setApiStatus('API online');
    $('answer').textContent = (data.mode === 'template' ? 'TARA quick template (not AI-generated):\n\n' : '') + (data.answer || 'No answer was returned.');
    if (data.answer) speak(data.answer);
  } catch (error) {
    setApiStatus('API error');
    $('answer').textContent = 'TARA could not answer this request.\n' + error.message + '\n\nCheck that Render is deployed with the latest backend code.';
  } finally {
    $('send').disabled = false;
    $('send').textContent = 'Ask TARA';
  }
});

window.TARA_CHECK_API = () => checkBackend(true);
checkBackend(false);
