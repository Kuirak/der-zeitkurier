import zbar

class Scanner:
    def __init__(self, device, data_handler):
        self.proc = zbar.Processor()
        self.proc.parse_config('enable')
        self.proc.request_size(160,120)
        self.proc.init(device)
        self.proc.visible = False

    def scan_one(self):
        self.proc.process_one()
        return self.proc.results
#needs some testing



