<h1 align="center">⚡ ElAlert</h1>

<p align="center">
  <b>Beautiful, accessible dialog library. Zero dependencies. TypeScript-first.</b><br>
  Works everywhere — Vanilla JS, React, Vue, Svelte, Next.js, and more.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@maellana25/elalert">
    <img src="https://img.shields.io/npm/v/@maellana25/elalert?style=flat-square&color=6366f1&label=npm" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/@maellana25/elalert">
    <img src="https://img.shields.io/npm/dm/@maellana25/elalert?style=flat-square&color=6366f1" alt="npm downloads">
  </a>
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square" alt="zero dependencies">
  <img src="https://img.shields.io/badge/TypeScript-first-3178c6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/license-MIT-gray?style=flat-square" alt="license">
  <img src="https://img.shields.io/badge/gzip-~3KB-success?style=flat-square" alt="gzip size">
</p>

---

## ✨ Features

- 🎨 **Beautiful out of the box** — polished animations & clean design
- ♿ **Accessible by default** — focus trap, ARIA attributes, ESC key, reduced-motion support
- 🌳 **Tree-shakeable** — import only what you use
- 🔷 **TypeScript-first** — full type inference, no `@types` package needed
- 🌗 **Light / Dark / Auto theme** — follows system preference automatically
- 📍 **9 position slots** — center, top, bottom, corners, and edges
- 🔄 **Smart queue system** — multiple dialogs appear one at a time
- ⚡ **Zero dependencies** — no jQuery, no SweetAlert, no Swal
- 🌐 **Framework-agnostic** — works with any stack

---

## 📦 Installation

```bash
npm install @maellana25/elalert
```

```bash
yarn add @maellana25/elalert
```

```bash
pnpm add @maellana25/elalert
```

---

## 🚀 Quick Start

```ts
import { Dialog } from '@maellana25/elalert';
import '@maellana25/elalert/style.css';

// Simple success alert
Dialog.success('Data saved successfully!');

// With options
Dialog.success({
  title: 'Saved!',
  message: 'Your changes have been saved.',
});
```

---

## 📖 API Reference

### Basic Dialog Methods

All methods accept a `string` (as the message) or a `DialogOptions` object.

| Method | Description |
|--------|-------------|
| `Dialog.alert(options)` | Generic alert without an icon |
| `Dialog.success(options)` | Success dialog with a ✅ icon |
| `Dialog.error(options)` | Error dialog with a ❌ icon |
| `Dialog.warning(options)` | Warning dialog with a ⚠️ icon |
| `Dialog.info(options)` | Info dialog with a ℹ️ icon |

```ts
Dialog.error({
  title: 'Connection Failed',
  message: 'Please check your internet connection and try again.',
  confirmText: 'Retry',
});
```

---

### `Dialog.confirm()` — Async Confirm

Returns a `Promise<DialogResult>` that resolves when the user interacts.

```ts
const result = await Dialog.confirm({
  title: 'Delete Record?',
  message: 'This action cannot be undone.',
  confirmText: 'Yes, delete it',
  cancelText: 'Cancel',
  showCancelButton: true,
});

if (result.isConfirmed) {
  await deleteRecord();
  Dialog.success('Record deleted.');
}

if (result.isDismissed) {
  console.log('Cancelled via:', result.dismissReason); // 'cancel' | 'escape' | 'outside'
}
```

---

### `Dialog.loading()` — Loading Spinner

Returns a `DialogHandle` to update or close programmatically.

```ts
const loader = Dialog.loading({ message: 'Uploading file...' });

await uploadFile();

loader.update({ message: 'Processing...' });

await processFile();

loader.close();
Dialog.success({ title: 'Done!', message: 'File uploaded successfully.' });
```

---

### `Dialog.custom()` — Custom Content

Render any HTML content inside the dialog.

```ts
Dialog.custom({
  title: 'Rate your experience',
  render: (container) => {
    container.innerHTML = `
      <div style="text-align: center; padding: 16px">
        <p>How was your experience?</p>
        <input type="range" min="1" max="10" value="5">
      </div>
    `;
  },
  confirmText: 'Submit',
  showCancelButton: true,
  onClose: (result) => {
    if (result.isConfirmed) console.log('Submitted!');
  },
});
```

> ⚠️ You are responsible for sanitizing any user-generated HTML passed to `render`.

---

### `Dialog.setConfig()` — Global Configuration

Set default options that apply to all dialogs.

```ts
import { Dialog } from '@maellana25/elalert';

Dialog.setConfig({
  theme: 'dark',           // 'light' | 'dark' | 'auto'
  position: 'top-right',   // default position for all dialogs
  defaultConfirmText: 'OK',
  defaultCancelText: 'Cancel',
  backdropBlur: true,
  baseZIndex: 9999,
  queueBehavior: 'queue',  // 'queue' | 'stack'
});
```

