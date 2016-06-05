var fs = require('fs');
var heroes = JSON.parse(fs.readFileSync('../tmp/heroes.json'));
var abilityStats = ['roundsPerSecond', 'numberOfPellets', 'healPerSec', 'ammo', 'range', 'cooldown', 'duration', 'casttime', 'radius'];

heroes.forEach(function(hero) {
    transform(hero);
});

fs.writeFileSync('tmp.json', JSON.stringify(heroes));

function transform(hero) {
    console.log(hero);
    transformAttributes(hero);
    transformAbilities(hero);
}

function transformAbilities(hero) {
    hero.abilities.forEach(function(ability) {
        ability.stats = [];

        if (ability.type == 'damage' && ability.ammo) {
            ability.type = 'attack';

            addDamage(ability);
        }

        abilityStats.forEach(function(stat) {
            if (ability[stat]) {
                ability.stats.push({
                    name: stat,
                    value: ability[stat]
                });
            }

            delete ability[stat];
        });
        console.log(ability);
    });
}

function addDamage(ability) {

    var minDmg = ability.damage;
    var maxDmg = ability.damageMax;

    if (ability.damageMax && ability.numberOfPellets) {
        maxDmg *= ability.numberOfPellets;
    }

    var dmgString = minDmg + '';


    var maxDps;
    var minDps = minDmg * ability.roundsPerSec;
    var dpsString = minDps + '';

    if (maxDmg) {
        dmgString += '-' + maxDmg;
        maxDps = maxDmg * ability.roundsPerSec;
        dpsString += '-' + maxDps;
    }


    ability.stats.push({
        name: 'damage',
        value: dmgString
    });

    ability.stats.push({
        name: 'dps',
        value: dpsString
    });
}



function transformAttributes(hero) {
    hero.attributes = [];

    hero.attributes.push({
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