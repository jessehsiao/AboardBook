import pymysql
import json
from db.db import get_db
# from app import app as flask_app
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import datetime

# 撰寫文章 POST
# 已發布文章管理 GET

post_bp = Blueprint('post_bp', __name__)

# get jwt function
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return current_user

# Get post of user
@post_bp.route('/GetUserPost', methods=["GET"])
def getUserPost():
    user_email = protected()
    db = get_db()
    cursor = db.cursor(cursor=pymysql.cursors.DictCursor)
    query = '''
    SELECT name, post_id, title, content, timestamp, category_name
    FROM Users
    LEFT JOIN Post ON Users.user_id = Post.user_id
    LEFT JOIN Category ON Category.category_id = Post.cat_id
    WHERE Users.email = (%s);
    '''
    cursor.execute(query, [user_email])
    db.commit()
    db.close()

    return cursor.fetchall()

def getUserIdByEmail(user_email):
    db = get_db()
    cursor = db.cursor(cursor=pymysql.cursors.DictCursor)
    try:    
        query = """
        Select user_id
        From Users
        Where email = (%s);
        """
        cursor.execute(query, [user_email])
        db.commit()
        return cursor.fetchall()
    except:
        db.rollback()
        # return 'Failed to retrieve user's id.'
    finally:
        db.close()

def getCategoryIdByCategoryName(category_name):
    db = get_db()
    cursor = db.cursor(cursor=pymysql.cursors.DictCursor)
    try:    
        query = """
        Select category_id
        From Category
        Where category_name = (%s);
        """
        cursor.execute(query, [category_name])
        db.commit()
        return cursor.fetchall()
    except:
        db.rollback()
        # return 'Failed to retrieve category id.'
    finally:
        db.close()

def addPost(post_title, post_content, post_time, category_name):
    db = get_db()
    cursor = db.cursor()
    user_email = protected()
    user_id = getUserIdByEmail(user_email)
    category_id = getCategoryIdByCategoryName(category_name)
    try:
        query = """
        INSERT INTO Post(title, content, timestamp, cat_id, user_id)
        values (%s,%s,%s,%s,%s);
        """
        cursor.execute(query, [post_title, post_content,
                       post_time, category_id[0]['category_id'], user_id[0]['user_id']])
        db.commit()
        return True
    except:
        db.rollback()
        print("Failed to add post.")
        # return 'Failed to add post.'
    finally:
        db.close()


def getPostIdByUserIdTitle(user_id, title):
    db = get_db()
    cursor = db.cursor(cursor=pymysql.cursors.DictCursor)
    try:    
        query = '''
        SELECT post_id
        FROM Post
        WHERE user_id = (%s) and title = (%s);
        '''
        cursor.execute(query, [user_id[0]["user_id"], title])
        db.commit()
        return cursor.fetchall()
    except pymysql.Error as e:
        db.rollback()
        return 'Failed to retrieve post id.'
    finally:
        db.close()
    



@post_bp.route('/CreatePost', methods=['POST'])
def CreatePost():
    req_json = request.get_json(force=True)
    post_title = req_json["title"]
    post_content = req_json["content"]
    post_cat = req_json["category"]


    response = {
        "status": "",
        "message": ""
    }

    post_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if addPost(post_title, post_content, post_time, post_cat):
        user_email = protected()
        user_id = getUserIdByEmail(user_email)
        post_id = getPostIdByUserIdTitle(user_id, post_title)

        response["status"] = 'success'
        response["message"] = '文章撰寫成功！'
        response["post_id"] = post_id[0]['post_id']
    else:
        response["status"] = 'fail'
        response["message"] = '文章撰寫失敗'

    return jsonify(response)