---

## ⚙️ `DialogOptions` Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | — | Dialog title |
| `message` | `string` | — | Main message text (plain text, not HTML) |
| `icon` | `DialogIconType` | `'none'` | Icon to display |
| `position` | `DialogPosition` | `'center'` | Position on screen (`'top-right'` default untuk toast) |
| `style` | `DialogStyle` | `'modal'` | Tampilan dialog: `'modal'` (centered + backdrop) atau `'toast'` (notification tanpa backdrop) |
| `showOverlay` | `boolean` | `true` | Tampilkan backdrop/overlay di belakang dialog (`false` = tanpa dim, halaman tetap terlihat) |
| `overlayColor` | `string` | — | Warna custom backdrop (CSS color); mengikuti tema jika tidak diset |
| `theme` | `DialogTheme` | `'auto'` | `'light'` / `'dark'` / `'auto'` |
| `confirmText` | `string` | `'OK'` | Primary button text |
| `cancelText` | `string` | `'Cancel'` | Secondary button text |
| `showConfirmButton` | `boolean` | `true` | Show/hide confirm button |
| `showCancelButton` | `boolean` | `false` | Show/hide cancel button |
| `allowOutsideClick` | `boolean` | `true` | Close on backdrop click |
| `allowEscapeKey` | `boolean` | `true` | Close on ESC key |
| `autoClose` | `number` | `0` | Auto-close after N milliseconds (0 = disabled) |
| `onOpen` | `(handle) => void` | — | Callback when dialog opens |
| `onClose` | `(result) => void` | — | Callback when dialog closes |

### `DialogPosition` values

```
'top-left'   | 'top'    | 'top-right'
'center-left'| 'center' | 'center-right'
'bottom-left'| 'bottom' | 'bottom-right'
```

---

## 🔁 `DialogHandle` — Programmatic Control

Every `Dialog.*` call returns a `DialogHandle`:

```ts
const handle = Dialog.info({ message: 'Processing...', autoClose: 5000 });

// Update content while dialog is open
handle.update({ message: 'Almost done...' });

// Close programmatically
handle.close();

// Await the result
const result = await handle.result;
```

---

## 🌗 Theme Support

ElAlert automatically follows the system's light/dark preference when `theme: 'auto'` (default).

```ts
// Force dark mode globally
Dialog.setConfig({ theme: 'dark' });

// Override per-dialog
Dialog.success({ title: 'Done!', theme: 'light' });
```

---

## 📋 Queue System

Multiple dialogs stack in a queue and appear one at a time:

```ts
Dialog.info({ title: 'Step 1 / 3', message: 'Email verified.' });
Dialog.warning({ title: 'Step 2 / 3', message: 'Profile pending.' });
Dialog.success({ title: 'Step 3 / 3', message: 'Welcome aboard!' });
```

---

## 🍞 Toast Style

Render dialog apa pun sebagai toast notification — tanpa backdrop, halaman tetap interaktif, dan slide-in dari tepi layar:

```ts
Dialog.success({
  title: 'Saved!',
  message: 'Data has been saved.',
  style: 'toast',          // 'modal' (default) | 'toast'
  position: 'top-right',
  autoClose: 3000,
  showConfirmButton: false,
});
```

Toast tidak mencuri fokus dari halaman (fokus trap & `aria-modal` dinonaktifkan) dan menggunakan role `status`/`alert` + `aria-live` agar dibaca screen reader sebagai notifikasi.

---

## 🔧 Auto-Close with Countdown

```ts
let seconds = 5;
const handle = Dialog.info({
  message: `Closing in ${seconds}s…`,
  autoClose: 5000,
});

const interval = setInterval(() => {
  seconds--;
  if (seconds > 0) handle.update({ message: `Closing in ${seconds}s…` });
  else clearInterval(interval);
}, 1000);
```

---

## 🌐 Framework Usage

### Vanilla JS
```js
import { Dialog } from '@maellana25/elalert';
import '@maellana25/elalert/style.css';

Dialog.success('Hello from Vanilla JS!');
```

### React
```tsx
import { Dialog } from '@maellana25/elalert';
import '@maellana25/elalert/style.css';

function DeleteButton({ id }: { id: string }) {
  const handleDelete = async () => {
    const { isConfirmed } = await Dialog.confirm({
      title: 'Delete?',
      message: 'This cannot be undone.',
      showCancelButton: true,
    });

    if (isConfirmed) {
      await deleteItem(id);
      Dialog.success('Deleted!');
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

### Vue 3
```ts
import { Dialog } from '@maellana25/elalert';
import '@maellana25/elalert/style.css';

async function onSave() {
  const loader = Dialog.loading({ message: 'Saving...' });
  await saveData();
  loader.close();
  Dialog.success('Saved!');
}
```

---

## 📄 License

MIT © [ismailgilang](https://github.com/ismailgilang/elalert)
