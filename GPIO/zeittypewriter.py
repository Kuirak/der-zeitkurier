import sys


class Typewriter:
    def printArticle(self, article):
        for line in article.title:
            self.printLine(line)
        for line in article.article:
            self.printLine(line)
        self.printLine(article.date)

    def printLine(self, line):
        for char in list(line):
            self.printChar(char)
        print

    def printChar(self, char):
        sys.stdout.write(char)
