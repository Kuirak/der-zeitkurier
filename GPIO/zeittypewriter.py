import sys
import time
from __future__ import print_function

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
        print('\n')

    def printChar(self, char):
        time.sleep(0.1)
        print(char, end='')
        # trigger key here
