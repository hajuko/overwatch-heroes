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
                    'public/heroes.json': ['src/data/heroes.yml']
                }
            }
        }
    });

    grunt.registerTask('default', ['less', 'watch']);
};
