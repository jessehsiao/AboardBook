import pymysql
import json
from db.db import get_db
from app import app as flask_app
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, create_access_token, create_refresh_token, get_jwt_identity
from hashlib import md5
from datetime import timedelta


member_bp = Blueprint('member_bp', __name__)

@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return current_user


def addMember(user_email, user_name, user_hashed_pwd):
    db = get_db()
    cursor = db.cursor()
    try:
        query = '''
        INSERT into Users (email, name, hashed_pwd) values (%s,%s,%s);
        '''
        cursor.execute(query, (user_email, user_name, user_hashed_pwd))
        db.commit()
        # return 'Succeed in adding member.'
        print('Succeed in adding member.')
    except:
        db.rollback()
        print('Failed to add member.')
        # return 'Failed to add member.'
    finally:
        db.close()

def getMemberByUserEmail(email):
    db = get_db()
    cursor = db.cursor(cursor=pymysql.cursors.DictCursor)
    try:
        query = '''
        SELECT user_id, name, email
        From Users 
        WHERE Users.email = (%s);
        '''
        cursor.execute(query, [email])
        db.commit()
        return cursor.fetchall()
    except:
        db.rollback()
        # return 'Failed to retrieve member.'
    finally:
        db.close()

def getPasswordByUserEmail(user_email):
    db = get_db()
    cursor = db.cursor(cursor=pymysql.cursors.DictCursor)
    try:
        query = '''
        SELECT hashed_pwd 
        from Users
        WHERE Users.email = (%s);
        '''
        cursor.execute(query, [user_email])
        db.commit()
        # final = [item[0] for item in cursor.fetchall()]
        return cursor.fetchall()
    except:
        db.rollback()
        # return 'Failed to retrieve member's password.'
    finally:
        db.close()


@member_bp.route('/Register', methods=["POST"])
def Register():
    response_return = {
        "status": "",
        "message": ""
    }
    req_json = request.get_json(force=True)

    email = req_json["email"].lower()
    user_name = req_json["username"]
    password = req_json["password"]
    password2 = req_json["password2"]

    rows = getMemberByUserEmail(email)
    if rows != ():
        response_return["status"] = "error"
        response_return["message"] = "此帳號已被註冊"
    else:
        if password_check(password, password2):
            password_hash = str(md5(password.encode("utf-8")).hexdigest())
            addMember(email, user_name, password_hash)
            response_return["status"] = "success"
            response_return["message"] = "註冊成功"
            
        else:
            response_return["status"] = "error"
            response_return["message"] = "密碼不一致"

    return jsonify(response_return)


@member_bp.route('/Login', methods=["POST"])
def Login():
    req_json = request.get_json(force=True)
    email = req_json["email"].lower()
    password = req_json["password"]
    response_return = {
        "status": "",
        "message": "",
        "test": ""
    }
    if login_check(email, password) == True:
        # access_token = create_access_token(identity=id, expires_delta = timedelta(seconds=10))
        # refresh_token = create_refresh_token(identity=id, expires_delta = timedelta(seconds=20))
        access_token = create_access_token(
            identity=email, expires_delta=timedelta(minutes=120))
        refresh_token = create_refresh_token(
            identity=email, expires_delta=timedelta(days=1))
        return jsonify({'access_token': access_token, 'refresh_token': refresh_token, "status": "success", "message": "登入成功"})
    elif login_check(email, password) == False:
        response_return["status"] = "error"
        response_return["message"] = "密碼錯誤"
        return jsonify(response_return)
    else:
        response_return["status"] = "error"
        response_return["message"] = "請先註冊"
        response_return["test"] = login_check(email, password)
        return jsonify(response_return)


def password_check(password, password2):
    if password == password2:
        return True
    else:
        return False

def login_check(user_email, password):
    password_hash = str(md5(password.encode("utf-8")).hexdigest())
    rows = getPasswordByUserEmail(user_email)
    if rows != []:
        if password_hash == rows[0]['hashed_pwd']:
            return True
        else:
            return False
