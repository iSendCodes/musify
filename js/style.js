const data = [];
let audioIndex = 0;
let audio;
let slider;

function fillList(data, type = "songs") {
    $('#list').html('');
    let table = $(`
        <table border=0 cellspacing=0 cellpadding=0>
        </table>
    `);
    data.forEach(element => {
        let count = 0;
        switch (type) {
            case "albums":
                count = data.filter((e) => e.album == element.album).length;
                let album = $(`
                    <tr class="card" id="${element.rank}" data-toggle="filter" data-type="album">
                        <td id="data">${element.album}</td>
                        <td style="min-width: 100px; text-align:right;">${count} Song${count > 1 ? 's' : ''}</td>
                    </tr>
                `);
                album.appendTo(table);
                break;
            case "artists":
                count = data.filter((e) => e.artist == element.artist).length;
                let artist = $(`
                    <tr class="card" id="${element.rank}" data-toggle="filter" data-type="artist">
                        <td id="data">${element.artist}</td>
                        <td style="min-width: 100px; text-align:right;">${count} Song${count > 1 ? 's' : ''}</td>
                    </tr>
                `);
                artist.appendTo(table);
                break;
            case "songs":
            default:
                let song = $(`
                    <tr class="card" id="${element.rank}">
                        <td>${element.rank}</td>
                        <td>${element.title}</td>
                        <td class="sm-none">${element.artist}</td>
                        <td>${element.year}</td>
                    </tr>
                `);
                song.appendTo(table);
        }
    });
    table.appendTo($('#list'));
}

$.getJSON("https://raw.githubusercontent.com/ASU-CIT/test-data/main/songs.json", null,
    function (_data) {
        _data.forEach(element => {
            data.push(element);
        });

        fillList(data);

        if(data.length > 0) loadSong(data[audioIndex]);
    }
);

let formatTime = (s) => (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;
function sliderSeek() { 
    slider.value = Math.floor(audio.seek());
    $('#slider-value').text(formatTime(Math.floor(audio.seek())));
}
let tseek;

function loadSong(song, autoplay=false) {
    slider.value = 0;
    $('#player-title').text(song.title);
    audio = new Howl({ src: ['./test/sample.opus'] });
    if(autoplay) audio.play();
    audio.on('load', function() { 
        slider.max = Math.floor(audio.duration());
        $('#slider-max').text(formatTime(Math.floor(audio.duration())));
    }).on('play', function() { 
        tseek = setInterval(sliderSeek, 1000 / 60);
    }).on('end', function () {
        clearInterval(tseek);
    }).on('pause', function () {
        clearInterval(tseek);
    });

    let drag = false
    let playingBeforeDrag = false

    $(slider).mousedown(function () {
        playingBeforeDrag = audio.playing();
        if(playingBeforeDrag) audio.pause();
        drag = true;
    });

    $(slider).mouseup(function () {
        if(drag) {
            audio.seek(slider.value);
            if(playingBeforeDrag) audio.play();
            drag = false;
        }
    });
}

$(function () {
    slider = document.getElementById('slider');
    $('.side .item:not(.disabled)').click(function (e) {
        e.preventDefault();
        $('.side .item.active').removeClass('active');
        $(this).addClass('active');
    });

    $('[data-dismiss=side]').click(function (e) {
        e.preventDefault();
        $(this).closest('.side').addClass('active');
    });

    $('[data-toggle=side]').click(function (e) {
        e.preventDefault();
        if ($('.side').hasClass('active')) $('.side').removeClass('active');
        else $('.side').addClass('active');
    });

    $('#sort').change(function (e) {
        let sorted = data.sort((a, b) => eval(`a.${$(this).val()}`) > eval(`b.${$(this).val()}`));
        fillList(sorted);
    });

    $('body').on('click', '[data-toggle=content]', function (e) {
        e.preventDefault();
        $('#content-title').text($(this).text());
        fillList(data, $(this).attr('href').replace("#", ""));
    });

    $('body').on('click', '[data-toggle=filter]' , function (e) {
        let type = $(this).data('type');
        $('#content-title').html(`
            <a href=#${type}s data-toggle="content" style="color: #ffd;">
            ${type.charAt(0).toUpperCase() + 
            type.slice(1)}s</a> / ` + 
            $(this).find('#data').text()
        );
        let filtered = data.filter((element) => eval(`element.${type}`) == $(this).find('#data').text())
        fillList(filtered);
    });

    $('input[name="search"]').on('input', function (e) {
        let f = (a) => a.toLowerCase().startsWith($(this).val().toLowerCase());
        let filtered = data.filter((song) => f(song.title) || f(song.artist) || f(song.album));
        $('#content-title').text($(this).val() != "" ? `Search: '${$(this).val()}'` : "Songs");
        $('.side .item.active').removeClass('active');
        $('.side [href="#songs"]').addClass('active');
        fillList(filtered);
    });

    $('#play').click(function (e) { 
        e.preventDefault();
        if(!audio.playing()) {
            audio.play();
            $(this).find('i').removeClass('ti-player-play').addClass('ti-player-pause');
        } else {
            audio.pause();
            $(this).find('i').removeClass('ti-player-pause').addClass('ti-player-play');
        }
    });

    $('#next').click(function (e) { 
        e.preventDefault();
        let playing = audio.playing();
        if(audio.playing()) audio.stop();
        audio.unload();

        audioIndex++;
        if(audioIndex >= data.length) audioIndex = 0;
        loadSong(data[audioIndex], playing);
    });

    $('#prev').click(function (e) { 
        e.preventDefault();
        let playing = audio.playing();
        if(audio.playing()) audio.stop();
        audio.unload();

        audioIndex--;
        if(audioIndex < 0) audioIndex = data.length - 1;
        loadSong(data[audioIndex], playing);
    });
});
