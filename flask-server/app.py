import os
from flask import Flask, request, jsonify, send_file
from flask_cors import cross_origin, CORS
from music21 import converter

import torch
import pretty_midi
import miditok
import miditoolkit
import tqdm
import pandas
import fluidsynth
import accelerate
import sentencepiece 
import music21
from music21.stream import Score

from helpers.helpers import Helpers
from main import encode_single_song

from model import Model

import numpy as np
import soundfile as sf

from pathlib import Path

app = Flask(__name__)
CORS(app)
new_model = Model() 
SAMPLE_RATE = 16000

@app.route('/')
@cross_origin()
def hello_world():
    return '<h1>Navigate to /upload URL for uploading mid/midi files....</h1>'

@app.route('/upload', methods=['POST'])
@cross_origin()
def upload_midi():
    # Check if the POST request has a file part
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']

    # If the user does not select a file, the browser submits an empty file without a filename
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file:
        # Save the file to a temporary location
        temp_path = 'temp.mid'
        file.save(temp_path)

        return jsonify({'message': 'File uploaded successfully', 'temp_path': temp_path})

@app.route('/generate', methods=['POST'])
@cross_origin()
def generate_song():
    # Get the path to the uploaded MIDI file
    temp_path = request.json.get('temp_path')

    print('Temporary MIDI file path:', temp_path)

    song = music21.converter.parse(temp_path)
    song = " ".join(encode_single_song(song)[:20]) # Take a prompt of  4-5 secs
    

    if not temp_path:
        return jsonify({'error': 'No MIDI file uploaded'})


    print('Generating the compositions..................')
    # Generate the song sequence
    token_sequence, int16_array, float32 = new_model.generate_song_sequence(" ".join(song))
    
    float32_array = int16_array.astype(np.float32) / np.iinfo(np.int16).max

    file_name = request.json.get('file_name')
    output_path = f'audio_files/{file_name}.wav'

    sf.write(output_path, float32_array, samplerate=SAMPLE_RATE)

    # Optionally, you can remove the temporary file
    if os.path.exists(temp_path):
        os.remove(temp_path)
    
    return jsonify({
        "sucess": "Generation sucessful check for audio files"
    })

@app.route('/audio', methods=['GET'])
@cross_origin()
def get_audio_files():
    audio_files_path = list(Path('audio_files').glob('**/*.wav'))
    audio_files_path += list(Path('audio_files').glob('**/*.mp3'))
    audio_files_path = [str(audio_file) for audio_file in audio_files_path]
    return jsonify({
        'files': audio_files_path
    })

@app.route('/audio_files/<path:filename>')
def get_audio_file(filename):
    audio_file_path = f'audio_files/{filename}'
    return send_file(audio_file_path)

@app.route('/test', methods=['GET'])
@cross_origin()
def get_test_route():
    return jsonify({"PORT": "localhost:4000 running successfully"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int("3000"), debug=True)