const data = [];

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
    }
);

$(function () {
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
        let filtered = data.filter((element) => eval(`element.${type}=='${$(this).find('#data').text()}'`))
        fillList(filtered);
    });

    $('input[name="search"]').on('input', function (e) {
        let f = (a) => a.toLowerCase().startsWith($(this).val().toLowerCase());
        let filtered = data.filter((song) => f(song.title) || f(song.artist) || f(song.album));
        $('#content-title').text(`Search: '${this.val()}'`)
        fillList(filtered);
    });
});
