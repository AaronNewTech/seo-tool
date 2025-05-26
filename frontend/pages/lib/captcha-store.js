const captchaStore = new Map();

export function setCaptcha(id, data) {
  captchaStore.set(id, data);
  setTimeout(() => captchaStore.delete(id), 10 * 60 * 1000);
}

export function getCaptcha(id) {
  return captchaStore.get(id);
}
