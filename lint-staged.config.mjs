export default {
  "*.{js,mjs,cjs}": ["eslint --fix --max-warnings=0", "prettier --write"],
  "*.{ts,tsx,json,css,md,yaml,yml}": "prettier --write",
};
