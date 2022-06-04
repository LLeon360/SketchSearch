from flask import Flask, jsonify, request, render_template
from datetime import datetime
import json 

app = Flask(__name__)

name = ""
message = ""

@app.route('/save_image', methods = ['POST', 'GET'])
def save_image():
    print("Got here")
        # GET request
    if request.method == 'GET':
        message = {'output':'GET REQ'}
        return jsonify(message)  # serialize and use JSON headers
    # POST request
    if request.method == 'POST':
        image64 =(request.get_json()['Image'])
        splitstr = image64.split(',')
        
        import base64
        with open("imageToSave.png", "wb") as fh:
            fh.write(base64.decodebytes(splitstr[1].encode()))
        fh.close()
        message = {'output':'POST'}
        return jsonify(message)

if __name__ == '__main__':
   app.run(host='0.0.0.0')