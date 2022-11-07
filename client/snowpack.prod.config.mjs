export default {
  env: {
    IS_PROD: true,
  },
  optimize: {
    minify: false,
    bundle: true,
    target: 'es2018',
  },
  buildOptions: {
    out: '../build',
  },
};