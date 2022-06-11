from flask import Flask, jsonify, request, render_template
from datetime import datetime
import json
import base64
import os

app = Flask(__name__)

name = ""
message = ""


@app.route('/save_image', methods=['POST', 'GET'])
def save_image():
    print("Got here")
    # GET request
    if request.method == 'GET':
        message = {'output': 'GET REQ'}
        return jsonify(message)  # serialize and use JSON headers
    # POST request
    if request.method == 'POST':
        image64 = request.get_json()['Image']
        label = request.get_json()['Label']
        splitstr = image64.split(',')

        dir = f'/SketchSearch/images/{label}'
        isExist = os.path.exists(dir)
        if not isExist:
            print("Making dir bc not found")
            os.makedirs(dir)

        filecount = len([name for name in os.listdir(
            dir) if os.path.isfile(os.path.join(dir, name))])+1
        print(filecount)
        filename = f'{filecount}.png'
        filepath = os.path.join(dir, filename)

        with open(filepath, "wb") as fh:
            fh.write(base64.decodebytes(splitstr[1].encode()))
        fh.close()
        message = {'output': 'SUCCESS'}
        return jsonify(message)


if __name__ == '__main__':
    app.run(host='0.0.0.0')
