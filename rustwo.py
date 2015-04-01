import os
import json
from flask import url_for


class Chords(object):
    '''
    Helper class for handling chords. Only facilitates the searching so far,
    but it will eventually parse and highlight the actual chords in the text
    as well.
    '''
    @staticmethod
    def search(store, query):
        '''
        Searches the supplied store for songs that matches the query.

        Args:
          store (Store) Data Store
          query (str) Query string

        Returns:
          List of songs that matches the query
        '''
        data = store.get_all()
        if not data:
            return False
        return [song for song in data.songs if song.matches(query)]


class Song(object):
    '''
    Object representing a song (connects a title to its chords)

    Attributes:
      id (str) Unique ID
      title (str) Song title
      chords (str) Song chords, this one is multiline
    '''
    def __init__(self, id, title, chords=''):
        '''
        Create a Song from a id and title

        Args:
          id (str) Unique ID
          title (str) Song title
          chords (str) Song chords, optional
        '''
        self.id = id
        self.title = title
        self.chords = chords or ''

    def matches(self, query):
        '''
        Check if a Song matches a query. Searches the title and chords

        Args:
          query (str) Search query

        Returns:
          bool True for match, False otherwise
        '''
        in_title = self.title.lower().find(query) != -1
        in_chords = self.chords.lower().find(query) != -1
        return in_title or in_chords

    def get_small(self):
        '''
        Get a lightweight dict representing the Song

        Returns:
          dict containing title and uri (to REST entrypoint, a bit leaky...)
        '''
        return {
            'title': self.title,
            'uri': url_for('get_one', song_id=self.id, _external=True)
        }

    def get_full(self):
        '''
        Get the full dict representation of the Song

        Returns:
          dict containing id, title and chords
        '''
        return {
            'id': self.id,
            'title': self.title,
            'chords': self.chords
        }


class Store(object):
    '''
    Storage type agnostic wrapper around the storage of the records
    '''
    def __init__(self, file):
        '''
        Initialize a Store

        Args:
          file (str) Local JSON file
        '''
        self.file = file
        self.data = False

    def _get_data(self):
        '''
        Lazy-loads the data from the JSON file

        Returns:
          List of Songs in file
        '''
        if not self.data:
            if not os.path.isfile(self.file):
                return []
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
        '''
        Retrieve all Songs in the store

        Returns:
          ResultSet wrapping the List of Songs
        '''
        return ResultSet(self._get_data())

    def get_one(self, id):
        '''
        Fetch one Song from the Store

        Args:
          id (str) Song ID

        Returns:
          Song|False depending on if the ID exists
        '''
        for song in self._get_data():
            if song.id == id:
                return song
        return False


class ResultSet(object):
    '''
    Wrapper class around the Store result set, helps to format the
    Songs as their small or full representations
    '''
    def __init__(self, songs):
        '''
        Initialize from list of songs

        Args:
          songs (List) List of Songs
        '''
        self.songs = songs

    def as_small(self):
        '''
        Get the songs as their small representation

        Returns:
          List of dicts
        '''
        return [song.get_small() for song in self.songs]
