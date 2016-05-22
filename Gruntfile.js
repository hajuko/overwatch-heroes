var jasmine = require('jasmine-node');

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        less: {
            development: {
                options: {
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    // Destination file and source file
                    'public/css/got-characters.css': 'src/less/main.less'
                }
            }
        },
        watch: {
            styles: {
                files: ['src/less/**/*.less', 'src/js/**/*.js', 'src/data/*', 'crawler/**/*.js'],
                tasks: ['less', 'concat', 'yaml'],
                options: {
                    nospawn: true,
                    livereload: true
                }
            }
        },
        concat: {
            options: {
                separator: '\n'
            },
            dist: {
                src: [
                    'src/data/characters.js',
                    'src/js/namespace.js',
                    'src/js/custom-leaflet.js',
                    'src/js/Character.js',
                    'src/js/Filter/EpisodeFilter.js',
                    'src/js/Map.js',
                    'src/js/main.js'
                ],
                dest: 'app.js'
            }
        },
        yaml: {
            heroes: {
                options: {
                    space: 4
                },
                files: {
                    'src/data/heroes.json': ['src/data/heroes.yml']
                }
            }
        }
    });

    grunt.registerTask('default', ['less', 'watch']);
};
