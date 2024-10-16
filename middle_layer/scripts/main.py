from config.config import config
from src.classes.DataFetcher import DataFetcher
import time

fetcher = DataFetcher(config.fetch_new_data_interval)
fetcher.start()

# fetcher executes async while script runs
while True:
    pass

print("Stopped script")
fetcher.stop()
