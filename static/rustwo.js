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
    this.song.slideDown(200);
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
        url : 'http://localhost:5000/rust/api/v1/songs',
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
        url : 'http://localhost:5000/rust/api/v1/search?q=' + search, 
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
};

$(document).ready(function () {
    window.rust = new Rustwo('#search', '#songs');
    window.rust.init();
});
