import zbar


class Scanner:
    def __init__(self, device):
        self.proc = zbar.Processor()
        self.proc.parse_config('enable')
        self.proc.init(device, False)
        self.proc.visible = False

    def scan_one(self):
        print 'Scanning'
        self.proc.process_one()

        result = None
        for symbol in self.proc.results:
            print 'Scanned ' + str(symbol.type)+': ' + str(symbol.data)
            result = symbol.data
            index = result.find('=') + 1
            result = result[index:]
            print 'parsed result'
        return result




