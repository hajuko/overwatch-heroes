var fs = require('fs');
var heroes = JSON.parse(fs.readFileSync('../tmp/heroes.json'));
var abilityStats = ['roundsPerSecond', 'numberOfPellets', 'healPerSec', 'ammo', 'range', 'cooldown', 'duration', 'casttime', 'radius'];

heroes.forEach(function(hero) {
    transform(hero);
});

fs.writeFileSync('heroes.json', JSON.stringify(heroes));

function transform(hero) {
    //transformAttributes(hero);
    transformAbilities(hero);
}

function transformAbilities(hero) {
    hero.abilities.forEach(function(ability) {
        sortStats(ability);
    });
}

function sortStats(ability) {
    ability.stats.sort(function(a, b){
        if (b.name == 'damage') {
            return true;
        } else {
            return false;
        }
    });
}

function addDamage(ability) {
    ability.stats.push({
        name: 'damage',
        value: ability.damage
    });
}


function transformAttributes(hero) {
    hero.attributes = [];

    hero.attributes.unshift({
        name: 'hp',
        value: hero.hp
    });

    delete hero.hp;

    if (hero.armor) {
        hero.attributes.push({
            name: 'armor',
            value: hero.armor
        });
    }
    delete hero.armor;


    if (hero.shield) {
        hero.attributes.push({
            name: 'shield',
            value: hero.shield
        });

    }
    delete hero.shield;
}