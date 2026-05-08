from flask import Flask
from flask_cors import CORS

from routes.ahp_routes import ahp_bp
from routes.ai_routes import ai_bp
from routes.core_routes import core_bp
from routes.evaluation_routes import evaluation_bp


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(core_bp)
    app.register_blueprint(evaluation_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(ahp_bp)
    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
