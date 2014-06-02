module.exports = function(grunt){
  var distDir = "dist/";
  var fs = require('fs.extra');
  var lessProductionFiles = {};
  lessProductionFiles[distDir + "visual/styles/app.css"] = distDir + "visual/styles/app.less";

  var lessDevFiles = {};
  lessDevFiles["src/visual/styles/app.css"] = "src/visual/styles/app.less";

  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    markdown : {
      all : {
        files : {
          expand: true,
          src: 'src/*.md',
          dest: distDir,
          ext: '.html'
        }
      }
    },
    copy : {
      dist : {
        files :[
          {
            expand : true,
            src : ["**"],
            cwd  : "src/",
            dest : distDir
          }
        ]
      }
    },
    useminPrepare: {
      html: distDir + 'index.html'
    },
    usemin: {
        html: distDir + 'index.html'
    },
    less: {
      production: {
        compress : true,
        files: lessProductionFiles
      },
      dev : {
        compress : false,
        files : lessDevFiles
      }
    },
    uglify : {
      options : {
        compress : true,
        preserveComments : false,
        mangle: false
      }
    },
    watch: {
      less: {
        files: ['src/visual/styles/*.less'],
        tasks: ['less:dev'],
        options: {
          spawn: false,
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-markdown');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  

  grunt.task.registerTask("deleteDist", "delete dist folder before compile", function(){
    try {
      fs.rmrfSync( distDir );
    }catch(e){

    }
  })

  grunt.task.registerTask("mergeTemplate", "mergeTemplate", function(){
    //var cheerio = require('cheerio');
    
    var templatesToRegister = [];
    var panelControllersToRegister = [];
    var done = this.async();


    done();
  })
  
  
  grunt.task.registerTask("cleanup", "clean up post compile folder and files", function(){
    
    var checkAndDelete = function(folderPath){
      var templateFolder = fs.readdirSync( folderPath );
      if(templateFolder.length == 0){
        fs.rmrfSync( folderPath );
      }
    }

    //checkAndDelete(distDir + "demo");
    //checkAndDelete(distDir + "images");

  })

  grunt.registerTask('default', ['deleteDist','copy:dist', "less", "useminPrepare", "concat", "cssmin", "uglify", "usemin", "cleanup"]);
  grunt.registerTask('dev', ["watch:less"]);

};