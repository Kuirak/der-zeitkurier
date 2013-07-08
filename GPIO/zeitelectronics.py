import time


class TypwriterElectronics:
    def __init__(self, keymap):
        self.keymap = keymap
        print keymap
        self.outputArray = [0]*46
        self.resetOutputArray()

    def triggerChar(self, name):
        name = name.encode('utf8')
        output = self.keymap[name]["output"]
        capslock = self.keymap[name]["capslock"]
        if capslock:
            self.triggerCapslock()
        self.triggerOutput(output, name)
        self.triggerReset()

    def triggerCapslock(self):
        self.triggerOutput(self.keymap["shift"]["output"], "Shift")

    def triggerReset(self):
        print "reset"
        self.resetOutputArray()
        self.sendToShiftRegister()
        time.sleep(0.005)

    def triggerOutput(self, number, name):
        print name + ": " + number
        number = int(number)-1
        self.outputArray[number] = 1
        self.sendToShiftRegister()
        time.sleep(0.005)

    def resetOutputArray(self):
        count = 0
        while count < 46:
            self.outputArray[count] = 0
            count += 1

    def sendToShiftRegister(self):
        self.shiftOut()
        self.latch()

    def latch(self):
        print "Latch"
        # latch

    def shiftOut(self):
        print "Shift out"
        #shift self.outputArray to shift register