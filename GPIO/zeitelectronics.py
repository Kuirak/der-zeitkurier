import time


class TypwriterElectronics:
    def __init__(self, keymap):
        self.keymap = keymap
        self.outputArray = []
        self.resetOutputArray()

    def triggerChar(self, name):
        output = self.keymap[name]["output"]
        capslock = self.keymap[name]["capslock"]
        if capslock:
            self.triggerCapslock()
        self.triggerOutput(output)
        self.triggerReset()

    def triggerCapslock(self):
        # set output for shift
        self.triggerOutput(self.keymap["shift"]["output"])
        print "Shift"

    def triggerReset(self):
        #set all outputs to 0
        self.resetOutputArray()
        self.sendToShiftRegister()
        #stream self.outputArray to shiftregister and latch
        print "reset"
        time.sleep(0.005)

    def triggerOutput(self, number):
        print number
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