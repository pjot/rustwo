#!/usr/bin/env python
from flask import Flask, request, jsonify
import rustwo

app = Flask(__name__, static_url_path='')
store = rustwo.Store('songs.json')
BASE_URL = '/rust/api/v1/'


@app.route(BASE_URL + 'songs', methods=['GET'])
def get_all():
    return jsonify(songs=store.get_all().as_small())


@app.route(BASE_URL + 'songs/<string:song_id>', methods=['GET'])
def get_one(song_id):
    return jsonify(store.get_one(song_id).get_full())


@app.route(BASE_URL + 'search', methods=['GET', 'OPTIONS'])
def search():
    songs = rustwo.Chords.search(store, request.args.get('q'))
    return jsonify(songs=rustwo.ResultSet(songs).as_small())


@app.route('/', methods=['GET'])
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
