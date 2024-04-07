from transformers import AutoTokenizer, AutoConfig, GPT2LMHeadModel, PreTrainedTokenizerFast

from helpers.helpers import Helpers
import note_seq
import numpy as np


class Model:
    
    def __init__(self) -> None:
        self.SAMPLE_RATE = 44100
        self.model = AutoConfig.from_pretrained('Final outputs')
        self.tokenizer = PreTrainedTokenizerFast.from_pretrained('tokenizer/tokenizer.json')
        self.tokenizer.add_special_tokens({
            'pad_token': '[PAD]',
            'unk_token': '[UNK]',
            'cls_token': '[CLS]',
            'sep_token': '[SEP]',
            'mask_token': '[MASK]'
        })
        self.helpers = Helpers()

    def generate_song_sequence(self, sample):
        input_ids = self.tokenizer.encode(sample, return_tensors='pt')
        initial_tokens = GPT2LMHeadModel(self.model).generate(
            input_ids,
            max_length=256, # changes made here
            do_sample=True,
            temperature=1,
            eos_token_id= self.tokenizer.encode("TRACK_END")[0]
        )
        token_sequence = self.tokenizer.decode(initial_tokens[0],  skip_special_tokens=True)
        note_sequence = self.helpers.token_sequence_to_note(token_sequence)
        synth = note_seq.fluidsynth
        array_of_floats = synth(note_sequence, sample_rate=self.SAMPLE_RATE)
        int16_array = note_seq.audio_io.float_samples_to_int16(array_of_floats)
        float32 = int16_array.astype(np.float32)
        return token_sequence, int16_array, float32