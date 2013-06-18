import zeitarticle
import zeitarticledbclient
import zeittypewriter
import zeitscanner


dbclient = zeitarticledbclient.ArticleDatabaseClient("localhost:3000")

# setup a callback
def scanner_handler(proc, image, closure):
    # extract results
    for symbol in image:
        if not symbol.count:
            # do something useful with results
            print 'decoded', symbol.type, 'symbol', '"%s"' % symbol.data

scanner = zeitscanner.Scanner('/dev/video0', scanner_handler)
scanner.activate()
scanner.wait()



#article = dbclient.get_article(1)
#print type(article)
#for line in article.title:
#    print line
#for line in article.article:
#    print line
#print article.date

