// https://www.npmjs.com/package/gulp-remove-logging
// generated on 2020-06-27 using generator-webapp 4.0.0-8

/**
 * ------------------------------------------------
 * AUTHOR: Mike Cj (mikecj184)
 * Copyright 2020 - 2021 Timeblur
 * This code is licensed under MIT license (see LICENSE file for more details)
 * ------------------------------------------------
 */

const { src, dest, watch, series, parallel, lastRun } = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const version = require('gulp-version-number');
const fs = require('fs');
const mkdirp = require('mkdirp');
const Modernizr = require('modernizr');
const browserSync = require('browser-sync');
const browserify = require('browserify');
const babel = require('babelify');
const vinylsource = require('vinyl-source-stream');
const vinylbuffer = require('vinyl-buffer');
const del = require('del');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const { argv } = require('yargs');
const ghdeploy = require('gh-pages');
const stripDebug = require('gulp-strip-debug');
const sass = require('gulp-sass')(require('sass'));
const execSync = require('child_process').execSync;
const uglify = require('gulp-uglify');
const shell = require('gulp-shell');
const merge = require('merge-stream');


const $ = gulpLoadPlugins();
const server = browserSync.create();

const port = argv.port || 9000;

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const isDev = !isProd && !isTest;


// eslint config
let eslint_config = JSON.parse(fs.readFileSync('./.eslintrc.json'));

// version for app
var pack = JSON.parse(fs.readFileSync('./package.json'));
var versionConfig = {
  'value': pack.version,
  'replaces' : ['#{VERSION_REPLACE}#'],
  'append': {
    'key': 'v',
    'to': ['html', 'css', 'js']
  }
};


// commit-id for examples
let commit_full = execSync('git log --format="%H" -n 1').toString();
var commitConfig = {
  'value': commit_full.substring(0, 7),
  'replaces' : ['#{COMMIT_REPlACE}#'],
  'append': {
    'key': 'v',
    'to': ['html', 'css', 'js']
  }
};



/**
 * Push build to gh-pages
 */
function newDeploy() {
  return ghdeploy.publish('dist', function(err) {console.log('gh-pages publish');console.log(err);})
};

function copyAssets(){
  return src('../assets/**/*')
    .pipe(dest('dist/assets'));
}
//
//
function copyDash(){
  return src('../dash/**/*')
            .pipe(dest('dist/dash/'));
}
//
function commitDash(){
  return src('../dash/add_publish/index.html')
            .pipe(version(commitConfig))
            .pipe(dest('dist/dash/add_publish/'));
}
//
//

function copyAllExamples(){
  let tasks = [];
  tasks.push(src(['../osmo_examples/**/*', '!../osmo_examples/pixi', '!../osmo_examples/pixi/**'])
                  .pipe(dest('dist/examples/')));
  tasks.push(src(['../osmo_examples/pixi/legend_popup/dist/**/*'])
                  .pipe(dest('dist/examples/pixi/legend_popup/')));
  tasks.push(src(['../osmo_examples/pixi/legend_popup_svg/dist/**/*'])
                  .pipe(dest('dist/examples/pixi/legend_popup_svg/')));
  tasks.push(src(['../osmo_examples/pixi/navigation/dist/**/*'])
                  .pipe(dest('dist/examples/pixi/navigation/')));
  return merge(tasks);
}
function cleanExamplesSrc(){
  return del([
    // here we use a globbing pattern to match everything inside the `mobile` folder
    'dist/examples/pixi/**/*',
    // we don't want to clean this file though so we negate the pattern
    '!dist/examples/pixi/legend_popup/dist',
    '!dist/examples/pixi/legend_popup/dist',
    '!dist/examples/pixi/legend_popup/dist',
  ]);
}
function commitanim(){
  return src('../osmo_examples/animation/index.html')
            .pipe(version(commitConfig))
            .pipe(dest('dist/examples/animation/'));
}
function commitcomp(){
  return src('../osmo_examples/composition/index.html')
            .pipe(version(commitConfig))
            .pipe(dest('dist/examples/composition/'));
}
function commitleg(){
  return src('../osmo_examples/paper/legend_popup/index.html')
            .pipe(version(commitConfig))
            .pipe(dest('dist/examples/paper/legend_popup/'));
}
function commitnav(){
  return src('../osmo_examples/paper/navigation/index.html')
            .pipe(version(commitConfig))
            .pipe(dest('dist/examples/paper/navigation/'));
}
function commitsou(){
  return src('../osmo_examples/paper/sound/index.html')
            .pipe(version(commitConfig))
            .pipe(dest('dist/examples/paper/sound/'));
}
//
//
function styles() {
  return src('src/styles/*.scss', {
    sourcemaps: !isProd,
  })
    .pipe($.plumber())
    .pipe(sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.', 'node_modules/']
    }).on('error', sass.logError))
    .pipe($.postcss([
      autoprefixer()
    ]))
    .pipe($.if(!isProd,
      dest('.tmp/styles', {sourcemaps: !isProd}),
      dest('dist/styles', {sourcemaps: !isProd})))
    .pipe(server.reload({stream: true}));
};


