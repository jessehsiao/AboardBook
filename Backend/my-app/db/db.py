import pymysql

# connetion configs
host = 'aboardbook-db-instance.cmwrqwcbbahn.ap-northeast-1.rds.amazonaws.com'
port = 3306
username = 'admin'
password = 'admin123'
database = 'AdboardBook_DB'

def get_db():
    # Construct connection string
    conn = pymysql.connect(host=host, port=port, user=username, password=password, database=database)
    print("Connection established")
    return conn

try:
    # build db connection
    connection = pymysql.connect(host=host, port=port, user=username, password=password, database=database)
    print('connection successful')
    cursor = connection.cursor()
    
    # run sql query
    cursor.execute("SELECT * FROM Users")
    
    # get all data
    rows = cursor.fetchall()
    
    # output data
    # for row in rows:
    #     print(row)
    
    # close connection
    cursor.close()
    connection.close()

except pymysql.Error as e:
    print("DB ERROR:", e)
