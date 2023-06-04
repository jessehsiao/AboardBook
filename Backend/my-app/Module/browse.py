import pytest
import pymysql
import pymongo
import json
from db.db import get_db
# from app import app as flask_app
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import datetime
import difflib

browse_bp = Blueprint('browse_bp', __name__)

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


# Get post by category (瀏覽看板（文章依照主題分類）GET)
@browse_bp.route('/GetCategoryPost', methods=["GET"])
def getCategoryPost():
    post_cat = request.args.get('category')
    try:
        db = get_db()
        cursor = db.cursor(cursor=pymysql.cursors.DictCursor)
        query = '''
        SELECT name, post_id, title, content, timestamp, category_name
        FROM Category
        LEFT JOIN Post ON Category.category_id = Post.cat_id
        LEFT JOIN Users ON Users.user_id = Post.user_id
        WHERE Category.category_name = (%s);
        '''
        cursor.execute(query, [post_cat])
        db.commit()
        return jsonify(cursor.fetchall())
    except:
        db.rollback()
        return 'Failed to retrieve post by category.'
    finally:
        db.close()
    
def retrieveInfo():
    db = get_db()
    cursor = db.cursor(cursor=pymysql.cursors.DictCursor)
    try:
        cursor.execute("""
        SELECT post_id, title, timestamp, content, category_name, name
        FROM(SELECT post_id, title, timestamp, content, category_name, user_id
             From Post
             LEFT JOIN Category
             ON Post.cat_id = Category.category_id
            ) AS PostWithCtegory
        LEFT JOIN Users
        ON Users.user_id = PostWithCtegory.user_id
        GROUP BY post_id, title, timestamp, content, category_name, name;
        """)
        result = cursor.fetchall()
        db.commit()
        return result
    except:
        db.rollback()
        return 'Failed to retrieve form by keyword.'
    finally:
        db.close()

# homepage form
@browse_bp.route('/home', methods=['GET'])
def getPostRecommendation():
    result = retrieveInfo()
    result.sort(key=lambda x: x['timestamp'], reverse = True)
    return jsonify(result)


def fuzzySearch(keyword, formInfo):
    for form in formInfo:
        # 比對項目：文章標題、類別、文章內容、文章作者
        form['score'] = difflib.SequenceMatcher(None, str(form['name'])+str(form['content'])+str(
            form['title'])+str(form['category_name']), keyword).quick_ratio()
    formInfo = list(filter(lambda x: x['score'] > 0, formInfo))
    formInfo = sorted(formInfo, key=lambda k: k['score'], reverse=True)
    return formInfo


# Get post by keyword (探索文章 GET)
@browse_bp.route('/GetKeywordPost', methods=["GET"])
def getKeywordPost():
    keyword = request.args.get('keyword')
    forms = retrieveInfo()
    response = fuzzySearch(keyword, forms)
    return jsonify(response)


def insertCommont(comments):
    try: 
        # connect mongo db
        uri = "mongodb+srv://DSFP_DB:ntuim@cluster0.p2xogih.mongodb.net/?retryWrites=true&w=majority"
        # 連接 MongoDB 伺服器
        client = pymongo.MongoClient(uri)
        db = client["DSFP_DB"]
        # select collection
        comments_collection = db["post_comments"]

        comments_collection.insert_one(comments)
        return True
    except:
        print("Fail to insert comment")

    # for comment in comments:
    #     comments_collection.insert_one(comment)

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

# get jwt function
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return current_user

# insert comment (文章留言 POST)
@browse_bp.route('/InsertComent', methods=['POST'])
def insertComent():
    req_json = request.get_json(force=True)
    post_id = req_json["post_id"]
    post_comment = req_json["post_comment"]

    user_email = protected()
    user_id = getUserIdByEmail(user_email)
    insert_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    comments = {
        "Post_ID": post_id,
        "User_ID": user_id[0]["user_id"],
        "Comment_Content": post_comment,
        "Timestamp": insert_time,
    }
    response = {
        "status": "",
        "message": ""
    }

    if insertCommont(comments):
        response["status"] = 'success'
        response["message"] = '文章留言成功！'
    else:
        response["status"] = 'fail'
        response["message"] = '文章留言失敗'

    return jsonify(response)


def getPostComment(post_id):    
    try: 
        # connect mongo db
        uri = "mongodb+srv://DSFP_DB:ntuim@cluster0.p2xogih.mongodb.net/?retryWrites=true&w=majority"
        # 連接 MongoDB 伺服器
        client = pymongo.MongoClient(uri)
        db = client["DSFP_DB"]
        # select collection
        comments_collection = db["post_comments"]

        # 設定查詢條件
        query = {"Post_ID": int(post_id)}

        # 執行查詢並排序
        results = comments_collection.find(query).sort("Timestamp", pymongo.ASCENDING)
        # 建立回應的 JSON 數據
        response = []
        for result in results:
            comment = {
                "User ID": result["User_ID"],
                "Comment Content": result["Comment_Content"],
                "Timestamp": result["Timestamp"]
            }
            response.append(comment)
        # print("MongoDB = ",comment)
        # 回傳回應
        return response
    except Exception as e:
        print("Error:", e)


def getPostContentByID(post_id):  
    db = get_db()
    cursor = db.cursor(cursor=pymysql.cursors.DictCursor)
    query = '''
    SELECT name, post_id, title, content, timestamp, category_name
    FROM Post
    LEFT JOIN Users ON Users.user_id = Post.user_id
    LEFT JOIN Category ON Category.category_id = Post.cat_id
    WHERE Post.post_id = (%s);
    '''
    cursor.execute(query, [post_id])
    db.commit()
    db.close()

    return cursor.fetchall()

# Get post and comment by post_id (閱讀文章 GET)
@browse_bp.route('/GetPostById', methods=["GET"])
def getPostById():
    post_id = request.args.get('post_id')
    response = [{'posted': getPostContentByID(post_id),
                'comments': getPostComment(post_id)}]
    return jsonify(response)


# @pytest.fixture
# def app():
#     yield flask_app

# @pytest.fixture
# def client(app):
#     return app.test_client()

# def test_main_status_code(app, client):
#     res = client.get('/')
#     assert res.status_code == 200