"use client";

import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [mode, setMode] = useState(null);

  useEffect(() => {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isMobile = isIos || /Android/i.test(navigator.userAgent) || navigator.userAgentData?.mobile;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    const onBeforeInstallPrompt = event => {
      event.preventDefault();
      setInstallEvent(event);
      setMode("prompt");
    };
    const onInstalled = () => {
      setInstallEvent(null);
      setMode(null);
    };

    if (!isStandalone && isMobile) setMode(isIos ? "ios" : "instructions");
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    setMode(null);
  };

  if (!mode) return null;

  return (
    <div className="install-modal" role="dialog" aria-modal="true" aria-labelledby="install-title" onClick={event => event.target === event.currentTarget && setMode(null)}>
      <div className="install-dialog">
        <button className="modal-close" type="button" aria-label="Close install instructions" onClick={() => setMode(null)}>×</button>
        <div className="install-icon"><img src="/logo.png" alt="" /></div>
        <h2 id="install-title">Install this app</h2>
        <p>{mode === "ios" ? "Add the estimator to your iPhone or iPad home screen for quick access." : "Add the estimator to your phone for quick access, even when you are offline."}</p>
        {mode === "ios" && <p>In Safari, tap <strong>Share</strong>, then choose <strong>Add to Home Screen</strong>.</p>}
        {mode === "instructions" && <p>Open your browser menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>}
        {mode === "prompt" && <button type="button" onClick={install}>Install app</button>}
      </div>
    </div>
  );
}
