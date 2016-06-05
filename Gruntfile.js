var jasmine = require('jasmine-node');

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        yaml: {
            heroes: {
                options: {
                    space: 4
                },
                files: {
                    'public/data/heroes.json': ['src/heroes.yml']
                }
            },
            test: {
                options: {
                    space: 4
                },
                files: {
                    'tmp/heroes.json': ['tmp/heroes.yml']
                }
            }
        },
        convert: {
            json2yml: {
                files: [
                    {
                        expand: true,
                        src: ['tmp/heroes.json'],
                        dest: '',
                        ext: '.yml'
                    }
                ]
            }
        }
    });

    grunt.registerTask('default', ['less', 'watch']);
};
