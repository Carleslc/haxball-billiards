module.exports = function(grunt) {

  const src = sources(['settings', 'maps', 'utils', 'lib', 'bot', 'game', 'commands', 'room']);

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
        nonull: true,
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
    shell: {
      maps: {
        options: {
          stdout: true
        },
        command: commands(['cd ../maps/', 'python build-stadiums.py billiards.yml', 'python build-stadiums.py billiards.yml --raw']),
      }
    },
    clean: {
      prod: [concatProd],
      all: ['output/']
    },
    log: {
      dev: concatDev,
      prod: minified
    },
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-concat'); // https://github.com/gruntjs/grunt-contrib-concat
  grunt.loadNpmTasks('grunt-contrib-uglify-es'); // https://github.com/gruntjs/grunt-contrib-uglify/tree/harmony
  grunt.loadNpmTasks('grunt-contrib-clean'); // https://github.com/gruntjs/grunt-contrib-clean
  grunt.loadNpmTasks('grunt-shell'); // https://github.com/sindresorhus/grunt-shell

  grunt.registerMultiTask('log', 'Log output information', function logTask() {
    log(this.data);
  });

  // Map task
  grunt.registerTask('maps', ['shell:maps']);

  // Prod tasks
  grunt.registerTask('prod', ['concat:prod', 'uglify', 'clean:prod', 'log:prod']);
  grunt.registerTask('prod-maps', ['maps', 'prod']);
  grunt.registerTask('default', ['prod']);

  // Dev tasks
  grunt.registerTask('dev', ['concat:dev', 'log:dev']);
  grunt.registerTask('dev-maps', ['maps', 'dev']);
  grunt.registerTask('clear', ['clean:all']);

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

function commands(exec, echo=true) {
  const cmds = [];

  if (exec instanceof Array) {
    exec.forEach(command => {
      if (typeof command === 'string') {
        if (echo) {
          cmds.push(`echo "${command}"`);
        }
        cmds.push(command);
      }
    });
  }

  return cmds.join(' && ');
}
