from __future__ import print_function
import time
import random


class Typewriter:
    def printArticle(self, article):
        for line in article.title:
            self.printLine(line)
        self.printNewLine()
        for line in article.article:
            self.printLine(line)
        self.printNewLine()
        self.printLine(article.date)

    def printLine(self, line):
        for char in list(line):
            self.printChar(char)
        self.printNewLine()

    def printChar(self, char):
        triggerTime = random.uniform(0.15, 0.3)
        time.sleep(triggerTime)
        print(char, end='')
        # trigger key here

    def printNewLine(self):
        print()
