#!/usr/bin/env python
import os
import sys
from whatsopt_server.__main__ import main

if __name__ == "__main__":
    os.execv(main(sys.argv[1:]))
