import zbar


class Scanner:
    def __init__(self, device):
        self.proc = zbar.Processor()
        self.proc.parse_config('enable')
        self.proc.visible = False
        self.proc.init(device, False)


    def scan_one(self):
        self.proc.process_one()
        result = None
        for symbol in self.proc.results:
            result = symbol.data
            index = result.find('=') + 1
            result = result[index:]
        return result




