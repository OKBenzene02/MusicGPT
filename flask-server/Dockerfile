FROM python:3.12.2
WORKDIR /main
COPY . /main
RUN apt-get update && apt-get install -y fluidsynth
RUN pip install -r requirements.txt
EXPOSE 3000
CMD python ./app.py