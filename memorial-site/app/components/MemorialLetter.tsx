'use client';

import { useEffect, useRef } from 'react';
import { LETTER_SEEN_KEY, memorialLetter, rememberLetterDismissal } from '../lib/memorialLetter';
import './memorial-letter.css';

let dismissedInMemory = false;

/** Native dialog supplies focus containment and makes the background inert. */
export default function MemorialLetter({ language = 'ko' }: { language?: 'ko' | 'en' }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const reopen = useRef<HTMLButtonElement>(null);
  const previousOverflow = useRef<string | null>(null);
  const en = language === 'en';

  useEffect(() => {
    let seen = dismissedInMemory;
    try { seen ||= window.localStorage.getItem(LETTER_SEEN_KEY) === '1'; } catch { /* Try session storage below. */ }
    try { seen ||= window.sessionStorage.getItem(LETTER_SEEN_KEY) === '1'; } catch { /* In-memory fallback remains available. */ }
    if (!seen && dialog.current?.showModal) {
      previousOverflow.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.current.showModal();
    }
    return () => {
      if (previousOverflow.current !== null) document.body.style.overflow = previousOverflow.current;
      previousOverflow.current = null;
    };
  }, []);

  function remember() {
    dismissedInMemory = true;
    try { rememberLetterDismissal(window.localStorage); } catch { /* Storage access can throw. */ }
    try { rememberLetterDismissal(window.sessionStorage); } catch { /* Closing always works. */ }
  }
  function dismiss() {
    remember();
    dialog.current?.close();
  }
  function closed() {
    remember();
    if (previousOverflow.current !== null) document.body.style.overflow = previousOverflow.current;
    previousOverflow.current = null;
    reopen.current?.focus({ preventScroll: true });
  }
  function open() {
    const node = dialog.current;
    if (!node?.showModal || node.open) return;
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    node.showModal();
    node.scrollTop = 0;
  }

  return <div className="memorial-letter-entry section-shell">
    <button ref={reopen} className="memorial-letter-reopen" onClick={open}>{en ? 'A Note from His Son' : '아들이 남긴 글'} <span aria-hidden="true">↗</span></button>
    <dialog ref={dialog} className="memorial-letter" lang={language} aria-labelledby="memorial-letter-label" onCancel={remember} onClose={closed}>
      <header className="memorial-letter-header">
        <h2 id="memorial-letter-label">{en ? 'A Note from His Son' : '아들이 남기는 글'}</h2>
        <button className="memorial-letter-close" onClick={dismiss} aria-label={en ? 'Close the letter' : '편지 닫기'} autoFocus>×</button>
      </header>
      <article className="memorial-letter-body">
        {memorialLetter[language].map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        <button className="memorial-letter-enter" onClick={dismiss}>{en ? 'Enter the Living Archive' : '기억의 공간으로 들어가기'} <span aria-hidden="true">→</span></button>
      </article>
    </dialog>
  </div>;
}
