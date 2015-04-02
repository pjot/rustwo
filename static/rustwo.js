Song = function (data) {
    this.title = data.title;
    this.uri = data.uri;
};

Song.prototype.render = function () {
    var html = '<a href="#" class="song" rel="' + this.uri + '">' + this.title + '</a>';
    return html;
};

Rustwo = function (search_field, songs) {
    this.search_field = $(search_field).find('input');
    this.songs = $(songs);
    this.song = $('#song');
    this.current_song = {
        title : null,
        chords : null
    };
};

Rustwo.prototype.drawCurrentSong = function () {
    $('#title').html(this.current_song.title);
    $('#chords').html(this.current_song.chords);
    this.song.show();
};

Rustwo.prototype.init = function () {
    this.loadSongs(Rustwo.prototype.bindEvents.bind(this));
};

Rustwo.prototype.bindEvents = function () {
    $('.song').on('click', Rustwo.prototype.loadSong.bind(this));
    this.search_field.on('keyup', Rustwo.prototype.performSearch.bind(this));
};

Rustwo.prototype.loadSongs = function (callback) {
    $.ajax({
        url : '/rust/api/v1/songs',
        dataType : 'json',
        context : this,
        success : function (data) {
            for (s in data.songs) {
                song = new Song(data.songs[s]);
                this.songs.append(song.render());
            }
            callback();
        }
    });
};

Rustwo.prototype.loadSong = function (event) {
    event.preventDefault();
    this.loadURL(event.target.rel);
};

Rustwo.prototype.loadURL = function (url) {
    this.songs.hide();
    $.ajax({
        url : url,
        dataType : 'json',
        context : this,
        success : function (data) {
            this.current_song.title = data.title;
            this.current_song.chords = data.chords;
            this.drawCurrentSong();
        }
    });
};

Rustwo.prototype.performSearch = function () {
    this.song.hide();
    this.songs.show();
    var search = this.search_field.val().replace(/ /g, '+');
    this.songs.find('.song').data('visited', false);
    $.ajax({
        url : '/rust/api/v1/search?q=' + search, 
        dataType : 'json',
        context : this,
        success : function (data) {
            for (s in data.songs) {
                song = data.songs[s];
                this.songs.find('[rel="' + song.uri + '"]').data('visited', true).show();
            }
            this.songs.find('.song').each(function () {
                var el = $(this);
                if (el.data('visited') == false && el.is(':visible'))
                    el.hide()
            });
        }
    });
}

Rustwo.transposeSong = function (direction) {
    $('#chords .chord').each(function () {
        var chord_element = $(this);
        chord_element.html(Chord.transpose(chord_element.html(), direction));
    });
};

Chord = {
    map : {
        '+1' : {
            'Eb' : 'E',
            'E'  : 'F',
            'F#' : 'G',
            'F'  : 'F#',
            'Gb' : 'G',
            'G#' : 'A',
            'G'  : 'G#',
            'Ab' : 'A',
            'A#' : 'C',
            'A'  : 'Bb',
            'Bb' : 'B',
            'B'  : 'C',
            'C#' : 'D',
            'C'  : 'C#',
            'D#' : 'E',
            'D'  : 'D#'
        },
        '-1' : {
            'Eb' : 'D',
            'E'  : 'D#',
            'F#' : 'F',
            'F'  : 'E',
            'Gb' : 'F',
            'G#' : 'G',
            'G'  : 'F#',
            'Ab' : 'G',
            'A#' : 'A',
            'A'  : 'G#',
            'Bb' : 'A',
            'B'  : 'Bb',
            'C#' : 'C',
            'C'  : 'B',
            'D#' : 'D',
            'D'  : 'C#'
        }
    }
};

Chord.transpose = function (chord, direction) {
    var map = Chord.map[direction];
    for (i in map)
    {
        if (chord.match(new RegExp(i)))
        {
            return chord.replace(new RegExp(i), map[i]);
        }
    }
    return chord;
}

$(document).ready(function () {
    window.rust = new Rustwo('#search', '#songs');
    window.rust.init();
});
