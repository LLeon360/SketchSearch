FROM tensorflow/tensorflow:2.9.1
COPY . /app
WORKDIR /app
RUN pip3 --no-cache-dir install -r requirements.txt
EXPOSE 5000

CMD python ./app.py