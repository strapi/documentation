/**
 * KapaMascot — Replaces the Kapa modal logo with the animated mascot.
 *
 * Kapa only accepts an image URL for its logo (static/img/ai-mascot.svg), and
 * renders its modal inside a Shadow DOM (#kapa-widget-container). This
 * component finds that logo in the shadow root, mounts an AgentBot next to it,
 * hides the image, and drives the bot from Kapa's JavaScript events:
 * https://docs.kapa.ai/integrations/website-widget/javascript-api/events
 *
 * Kapa has no event for the start of streaming, so the bot thinks from the
 * question until the answer is complete. If anything fails, the static SVG
 * logo stays visible.
 */
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import AgentBot from './AgentBot';

const LOGO_SELECTOR = 'img[src$="ai-mascot.svg"]';
const HOST_ATTR = 'data-strapi-mascot';
const LOGO_SIZE = 28;

// Tiny store shared between the Kapa event handlers and the mounted bot
let botState = 'idle';
let resetTimer = null;
const listeners = new Set();
function setBotState(state, resetAfter = 0) {
  clearTimeout(resetTimer);
  botState = state;
  listeners.forEach((fn) => fn(state));
  if (resetAfter) resetTimer = setTimeout(() => setBotState('idle'), resetAfter);
}

function KapaBot() {
  const [state, setState] = useState(botState);
  useEffect(() => {
    listeners.add(setState);
    return () => listeners.delete(setState);
  }, []);
  return <AgentBot state={state} size={LOGO_SIZE} shadow={false} decorative />;
}

// Kapa's documented preinitialization: queues calls until the widget loads
function getKapa() {
  if (!window.Kapa) {
    const queue = function (...args) {
      queue.c(args);
    };
    queue.q = [];
    queue.c = (args) => queue.q.push(args);
    window.Kapa = queue;
  }
  return window.Kapa;
}

const KAPA_EVENTS = {
  onModalOpen: () => setBotState('wave', 1800),
  onModalClose: () => setBotState('idle'),
  onAskAIQuerySubmit: () => setBotState('think'),
  onAskAIExampleQuerySubmit: () => setBotState('think'),
  onAskAIAnswerCompleted: () => setBotState('done', 2500),
  onAskAIGenerationStop: () => setBotState('idle'),
  onAskAIConversationReset: () => setBotState('idle'),
};

export default function KapaMascot() {
  useEffect(() => {
    const kapa = getKapa();
    Object.entries(KAPA_EVENTS).forEach(([event, handler]) => kapa(event, handler));

    let root = null;
    let host = null;
    let shadowObserver = null;

    // (Re)mount the bot whenever Kapa renders its logo
    const sync = (shadowRoot) => {
      const logo = shadowRoot.querySelector(LOGO_SELECTOR);
      if (host && !host.isConnected) {
        root.unmount();
        root = null;
        host = null;
      }
      if (!logo || host) return;
      host = document.createElement('span');
      host.setAttribute(HOST_ATTR, '');
      host.style.display = 'inline-flex';
      logo.before(host);
      logo.style.display = 'none';
      root = createRoot(host);
      root.render(<KapaBot />);
    };

    const watchShadow = () => {
      const shadowRoot = document.getElementById('kapa-widget-container')?.shadowRoot;
      if (!shadowRoot || shadowObserver) return false;
      shadowObserver = new MutationObserver(() => sync(shadowRoot));
      shadowObserver.observe(shadowRoot, { childList: true, subtree: true });
      sync(shadowRoot);
      return true;
    };

    // The widget container appears once the Kapa script has loaded
    let bodyObserver = null;
    if (!watchShadow()) {
      bodyObserver = new MutationObserver(() => {
        if (watchShadow()) bodyObserver.disconnect();
      });
      bodyObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      Object.entries(KAPA_EVENTS).forEach(([event, handler]) => kapa(event, handler, 'remove'));
      bodyObserver?.disconnect();
      shadowObserver?.disconnect();
      root?.unmount();
    };
  }, []);

  return null;
}