//
//
function scriptsdev() {

  var browserifyjs = {
    in: './src/scripts/main.js',
    outdir: '.tmp/scripts',
    out: 'bundle.js',
    jsOpts: {
      debug: false
    }
  };

  return browserify(browserifyjs.jsOpts)
    .transform(babel, { presets: ['@babel/preset-env']})
    .require(browserifyjs.in, { entry: true })
    .bundle()
    .on('error', function(err){ console.log(err.stack); })
    .pipe(vinylsource(browserifyjs.out))
    .pipe(vinylbuffer())
    .pipe(dest(browserifyjs.outdir))
    .pipe(server.reload({stream: true}));
}
//.pipe(stripDebug())


//
//
function scripts() {

  var browserifyjs = {
    in: './src/scripts/main.js',
    outdir: 'dist/scripts',
    out: 'bundle.js',
    jsOpts: {
      debug: false
    }
  };

  return browserify(browserifyjs.jsOpts)
    .transform(babel, { presets: ['@babel/preset-env']})
    .require(browserifyjs.in, { entry: true })
    .bundle()
    .on('error', function(err){ console.log(err.stack); })
    .pipe(vinylsource(browserifyjs.out))
    .pipe(vinylbuffer())
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(dest(browserifyjs.outdir));
};

//
//
async function modernizr() {
  const readConfig = () => new Promise((resolve, reject) => {
    fs.readFile(`${__dirname}/modernizr.json`, 'utf8', (err, data) => {
      if (err) reject(err);
      resolve(JSON.parse(data));
    })
  })
  const createDir = () => new Promise((resolve, reject) => {
    mkdirp($.if(!isProd, `${__dirname}/.tmp/scripts`, `${__dirname}/dist/scripts`), err => {
      if (err) reject(err);
      resolve();
    })
  });
  const generateScript = config => new Promise((resolve, reject) => {
    Modernizr.build(config, content => {
      fs.writeFile($.if(!isProd, `${__dirname}/.tmp/scripts/modernizr.js`, `${__dirname}/dist/scripts/modernizr.js`), content, err => {
        if (err) reject(err);
        resolve(content);
      });
    })
  });

  const [config] = await Promise.all([
    readConfig(),
    createDir()
  ]);
  await generateScript(config);
}

const lintBase = (files, options) => {
  return src(files)
    .pipe($.eslint(options))
    .pipe(server.reload({stream: true, once: true}))
    .pipe($.eslint.format())
    .pipe($.if(!server.active, $.eslint.failAfterError()));
}
function lint() {
  return lintBase('src/scripts/**/*.js', { fix: true, configFile: '.eslintrc.json'})
    .pipe(dest('src/scripts'));
};
function lintTest() {
  return lintBase('test/spec/**/*.js');
};

function html() {
  return src('src/index.html')
    .pipe(version(versionConfig))
    .pipe(dest('dist'));

  /*
    .pipe($.useref({searchPath: ['.tmp', '.']}))
    .pipe($.if(/\.js$/, $.uglify({compress: {drop_console: true}})))
    .pipe($.if(/\.css$/, $.postcss([cssnano({safe: true, autoprefixer: false})])))
    .pipe($.if(/\.html$/, $.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: {compress: {drop_console: true}},
      processConditionalComments: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))

  */
}

