from time import sleep
import wiringpi


class TypewriterElectronics:
    

    def __init__(self, keymap):
        self.DSPin = 24
        self.LatchPin = 23
        self.ClockPin = 25
        self.keymap = keymap        
        self.outputArray = [0] * 48
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
        self.resetOutputArray()
        self.sendToShiftRegister()
        sleep(0.002)

    def triggerOutput(self, number, name):
        print name + ": " + number
        number = int(number) - 1
        self.outputArray[number] = 1
        self.sendToShiftRegister()
        sleep(0.002)

    def resetOutputArray(self):
        count = 0
        while count < 48:
            self.outputArray[count] = 0
            count += 1

    def sendToShiftRegister(self):
        self.latch(0)
        self.shiftOut()
        self.latch(1)

    def latch(self,toggle):
        sleep(0.001)
        wiringpi.digitalWrite(self.LatchPin,toggle)
        

    def shiftOut(self):        
        for value in self.outputArray:
            if value == 1:
                sleep(0.0001)
                wiringpi.digitalWrite(self.DSPin,1)
                sleep(0.0001)
                wiringpi.digitalWrite(self.ClockPin, 1)
                sleep(0.0001)
                wiringpi.digitalWrite(self.ClockPin, 0)
                sleep(0.0001)
                wiringpi.digitalWrite(self.DSPin,0)                
            else:
                sleep(0.0001)
                wiringpi.digitalWrite(self.DSPin,0)
                sleep(0.0001)
                wiringpi.digitalWrite(self.ClockPin, 1)
                sleep(0.0001)
                wiringpi.digitalWrite(self.ClockPin, 0)
                
                
            

