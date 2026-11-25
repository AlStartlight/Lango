#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const locales = [
  "en",
  "id",
  "jp",
  "es",
  "fr",
  "de",
  "pt",
  "it",
  "nl",
  "ko",
  "hi",
  "ar",
];
const fullLocales = ["en", "id", "jp"];
const requiredNamespaces = ["common", "settings", "curriculum"];

function flatten(value, prefix = "", out = new Map()) {
  if (Array.isArray(value)) {
    out.set(prefix, value);
    return out;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, out);
    }
    return out;
  }
  out.set(prefix, value);
  return out;
}

const resources = {};
for (const locale of locales) {
  const file = join(root, "app", "locales", `${locale}.json`);
  if (!existsSync(file)) {
    console.error(`✗ ${locale}.json is missing`);
    process.exit(1);
  }
  resources[locale] = JSON.parse(readFileSync(file, "utf8"));
}

const en = resources.en;
let failed = false;

for (const namespace of ["learning", "settings", "curriculum"]) {
  if (!en[namespace]) {
    console.error(`✗ en.json is missing the "${namespace}" namespace`);
    failed = true;
  }
}

// Tier A (en/id/jp): every key in every namespace must match English exactly.
const enKeys = flatten(en);
for (const locale of fullLocales.filter((value) => value !== "en")) {
  const keys = flatten(resources[locale]);
  const missing = [...enKeys.keys()].filter((key) => !keys.has(key));
  const extra = [...keys.keys()].filter((key) => !enKeys.has(key));

  if (missing.length > 0) {
    failed = true;
    console.error(`✗ ${locale}: ${missing.length} missing key(s)`);
    for (const key of missing.slice(0, 25)) console.error(`  - ${key}`);
  }
  if (extra.length > 0) {
    failed = true;
    console.error(`✗ ${locale}: ${extra.length} unexpected key(s)`);
    for (const key of extra.slice(0, 25)) console.error(`  + ${key}`);
  }
}

// Tier B/C: required namespaces must exist and have no empty values. Missing
// learning keys are allowed while translations roll out, but every required
// namespace key must be present.
for (const locale of locales.filter((value) => !fullLocales.includes(value))) {
  const keys = flatten(resources[locale]);
  for (const namespace of requiredNamespaces) {
    if (!resources[locale][namespace]) {
      failed = true;
      console.error(`✗ ${locale}: missing required namespace "${namespace}"`);
      continue;
    }
    const expected = [...flatten(en[namespace] ?? {}).keys()];
    const missing = expected.filter(
      (key) => !keys.has(`${namespace}.${key}`),
    );
    if (missing.length > 0) {
      failed = true;
      console.error(
        `✗ ${locale}: ${missing.length} missing ${namespace} key(s)`,
      );
      for (const key of missing.slice(0, 15)) {
        console.error(`  - ${namespace}.${key}`);
      }
    }
  }
}

for (const locale of locales) {
  for (const [key, value] of flatten(resources[locale])) {
    if (typeof value === "string" && value.trim() === "") {
      failed = true;
      console.error(`✗ ${locale}: empty value for "${key}"`);
    }
  }
}

if (failed) process.exit(1);

const count = flatten(en).size;
console.log(
  `✓ locale tiers valid — ${count} en keys; en/id/jp in sync; 12 locales present`,
);
