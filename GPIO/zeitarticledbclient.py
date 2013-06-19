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

    def get_article(self, articleid):
        self.connect()
        self.conn.request("POST", "/article/" + str(articleid)+"/formatted", headers=self.headers)
        response = self.conn.getresponse()
        if response.status == 200:
            data = response.read()
            art = json.loads(data)
            article = art['article']
            return zeitarticle.Article(article['id'], article['title'], article['article'], article['date'])

    def printed(self, articleid):
        self.connect()
        self.conn.request("GET", "/article/" + str(articleid)+"/printed", headers=self.headers)
        self.conn.getresponse()

    def connect(self):
        self.conn = httplib.HTTPConnection(self.url)