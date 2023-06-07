import pytest
import json
from app import app as flask_app

@pytest.fixture
def app():
    yield flask_app

@pytest.fixture
def client(app):
    return app.test_client()

def test_main_status_code(app, client):
    res = client.get("/")
    assert res.status_code == 200

def test_userPost_status_code(app, client):
    res = client.get("/GetUserPost")
    assert res.status_code == 200

def test_cat_status_code(app, client):
    res = client.get("/GetCategoryPost")
    assert res.status_code == 200