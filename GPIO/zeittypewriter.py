from __future__ import print_function
import time
import random
import csv
import zeitelectronics


class Typewriter:

    def __init__(self):

        f = open('mapping.csv', 'rb')
        reader = csv.DictReader(f, delimiter=",")
        f.close()
        self.keymap = {}
        for row in reader:
            self.keymap[row["key"]] = {"output": row["output"], "capslock": row["capslock"] == 'TRUE'}
        self.electronics = zeitelectronics.TypwriterElectronics(self.keymap)

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
        if char == " ":
            self.electronics.triggerChar("space")
        elif char == "=":
            self.electronics.triggerChar("equals")
        elif char == '"':
            self.electronics.triggerChar("quotes")
        elif char == "'":
            self.electronics.triggerChar("singlequote")
        else:
            self.electronics.triggerChar(char)

    def printNewLine(self):
        print()

    def hitReturn(self):
        self.electronics.triggerChar("return")





