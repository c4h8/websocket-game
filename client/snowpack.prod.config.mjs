export default {
  env: {
    WS_PORT: '3000',
  },
  optimize: {
    minify: true,
    bundle: true,
    target: 'es2018',
  },
  buildOptions: {
    out: '../build',
  },
};
