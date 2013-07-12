from __future__ import print_function
from time import sleep
import random
import csv
import zeitelectronics


class Typewriter:

    def __init__(self):
        f = open('mapping.csv', 'rb')
        reader = csv.DictReader(f, delimiter=",")
        self.keymap = {}
        self.rowRead(reader)
        self.electronics = zeitelectronics.TypewriterElectronics(self.keymap)

    def rowRead(self,reader):
        for row in reader:
            self.keymap[row["key"]] = {"output": row["output"], "capslock": row["capslock"] == 'TRUE'}
    
    def printArticle(self, article):
        for x in range(0,17):
            self.printNewLine()
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
        triggerTime = random.uniform(0.05, 0.15)
        sleep(triggerTime)
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
        self.hitReturn()

    def hitReturn(self):
        self.electronics.triggerChar("return")
        sleep(0.3)





