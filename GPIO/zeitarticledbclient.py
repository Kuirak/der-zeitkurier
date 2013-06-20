import httplib
import base64
import json
import zeitarticle


class ArticleDatabaseClient:
    def __init__(self, url):
        username = "zeitkurier"
        password = "kurier-der-zeit"
        auth = base64.encodestring("%s:%s" % (username, password))
        self.headers = {"Authorization": "Basic %s" % auth}
        self.url = url

    def get_article(self, articleId):
        self.connect()
        self.conn.request("POST", "/article/" + str(articleId)+"/formatted", headers=self.headers)
        print('Sending request to /article/' + str(articleId)+"/formatted")
        response = self.conn.getresponse()
        print('Got Response from /article/' + str(articleId)+"/formatted")
        if response.status == 200:
            data = response.read()
            art = json.loads(data)
            article = art['article']
            print 'Got ' + str(article['title'])
            return zeitarticle.Article(article['articleId'], article['title'], article['article'], article['date'])
        if response.status == 404:
            return False

    def printed(self, articleId):
        self.connect()
        self.conn.request("GET", "/article/" + str(articleId)+"/printed", headers=self.headers)
        self.conn.getresponse()

    def connect(self):
        self.conn = httplib.HTTPConnection(self.url)
        print('Connected to ' +self.url)