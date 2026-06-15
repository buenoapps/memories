// Allow importing CSS / CSS-module files; the Metro/Expo bundler handles these
// at build time, so for type-checking we just treat them as opaque modules.
declare module '*.css' {
  const content: { readonly [className: string]: string };
  export default content;
}
