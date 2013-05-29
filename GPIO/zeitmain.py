import zeitarticle
import zeitarticledbclient
import zeittypewriter
# import zeitscanner


# setup a callback
def scanner_handler(proc, image, closure):
    # extract results
    for symbol in image:
        if not symbol.count:
            # do something useful with results
            print 'decoded', symbol.type, 'symbol', '"%s"' % symbol.data

#scanner = zeitscanner.Scanner('/dev/video0', scanner_handler)

dbclient = zeitarticledbclient.ArticleDatabaseClient("localhost:3000")

article = dbclient.get_article(1)
print type(article)
print article.title
print article.article
for cat in article.categories:
    print cat
print article.date