function images() {
  return src('../assets/images/**/*', { since: lastRun(images) })
    .pipe($.imagemin())
    .pipe(dest('dist/assets/images'));
};


function data() {
  return src('../assets/data/**/*', { since: lastRun(data) })
    .pipe(dest('dist/assets/data'));
};

function fonts() {
  return src('../assets/fonts/**/*.{eot,svg,ttf,woff,woff2}')
    .pipe($.if(!isProd, dest('.tmp/fonts'), dest('dist/fonts')));
};

function libs(){
  src(['./node_modules/please-wait/build/**/*'])
    .pipe($.if(!isProd, dest('.tmp/third_party/'), dest('dist/third_party/')));

  src(['./node_modules/spinkit/css/**/*'])
    .pipe($.if(!isProd, dest('.tmp/third_party/'), dest('dist/third_party/')));

  return src(['./src/third_party/**/*'])
    .pipe($.if(!isProd, dest('.tmp/third_party/'), dest('dist/third_party/')));
};

function extras() {
  return src([
    'src/*',
    '!src/*.html'
  ], {
    dot: true
  }).pipe(dest('dist'));
};

function clean() {
  return del(['.tmp', 'dist'])
}

function measureSize() {
  return src('dist/**/*')
    .pipe($.size({title: 'build', gzip: true}));
}

const commitAllExamples = parallel(
  commitanim,
  commitcomp,
  commitleg,
  commitnav,
  commitsou
);

const build = series(
  parallel(
    lint,
    series(parallel(styles, scripts, modernizr), html),
    fonts,
    libs,
    extras
  ),
  measureSize
);

function startAppServer() {
  server.init({
    notify: false,
    port,
    server: {
      baseDir: ['.tmp', 'src', '../'],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  });

  watch([
    'src/*.html',
    '../assets/images/**/*',
    '../assets/data/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', server.reload);

  watch('src/styles/**/*.scss', styles);
  watch('src/scripts/**/*.js', scriptsdev);
  watch('modernizr.json', modernizr);
  watch('../assets/fonts/**/*', fonts);
}

function startTestServer() {
  server.init({
    notify: false,
    port,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/scripts': '.tmp/scripts',
        '/node_modules': 'node_modules'
      }
    }
  });
  //
  watch('test/index.html').on('change', server.reload);
  watch('src/scripts/**/*.js', scripts);
  watch('test/spec/**/*.js', lintTest);
}

function startDistServer() {
  server.init({
    notify: false,
    port,
    server: {
      baseDir: 'dist',
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  });
}

let serve;
if (isDev) {
  serve = series(clean, parallel(lint, styles, scriptsdev, modernizr, fonts, libs), startAppServer);
} else if (isTest) {
  serve = series(clean, lint, scriptsdev, startTestServer);
} else if (isProd) {
  serve = series(clean, build, startDistServer);
}

exports.serve = serve;
exports.build = build;
exports.default = serve;
exports.deploy = series(
  clean, copyAssets, copyDash, commitDash,
  shell.task(['npm run-script build --prefix ../osmo_examples/pixi/legend_popup/']),
  shell.task(['npm run-script build --prefix ../osmo_examples/pixi/legend_popup_svg/']),
  shell.task(['npm run-script build --prefix ../osmo_examples/pixi/navigation/']),
  copyAllExamples, commitAllExamples, build, newDeploy);
exports.serveDeploy = series(
  clean, copyAssets, copyDash, commitDash,
  shell.task(['npm run-script build --prefix ../osmo_examples/pixi/legend_popup/']),
  shell.task(['npm run-script build --prefix ../osmo_examples/pixi/legend_popup_svg/']),
  shell.task(['npm run-script build --prefix ../osmo_examples/pixi/navigation/']),
  copyAllExamples, commitAllExamples, build,
  shell.task(['serve ./dist/ -p 8080'])
);
