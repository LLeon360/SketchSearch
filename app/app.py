from flask import Flask, jsonify, request, render_template
from datetime import datetime
import json
import base64
import os
import tensorflow as tf
from tensorflow import keras
import keras
from keras.layers import Conv2D, MaxPooling2D, Dense, Dropout, Input, Flatten, SeparableConv2D, BatchNormalization, UpSampling2D
import numpy as np 
from PIL import Image #pip install pillow

# print(tf.__version__)

app = Flask(__name__)

name = ""
message = ""

#load classes
f = open("class_names.txt","r")
class_names = f.readlines()
f.close()
class_names = [s.strip() for s in class_names]

model = keras.models.load_model('model/cnnmodel.h5')

@app.route('/predict', methods=['POST', 'GET'])
def save_image():
    # print("Got here")
    # GET request
    if request.method == 'GET':
        message = {'output': 'GET REQ'}
        return jsonify(message)  # serialize and use JSON headers
    # POST request
    if request.method == 'POST':
        image64 = request.get_json()['Image']
        splitstr = image64.split(',')
        image64 = splitstr[1]
        # print(image64) #debug
        
        #process image into 28,28,1 nparray
        image = base64.decodebytes(image64.encode())
        image_tensor = tf.image.decode_png(contents=image, channels = 4)
        img_arr = image_tensor.numpy()
        img_arr = img_arr/255.0
        img_arr = 1-img_arr[:,:,0]
        tmp_image = Image.fromarray(img_arr)
        tmp_image = tmp_image.resize((28, 28), Image.ANTIALIAS)
        img_arr = np.array(tmp_image)
        # img_arr = np.stack((img_arr,)*3, axis=-1)
        img_arr = img_arr.reshape(28,28,1)

        pred = model.predict(np.expand_dims(img_arr, axis=0))[0]
        ind = (-pred).argsort()[:5]
        top_labels = [class_names[x] for x in ind]
        top_labels = [label.replace('_',' ').capitalize() for label in top_labels]
        predicted_class = top_labels[0]
        print(top_labels)

        message = {
            'prediction': predicted_class,
                    'top': top_labels
                    }
        return jsonify(message)

def store_img(image64, label):
    dir = f'/SketchSearch/images/{label}'
    isExist = os.path.exists(dir)
    if not isExist:
        print("Making dir bc not found")
        os.makedirs(dir)

    filecount = len([name for name in os.listdir(dir) if os.path.isfile(os.path.join(dir, name))])+1
    print(filecount)
    filename = f'{filecount}.png'
    filepath = os.path.join(dir, filename)

    with open(filepath, "wb") as fh:
        fh.write(base64.decodebytes(image64.encode()))
    fh.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0')