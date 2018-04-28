module.exports = function () {
    var build = './dist/';
    var dev = './app/';

    var config = {

        buildDir: build,
        devDir: dev,

        //all js to vet
        allDevJS: [
            dev + 'js/*.js',
            './*.js'
        ],

        allDevSass: dev + 'scss/**/*.scss',
        masterSass: dev + 'scss/main.scss',
        sassCssDest: dev + 'css',

        allDevHtml: dev + '**/*.html',
        allDevNJK: dev + '**/*.njk',

        allDevImages: dev + 'images/**/*.+(png|jpg|gif|svg)',
        buildImagesDest: build + 'images',

        allDevFonts: dev + 'fonts/**/*',
        buildFontsDest: build + 'fonts'
    };

    return config;
};