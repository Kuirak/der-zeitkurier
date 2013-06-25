import zeitarticledbclient
import zeittypewriter
import zeitscanner
import os


os.system("fuser -k /dev/video0")
scanner = zeitscanner.Scanner('/dev/video0')
typewriter =zeittypewriter.Typewriter()

while True:
    dbClient = zeitarticledbclient.ArticleDatabaseClient("localhost:3000")

    result = scanner.scan_one()
    article = dbClient.get_article(1)
    if not article:
        continue
    typewriter.printArticle(article)
    dbClient.printed(article.id)


