# MusicGPT

This project explores personalized music creation using advanced ML, aiming for music aligned with preferences. It evaluates models like Jukebox, MuseNet, and Music Transformer for musical nuances, cohesion, and emotional depth, with thorough measures and expert feedback for iterative enhancement. It envisions transforming music engagement into an interactive, co-creative process, leveraging ML and user-centric design to redefine music's role in daily life.

## How to run
**Firstly train the model**
* Each notebook is named in parts (1-5)
* Final outputs is the trained model with weights and biases configured

**For the server side**
* open `flask-server` folder
* copy paste the Final outputs folder into the `flask-server` folder
* run docker commands `docker build -t okbenzene/python-api:latest .`
* run the container `docekr container run -d -p 4000:3000 okbenzene/python-api:latest`

**For the client side**
* open the `react-app` folder
* open a new terminal **ctrl+`** 
* run `npm i`
* type `npm run musicgpt`


# What to FIND!
This project is divided into three core sections.

* `Jupyter Notebook` - Model creation, Model Training, Model Checkpoints.
* `Server` - Creating Model API and deploying the model using Docker.
* `Client` - Creating a webpage to interact with the model (Experimental).

![website](https://github.com/OKBenzene02/MusicGPT/blob/main/assets/1.png)

## What they include!
### `Jupyter Notebook`
####  Current file includes
- Midi Chunking
- Midi Tokenization
- GPT-2 Model
- HuggingFace for saving Tokenizer, Dataset
- Wandb for logging the model training

#### Further improvements
- Larger training data
- Imporve tokenization process to diversify on variety of instruments
- GPT-2 Tweaks for better predictions (Hardware intensive)

### `Server`
####  Current file includes
- Model API made using flask
- Test script included
- Easier debugging
- Song generations (Parsed and saved as file .wav format)

#### Further improvements
- Code optimizations
- Minor issue with generations (Memory cosumption)
- error handling
- API for parsing piano notations directly

### `Client`
####  Current file includes
- Component based
- Latest Framework (React)
- Input based generation
- History Component for previously generated compositions

#### Further improvements
- Memory leak issues when POST route is called (FIXED - Still needs an improvement)
- About me page to be built
- In app Piano interaction for generating composition
- Email validations 
- Visualizer improvements

## Authors
- [@Liyakhat Yousuf Mogal](https://www.linkedin.com/in/liyakhat-yousuf-mogal-54b506221/)

Thanks to [@juancopi81](https://github.com/juancopi81) for supporting
