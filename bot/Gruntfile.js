module.exports = function(grunt) {

  const src = sources(['settings', 'maps', 'lib', 'utils', 'bot', 'game', 'commands', 'room']);

  const banner = '/*! <%= pkg.name %> <%= pkg.version %> (<%= grunt.template.today("dd/mm/yyyy") %>) */\n';
  
  const concatDev = 'output/<%= pkg.name %>.dev.js';
  const concatProd = 'output/<%= pkg.name %>.prod.js';
  const minified = 'output/<%= pkg.name %>.min.js';

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dev: {
        options: {
          banner: banner + '\n'
        },
        src,
        dest: concatDev,
        nonnull: true,
      },
      prod: {
        options: {
          banner,
          separator: ';\n'
        },
        src,
        dest: concatProd,
        nonull: true
      },
    },
    uglify: {
      options: {
        banner
      },
      build: {
        src: concatProd,
        dest: minified
      }
    },
    clean: {
      build: [concatProd]
    },
    log: {
      output: [concatDev, minified]
    },
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-concat'); // https://github.com/gruntjs/grunt-contrib-concat
  grunt.loadNpmTasks('grunt-contrib-uglify-es'); // https://github.com/gruntjs/grunt-contrib-uglify/tree/harmony
  grunt.loadNpmTasks('grunt-contrib-clean'); // https://github.com/gruntjs/grunt-contrib-clean

  grunt.registerMultiTask('log', 'Log output information', function logTask() {
    log(this.data);
  });

  // Default tasks
  grunt.registerTask('default', [
    'concat',
    'uglify',
    'clean',
    'log'
  ]);

  function log(text) {
    if (text instanceof Array) {
      for (let t of text) {
        log(t);
      }
    } else {
      grunt.log.writeln(grunt.template.process(text));
    }
  }

};

function sources(files, dir='src') {
  const src = [];

  files.forEach(file => src.push(`${dir}/${file}.js`));

  return src;
}
