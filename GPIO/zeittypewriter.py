import sys
import time


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
        time.sleep(0.2)
        sys.stdout.write(char)
        # trigger key here
