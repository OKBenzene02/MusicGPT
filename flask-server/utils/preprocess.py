import numpy as np
import itertools
import random

from typing import List, Dict

import music21
from music21 import meter, instrument
from music21.stream import Score
from music21 import stream

class Preprocess:

    def events_to_events_data(self, events):
        # Ensure right order. Float to deal with music21 Fractions
        events = sorted(events, key=lambda event: float(event[2]))

        events_data = []
        for event_index, event, event_next in zip(
            range(len(events)), events, events[1:] + [None]
        ):
            # event_index  event                    event_next
            # 0            ('NOTE_ON', 67, 0.0)     ('NOTE_OFF', 67, 4.0)
            # 1            ('NOTE_OFF', 67, 4.0)    None
            if event_index == 0 and event[2] != 0.0:
                event_data = {"type": "TIME_DELTA", "delta": float(event[2])}
                events_data += [event_data]

            event_data = {"type": event[0], "pitch": event[1]}
            events_data += [event_data]

            if event_next is None:
                continue

            delta = event_next[2] - event[2]
            assert delta >= 0, events
            if delta != 0.0:
                event_data = {"type": "TIME_DELTA", "delta": float(delta)}
                events_data += [event_data]

        # events_data
        # {'events': [{'type': 'NOTE_ON', 'pitch': 67}, {'type': 'TIME_DELTA', 'delta': 4.0},
        # {'type': 'NOTE_OFF', 'pitch': 67}]}, {'events': [{'type': 'NOTE_ON', 'pitch': 67},
        # {'type': 'TIME_DELTA', 'delta': 8.0}

        return events_data


    def keep_first_eight_measures(self, score: stream.Score) -> stream.Score:
        # Create a new score for the output
        new_score = score.measures(1, 8)
        return new_score

    def preprocess_music21(self, m21_streams: List[Score]) -> List[Dict]:
        songs_data = []

        for song in m21_streams:
            song_data = self.preprocess_music21_song(song)
            if song_data is not None:
                songs_data.append(song_data)

        return songs_data


    def preprocess_music21_song(self, song):
        song_data = {}
        song_data["title"] = song.metadata.title
        song_data["number"] = song.metadata.number
        song_data["genre"] = "UNKNOWN"  # No genre available
        song_data["tracks"] = []

        # Add the time signature to the song
        first_part = song.parts[0]
        first_measure_ts = first_part.recurse().getElementsByClass(meter.TimeSignature)[0]
        song_data["time_signature_numerator"] = first_measure_ts.numerator
        song_data["time_signature_denominator"] = first_measure_ts.denominator

        stream_by_parts = instrument.partitionByInstrument(song)

        for part in stream_by_parts.parts:
            part.makeRests(fillGaps=True, inPlace=True)

        for part_index, part in enumerate(stream_by_parts.parts):
            part_instrument = part.getInstrument()
            part.makeMeasures(inPlace=True)
            part.makeTies(inPlace=True)
            part.insert(0, part_instrument)
            track_data = self.preprocess_music21_part(part)
            song_data["tracks"].append(track_data)

        return song_data


    def preprocess_music21_part(self, part):
        instrument_name = part.getInstrument()
        is_drum = part.partName == "Percussion"
        
        track_data = {
            "name": part.partName,
            "midi_program": "DRUMS" if part.partName == "Percussion" else instrument_name.midiProgram if isinstance(instrument_name.midiProgram, int) else 0,
            "bars": [],
        }

        for measure_index in range(1, 100000):
            measure = part.measure(measure_index)
            if measure is None:
                break
            bar_data = self.preprocess_music21_measure(measure, is_drum)
            track_data["bars"].append(bar_data)

        return track_data


    def preprocess_music21_measure(self, measure, is_drum):
        bar_data = {"events": []}
        pm = music21.midi.percussion.PercussionMapper()

        events = []
        for event in measure.recurse():
            if is_drum:
                if isinstance(event, music21.note.Unpitched):
                    try:
                        per_pitch = pm.midiInstrumentToPitch(event._storedInstrument)
                    except music21.midi.percussion.MIDIPercussionException:
                        default_perc = music21.instrument.SnareDrum()
                        per_pitch = pm.midiInstrumentToPitch(default_perc)

                    events.append(("NOTE_ON", per_pitch.midi, 4 * event.offset))
                    events.append(("NOTE_OFF", per_pitch.midi, 4 * event.offset + 4 * event.duration.quarterLength))

                if isinstance(event, music21.percussion.PercussionChord):
                    for note in event:
                        try:
                            per_pitch = pm.midiInstrumentToPitch(note._storedInstrument)
                        except music21.midi.percussion.MIDIPercussionException:
                            default_perc = music21.instrument.SnareDrum()
                            per_pitch = pm.midiInstrumentToPitch(default_perc)
                            
                        events.append(("NOTE_ON", per_pitch.midi, 4 * event.offset))
                        events.append(("NOTE_OFF", per_pitch.midi, 4 * event.offset + 4 * event.duration.quarterLength))

            if isinstance(event, music21.note.Note):
                events.append(("NOTE_ON", event.pitch.midi, 4 * event.offset))
                events.append(("NOTE_OFF", event.pitch.midi, 4 * event.offset + 4 * event.duration.quarterLength))

            if isinstance(event, music21.chord.Chord):
                for note in event:
                    events.append(("NOTE_ON", note.pitch.midi, 4 * event.offset))
                    events.append(("NOTE_OFF", note.pitch.midi, 4 * event.offset + 4 * event.duration.quarterLength))

        bar_data["events"].extend(self.events_to_events_data(events))

        return bar_data

    def get_density_bins(self, songs_data, window_size_bars, hop_length_bars, bins):
        distribution = []
        for song_data in songs_data:
            # Count the bars
            bars = self.get_bars_number(song_data)
            # Iterate over the tracks and the bars
            bar_indices = self.get_bar_indices(bars, window_size_bars, hop_length_bars)
            for track_data in song_data["tracks"]:
                for bar_start_index, bar_end_index in bar_indices:
                    # Go through the bars and count the notes
                    count = 0
                    for bar in track_data["bars"][bar_start_index:bar_end_index]:
                        count += len(
                            [event for event in bar["events"] if event["type"] == "NOTE_ON"]
                        )

                    # Do not count empty tracks
                    if count != 0:
                        distribution += [count]

        # Comput the quantiles, which will become the density bins
        quantiles = []
        for i in range(100 // bins, 100, 100 // bins):
            quantile = np.percentile(distribution, i)
            quantiles += [quantile]

        return quantiles


    def get_bars_number(self, song_data):
        bars = [len(track_data["bars"]) for track_data in song_data["tracks"]]
        bars = max(bars)
        return bars


    def get_bar_indices(self, bars, window_size_bars, hop_length_bars):
        """
        Gets the indices of the bars that will be used for encoding.

        Args:
            bars: The number of bars in the song.
            window_size_bars: The size of the window in bars.
            hop_length_bars: The hop length in bars.

        Returns:
            A list of tuples, where each tuple contains the start index and end index of a window.
        """

        indices = []
        start = 0
        while start + window_size_bars <= bars:
            indices.append((start, start + window_size_bars))
            start += hop_length_bars
        print(indices)
        return indices


    def encode_songs_data(
        self,
        songs_data,
        transpositions,
        permute,
        window_size_bars,
        hop_length_bars,
        density_bins,
        bar_fill,
    ):
        # This will be returned
        token_sequences = []

        # Go through all songs
        for song_data in songs_data:
            token_sequences += self.encode_song_data(
                song_data,
                transpositions,
                permute,
                window_size_bars,
                hop_length_bars,
                density_bins,
                bar_fill,
            )

        return token_sequences


    def encode_song_data(
        self, 
        song_data,
        transpositions,
        permute,
        window_size_bars,
        hop_length_bars,
        density_bins,
        bar_fill,
    ):
        # This will be returned
        token_sequences = []

        # Count the bars
        bars = self.get_bars_number(song_data)

        # For iterating over the bars
        bar_indices = self.get_bar_indices(bars, window_size_bars, hop_length_bars)

        # Go through all combinations
        count = 0
        for (bar_start_index, bar_end_index), transposition in itertools.product(
            bar_indices, transpositions
        ):
            # Start empty
            token_sequence = []

            # Do bar fill if necessary
            if bar_fill:
                track_data = random.choice(song_data["tracks"])
                bar_data = random.choice(track_data["bars"][bar_start_index:bar_end_index])
                bar_data_fill = {"events": bar_data["events"]}
                bar_data["events"] = "bar_fill"

            # Start with the tokens
            token_sequence += ["PIECE_START"]
            token_sequence += [
                "TIME_SIGNATURE="
                + str(song_data["time_signature_numerator"])
                + ("_")
                + str(song_data["time_signature_denominator"])
            ]
            token_sequence += ["GENRE=" + str(song_data["genre"])]

            # Get the indices. Permute if necessary
            track_data_indices = list(range(len(song_data["tracks"])))
            if permute:
                random.shuffle(track_data_indices)

            # Encode the tracks
            for track_data_index in track_data_indices:
                track_data = song_data["tracks"][track_data_index]

                # Encode the track. Insert density tokens and transpose
                encoded_track_data = self.encode_track_data(
                    track_data, density_bins, bar_start_index, bar_end_index, transposition
                )
                token_sequence += encoded_track_data

            # Encode the fill tokens
            if bar_fill:
                token_sequence += self.encode_bar_data(
                    bar_data_fill, transposition, bar_fill=True
                )

            token_sequences += [token_sequence]
            count += 1

        # Done
        return token_sequences


    def encode_track_data(
        self, track_data, density_bins, bar_start_index, bar_end_index, transposition
    ):
        tokens = []

        tokens += ["TRACK_START"]

        # Set an instrument
        number = track_data["midi_program"]

        # Set the instrument if it is not a drum
        if not track_data.get("drums", False):
            tokens += [f"INST={number}"]

        # Set the instrument if it is drums. Do not transpose
        else:
            tokens += ["INST=DRUMS"]
            transposition = 0

        # Count NOTE_ON events
        note_on_events = 0
        for bar_data in track_data["bars"][bar_start_index:bar_end_index]:
            if bar_data["events"] == "bar_fill":
                continue
            for event_data in bar_data["events"]:
                if event_data["type"] == "NOTE_ON":
                    note_on_events += 1

        # Determine density
        density = np.digitize(note_on_events, density_bins)
        tokens += [f"DENSITY={density}"]

        # Encode the bars
        for bar_data in track_data["bars"][bar_start_index:bar_end_index]:
            tokens += self.encode_bar_data(bar_data, transposition, bar_fill=False)

        tokens += ["TRACK_END"]

        return tokens


    def encode_bar_data(self, bar_data, transposition, bar_fill=False):
        tokens = []

        if not bar_fill:
            tokens += ["BAR_START"]
        else:
            tokens += ["FILL_START"]

        if bar_data["events"] == "bar_fill":
            tokens += ["FILL_IN"]
        else:
            for event_data in bar_data["events"]:
                tokens += [self.encode_event_data(event_data, transposition)]

        if not bar_fill:
            tokens += ["BAR_END"]
        else:
            tokens += ["FILL_END"]

        return tokens


    def encode_event_data(self, event_data, transposition):
        if event_data["type"] != "TIME_DELTA":
            return event_data["type"] + "=" + str(event_data["pitch"] + transposition)
        else:
            return event_data["type"] + "=" + str(event_data["delta"])