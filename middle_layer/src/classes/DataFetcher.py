import threading
import time


class DataFetcher:
    def __init__(self, config):
        """
        Initializes the DataFetcher.

        Args:
            interval (int): Time in seconds between each execution of fetch_data. Defaults to 60 seconds.
        """
        self.interval = config.fetch_new_data_interval
        self._stop_event = threading.Event()
        self._thread = threading.Thread(target=self._run)

    def _run(self):
        """
        Runs the fetch_data method at the specified interval.
        """
        while not self._stop_event.is_set():
            self.fetch_data()
            time.sleep(self.interval)

    def fetch_data(self):
        print("Fetching data...")
    #     sample_list=['AAPL', 'GOGL']
    #     here goes the code for fetching data with api and populating db

    def start(self):
        """
        Starts the background thread that executes fetch_data periodically.
        """
        if not self._thread.is_alive():
            self._thread = threading.Thread(target=self._run)
            self._thread.start()

    def stop(self):
        """
        Stops the background thread.
        """
        self._stop_event.set()
        self._thread.join()
