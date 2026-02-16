import sys
import time

# Send 'start' command
sys.stdout.write('start\n')
sys.stdout.flush()

# Wait for streaming to begin
time.sleep(2)

# Keep the process alive for a bit
time.sleep(30)

# Send 'status' command
sys.stdout.write('status\n')
sys.stdout.flush()

time.sleep(2)
