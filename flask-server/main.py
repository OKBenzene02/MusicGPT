import os
from pathlib import Path
from typing import List

import music21
from music21.stream import Score

from utils.preprocess import Preprocess

from helpers.helpers import Helpers
from pathlib import Path


def encode_single_song(song: Score):
    # Preprocess the song data
    preprocess = Preprocess()
    helpers = Helpers()
    song_data = preprocess.preprocess_music21_song(song)

    # Determine the density bins
    density_bins = preprocess.get_density_bins([song_data], window_size_bars=8, hop_length_bars=1, bins=10)

    # Encode the song data
    token_sequence = []
    for track_data in song_data["tracks"]:
        token_sequence += preprocess.encode_track_data(track_data, density_bins, bar_start_index=0, bar_end_index=len(track_data["bars"]), transposition=0)
    
    # Save the encoded token sequences to a file
    return helpers.clean_generated_sequence(token_sequence)
    # return token_sequence
