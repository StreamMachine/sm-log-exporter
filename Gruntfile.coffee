module.exports = (grunt) ->
    grunt.initConfig
        pkg: grunt.file.readJSON 'package.json'
        coffee:
            coffee_to_js:
                options:
                    bare: true
                    sourceMap: true
                expand: true
                flatten: false
                cwd: "client"
                src: ["**/*.coffee"]
                dest: 'client'
                ext: ".js"

    grunt.loadNpmTasks 'grunt-contrib-coffee'

    grunt.registerTask 'default', ['coffee']