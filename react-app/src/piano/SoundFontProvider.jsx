import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Soundfont from 'soundfont-player';

function SoundfontProvider(props) {
  const [activeAudioNodes, setActiveAudioNodes] = useState({});
  const [instrument, setInstrument] = useState(null);

  useEffect(() => {
    loadInstrument(props.instrumentName);
  }, [props.instrumentName]);

  const loadInstrument = (instrumentName) => {
    // Re-trigger loading state
    setInstrument(null);
    Soundfont.instrument(props.audioContext, instrumentName, {
      format: props.format,
      soundfont: props.soundfont,
      nameToUrl: (name, soundfont, format) => {
        return `${props.hostname}/${soundfont}/${name}-${format}.js`;
      },
    }).then((instrument) => {
      setInstrument(instrument);
    });
  };

  const playNote = (midiNumber) => {
    props.audioContext.resume().then(() => {
      const audioNode = instrument.play(midiNumber);
      setActiveAudioNodes((prevActiveAudioNodes) => ({
        ...prevActiveAudioNodes,
        [midiNumber]: audioNode,
      }));
    });
  };

  const stopNote = (midiNumber) => {
    props.audioContext.resume().then(() => {
      if (!activeAudioNodes[midiNumber]) {
        return;
      }
      const audioNode = activeAudioNodes[midiNumber];
      audioNode.stop();
      setActiveAudioNodes((prevActiveAudioNodes) => ({
        ...prevActiveAudioNodes,
        [midiNumber]: null,
      }));
    });
  };

  // Clear any residual notes that don't get called with stopNote
  const stopAllNotes = () => {
    props.audioContext.resume().then(() => {
      const nodes = Object.values(activeAudioNodes);
      nodes.forEach((node) => {
        if (node) {
          node.stop();
        }
      });
      setActiveAudioNodes({});
    });
  };

  return props.render({
    isLoading: !instrument,
    playNote: playNote,
    stopNote: stopNote,
    stopAllNotes: stopAllNotes,
  });
}

SoundfontProvider.propTypes = {
  instrumentName: PropTypes.string.isRequired,
  hostname: PropTypes.string.isRequired,
  format: PropTypes.oneOf(['mp3', 'ogg']),
  soundfont: PropTypes.oneOf(['MusyngKite', 'FluidR3_GM']),
  audioContext: PropTypes.instanceOf(window.AudioContext),
  render: PropTypes.func,
};

SoundfontProvider.defaultProps = {
  format: 'mp3',
  soundfont: 'MusyngKite',
  instrumentName: 'acoustic_grand_piano',
};

export default SoundfontProvider;
