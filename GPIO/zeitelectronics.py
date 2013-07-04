from time import sleep
import wiringpi


class TypewriterElectronics:
    

    def __init__(self, keymap):
        self.DSPin = 10
        self.LatchPin = 9
        self.ClockPin = 11
        self.keymap = keymap
        print keymap
        self.outputArray = [0] * 46
        self.resetOutputArray()
        wiringpi.wiringPiSetupGpio()
        wiringpi.pinMode(self.DSPin,1)
        wiringpi.pinMode(self.LatchPin,1)
        wiringpi.pinMode(self.ClockPin,1)
       

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
        sleep(0.005)

    def triggerOutput(self, number, name):
        print name + ": " + number
        number = int(number) - 1
        self.outputArray[number] = 1
        self.sendToShiftRegister()
        sleep(0.005)

    def resetOutputArray(self):
        count = 0
        while count < 46:
            self.outputArray[count] = 0
            count += 1

    def sendToShiftRegister(self):
        self.latch(0)
        self.shiftOut()
        self.latch(1)

    def latch(self,toggle):
        print "Latch"
        sleep(0.05)
        wiringpi.digitalWrite(self.LatchPin,toggle)

    def shiftOut(self):
        print "Shift out"
        for value in self.outputArray:
            if value == 1:
                wiringpi.digitalWrite(self.DSPin,1)
                wiringpi.digitalWrite(self.ClockPin, 1)
                wiringpi.digitalWrite(self.ClockPin, 0)
                wiringpi.digitalWrite(self.DSPin,0)
            else:
                wiringpi.digitalWrite(self.DSPin,0)
                wiringpi.digitalWrite(self.ClockPin, 1)
                wiringpi.digitalWrite(self.ClockPin, 0)
                
            

