import zeitarticledbclient
import zeittypewriter
import zeitscanner
import os
from optparse import OptionParser


parser = OptionParser()
parser.add_option("-s", "--scan", help="Run script without Scanning QRCode", dest="scanning", default=True)
parser.add_option("-a", "--article", help="Use this article as source", dest="articleId", default=0)

(options, args) = parser.parse_args()
if options.scanning == 'True':
    os.system("fuser -k /dev/video0")
    scanner = zeitscanner.Scanner('/dev/video0')
typewriter = zeittypewriter.Typewriter()

while True:
    dbClient = zeitarticledbclient.ArticleDatabaseClient("localhost:3000")

    if options.scanning  == 'True':
        result = 0
        result = scanner.scan_one()
    else:
        result = options.articleId
    article = dbClient.get_article(result)
    if not article:
        continue
    typewriter.printArticle(article)
    dbClient.printed(article.id)


