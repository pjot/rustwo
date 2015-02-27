import os
import pickle
import json
from flask import url_for


class Chords:

    @staticmethod
    def search(store, query):
        data = store.get_all()
        if not data:
            return False
        return [song for song in data if song.matches(query)]


class Song:

    def __init__(self, id, title, chords):
        self.id = id
        self.title = title
        self.chords = chords or ''

    def matches(self, query):
        in_title = self.title.lower().find(query) != -1
        in_chords = self.chords.lower().find(query) != -1
        return in_title or in_chords

    def get_small(self):
        return {
            'id': self.id,
            'title': self.title,
            'uri': url_for('get_one', song_id=self.id, _external=True)
        }

    def get_full(self):
        return {
            'id': self.id,
            'title': self.title,
            'chords': self.chords
        }


class Store:

    def __init__(self, file):
        self.file = file
        self.data = False

    def get_data(self):
        if not self.data:
            if not os.path.isfile(self.file):
                return False
            with open(self.file, 'r') as data_file:
                self.data = []
                data = json.load(data_file)
                for obj in data:
                    self.data.append(Song(
                        obj['id'],
                        obj['title'],
                        obj['chords']
                    ))
        return self.data

    def get_all(self):
        return self.get_data()

    def get_one(self, id):
        for song in self.get_data():
            if song.id == id:
                return song
        return False
