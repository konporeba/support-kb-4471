import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';

// Build harness for the kb export: .svx pages through mdsvex, `layout: runbook` → src/lib/layouts/runbook.svelte,
// `#lib/…` → src/lib. `npm run build` prerenders every kb page to build/ as static HTML.
const config = {
  extensions: ['.svelte', '.svx'],
  preprocess: [
    vitePreprocess(),
    mdsvex({ extensions: ['.svx'], layout: { runbook: fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url)) } }),
  ],
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build', strict: true }),
    alias: { '#lib': 'src/lib', '#lib/*': 'src/lib/*' },
    prerender: { entries: ['/kb'], handleHttpError: 'warn' },
    paths: { relative: true },
  },
};

export default config;
