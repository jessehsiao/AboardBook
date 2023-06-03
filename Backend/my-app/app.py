from flask import Flask, jsonify
app = Flask(__name__)

from Module.browse import browse_bp
from Module.member import member_bp
from Module.post import post_bp
from datetime import timedelta
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token

# register blueprint
app.register_blueprint(browse_bp)
app.register_blueprint(member_bp)
app.register_blueprint(post_bp)

# set JWT
app.config['JWT_SECRET_KEY'] = 'this-should-be-change'
app.config["JWT_COOKIE_SECURE"] = False
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config['CORS_HEADERS'] = 'Content-Type'
jwt = JWTManager(app)

# set CORS
CORS(app)

# set header after every request
@app.after_request
def after_request(response):
    header = response.headers
    header['Access-Control-Allow-Origin'] = '*'
    header['Access-Control-Allow-Headers'] = '*'
    header['Access-Control-Allow-Methods'] = '*'
    header['Content-type'] = 'application/json'
    header['Cache-control'] = 'no-cache'  # general content cache
    # header['Access-Control-Max-Age'] = 30  # preflight response cache
    return response

# refresh token
@ app.route("/refresh", methods=["POST"])
@ jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(
        identity=identity, expires_delta=timedelta(minutes=120))
    # access_token = create_access_token(identity=identity, expires_delta = timedelta(seconds=10))
    return jsonify(access_token=access_token, message="success")

@app.route("/")
def hello_world():
    return jsonify({"health_status": "Good"})

@app.route("/healthcheck")
def health_check():
    return jsonify({"health_status": "Good"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)