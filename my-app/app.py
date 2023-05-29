from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/healthcheck")
def health_check():
    return jsonify({"health_status": "Good"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)