from config.config import config
from src.classes.DataFetcher import DataFetcher

fetcher = DataFetcher(config)
fetcher.start()

# fetcher executes async while script runs
while True:
    pass

print("Stopped script")
fetcher.stop()
