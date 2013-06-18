import zbar

class Scanner:
    def __init__(self, device, data_handler):
        self.proc = zbar.Processor()
        self.proc.parse_config('enable')
        self.proc.init(device)

        self.proc.set_data_handler(data_handler)
        self.proc.visible = False

    def activate(self):
        self.proc.active = True
#needs some testing
    def wait(self):
        try:
            self.proc.process_one()
        except zbar.WindowClosed:
            pass


