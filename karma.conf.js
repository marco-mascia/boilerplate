module.exports = config => {
  
    process.env.BABEL_ENV = 'karma';

  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'coverage'],

    coverageReporter: {
      dir: 'coverage',
      reporters: [
        { type: 'lcov' },
        { type: 'text-summary' }
      ]
    },

    // list of files / patterns to load in the browser
    files: [
        {pattern: 'tests/*.js',watched:true,served:true,included:true}
        /*parameters:
            watched: if autoWatch is true all files that have set watched to true will be watched for changes
            served: should the files be served by Karma's webserver?
            included: should the files be included in the browser using <script> tag?
            nocache: should the files be served from disk on each request by Karma's webserver? */
        /*assets:
            {pattern: '*.html', watched:true, served:true, included:false}
            {pattern: 'images/*', watched:false, served:true, included:false} */    
      ],

    // list of files to exclude
    // exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        //add webpack as preprocessor to support require() in test-suits .js files
        './tests/*.js': ['webpack']
      },

    webpack: {
        module: {
          rules: [
            {
              test: /\.js$/i,
              exclude:/(node_modules)/,
              loader:'babel-loader',
              options:{
                presets:['@babel/preset-env']
              }
            }
          ]
        }
      },

    plugins: [
      'karma-mocha-reporter',
      'karma-coverage',
      'karma-webpack',
      'karma-chrome-launcher',
      'karma-sourcemap-loader',
      'karma-jasmine'
    ],

    // web server port
    port: 9876,

    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};

