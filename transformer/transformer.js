var fs = require('fs');
var heroes = JSON.parse(fs.readFileSync('../public/data/heroes.json'));
var abilityStats = ['roundsPerSecond', 'numberOfPellets', 'healPerSec', 'ammo', 'range', 'cooldown', 'duration', 'casttime', 'radius'];

heroes.forEach(function(hero) {
    transform(hero);
});

fs.writeFileSync('heroes.json', JSON.stringify(heroes));

function transform(hero) {
    hero.abilities.forEach(function(ability) {
        ability.stats.forEach(function(stat) {
            if (stat.name == 'range' || stat.name == 'radius') {
                stat.unit = 'm';
            }

            if (stat.name == 'cooldown' || stat.name == 'duration' || stat.name == 'casttime') {
                stat.unit = 's';
            }
        });
    });
}
