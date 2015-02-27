#!flask/bin/python
from flask import Flask, request, jsonify
import rustwo

app = Flask(__name__)
store = rustwo.Store('songs.json')
BASE_URL = '/api/v1.0/'


@app.route(BASE_URL)
def index():
    return "Hello world!"


@app.route(BASE_URL + 'songs', methods=['GET'])
def get_all():
    return jsonify(songs=[song.get_dict() for song in store.get_all()])


@app.route(BASE_URL + 'songs/<string:song_id>', methods=['GET'])
def get(song_id):
    return jsonify(store.get_one(song_id).get_dict())


@app.route(BASE_URL + 'search', methods=['GET'])
def search():
    songs = rustwo.Chords.search(store, request.args.get('q'))
    return jsonify(songs=[song.get_dict() for song in songs])

if __name__ == '__main__':
    app.run(debug=True)
