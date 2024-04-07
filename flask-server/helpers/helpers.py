import re
import note_seq

class Helpers:

    def __init__(self) -> None:
        self.NOTE_LENGTH_16TH_120BPM = 0.25 * 60 / 120
        self.BAR_LENGTH_120BPM = 4.0 * 60 / 120

    def regex_replacing(self, text):
        text = re.sub(r'\b=4_4\b', '', text, flags=re.IGNORECASE) 
        text = text.replace('=4_4', '')  
        return text

    def clean_generated_sequence(self, token_sequence):
        token_sequence = self.regex_replacing(" ".join(token_sequence)).split()
        cleaned_sequence = []
        bar_start_index = None

        for i, token in enumerate(token_sequence):
            if token == "BAR_START":
                if bar_start_index is None:  
                    bar_start_index = i
            elif token == "BAR_END":
                if bar_start_index is not None:
                    cleaned_sequence.extend(token_sequence[bar_start_index:i+1])
                bar_start_index = None 
            elif bar_start_index is None:
                cleaned_sequence.append(token)

        if bar_start_index is not None:
            pass

        return cleaned_sequence

    def token_sequence_to_note(
        self,
        token_sequence,
        use_program=True,
        use_drums=True,
        instrument_mapper=None,
        only_piano=False,
    ):
        if isinstance(token_sequence, str):
            token_sequence = token_sequence.split()

        note_sequence = self.empty_note_sequence()

        current_program = 1
        current_is_drum = False
        current_instrument = 0
        track_count = 0
        current_bar_index = 0
        current_time = 0
        current_notes = {}
        for token_index, token in enumerate(token_sequence):
            if token == "PIECE_START":
                pass
            elif token == "PIECE_END":
                print("The end.")
                break
            elif token == "TRACK_START":
                current_bar_index = 0
                track_count += 1
                pass
            elif token == "TRACK_END":
                pass
            elif token == "KEYS_START":
                pass
            elif token == "KEYS_END":
                pass
            elif token.startswith("KEY="):
                pass
            elif token.startswith("INST"):
                instrument = token.split("=")[-1]
                if instrument != "DRUMS" and use_program:
                    if instrument_mapper is not None:
                        if instrument in instrument_mapper:
                            instrument = instrument_mapper[instrument]
                    current_program = int(instrument)
                    current_instrument = track_count
                    current_is_drum = False
                if instrument == "DRUMS" and use_drums:
                    current_instrument = 0
                    current_program = 0
                    current_is_drum = True
            elif token == "BAR_START":
                current_time = current_bar_index * self.BAR_LENGTH_120BPM
                current_notes = {}
            elif token == "BAR_END":
                current_bar_index += 1
                pass
            elif token.startswith("NOTE_ON"):
                pitch = int(token.split("=")[-1])
                note = note_sequence.notes.add()
                note.start_time = current_time
                note.end_time = current_time + 4 * self.NOTE_LENGTH_16TH_120BPM
                note.pitch = pitch
                note.instrument = current_instrument
                note.program = current_program
                note.velocity = 80
                note.is_drum = current_is_drum
                current_notes[pitch] = note
            elif token.startswith("NOTE_OFF"):
                pitch = int(token.split("=")[-1])
                if pitch in current_notes:
                    note = current_notes[pitch]
                    note.end_time = current_time
            elif token.startswith("TIME_DELTA"):
                delta = float(token.split("=")[-1]) * self.NOTE_LENGTH_16TH_120BPM
                current_time += delta
            elif token.startswith("DENSITY="):
                pass
            elif token == "[PAD]":
                pass
            else:
                pass

        instruments_drums = []
        for note in note_sequence.notes:
            pair = [note.program, note.is_drum]
            if pair not in instruments_drums:
                instruments_drums += [pair]
            note.instrument = instruments_drums.index(pair)

        if only_piano:
            for note in note_sequence.notes:
                if not note.is_drum:
                    note.instrument = 0
                    note.program = 0

        return note_sequence

    def empty_note_sequence(self, qpm=120.0, total_time=0.0):
        note_sequence = note_seq.protobuf.music_pb2.NoteSequence()
        note_sequence.tempos.add().qpm = qpm
        note_sequence.ticks_per_quarter = note_seq.constants.STANDARD_PPQ
        note_sequence.total_time = total_time
        return note_sequence
