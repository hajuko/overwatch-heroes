var fs = require('fs');
var heroes = JSON.parse(fs.readFileSync('../public/data/heroes.json'));

heroes.forEach(function(hero) {
    transform(hero);
});

console.log(heroes);

fs.writeFileSync('../tmp/heroes.json', JSON.stringify(heroes, null, 4));

function transform(hero) {
    hero.classImage = 'classes/' + hero.class + '.png';
}
