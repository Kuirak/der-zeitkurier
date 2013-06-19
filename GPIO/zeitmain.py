import zeitarticle
import zeitarticledbclient
import zeittypewriter
import zeitscanner


dbclient = zeitarticledbclient.ArticleDatabaseClient("localhost:3000")
scanner = zeitscanner.Scanner('/dev/video0')
typewriter =zeittypewriter.Typewriter()
result = scanner.scan_one()
article = dbclient.get_article(result)
typewriter.printArticle(article)
dbclient.printed(article.id)


