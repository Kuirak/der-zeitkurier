import zeitarticle
import zeitarticledbclient
import zeittypewriter
import zeitscanner


dbclient = zeitarticledbclient.ArticleDatabaseClient("localhost:3000")


scanner = zeitscanner.Scanner('/dev/video0')
result = scanner.scan_one()
print result



#article = dbclient.get_article(1)
#print type(article)
#for line in article.title:
#    print line
#for line in article.article:
#    print line
#print article.date

