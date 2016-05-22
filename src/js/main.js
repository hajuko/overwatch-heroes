$(function() {
    var settings = {
        characterSize: 100,
        imagePath: 'src/img/characters/'
    };

    $.ajax({
        dataType: "json",
        url: 'src/data/character_raw.json',
        success: function(result) {
            new got.Map(settings, result);
        }
    });
});
