import os
import time
import re
from pathlib import Path


def get_dt_filename(dir, filename, filetype, test_timestamp):
    """
    Generate a filename with a timestamp.

    Args:
        dir (str): The directory path.
        filename (str): The base name of the file.
        filetype (str): The file extension type.
        test_timestamp (str): The timestamp to include in the filename.

    Returns:
        str: The generated filename with the timestamp.
    """
    return os.path.join(dir, f"{filename}_{test_timestamp}.{filetype}")


def print_verbose(text, verbose=False, verbose_color="\033[0m", verbose_label=""):
    if verbose:
        print_colored(
            text=f"{verbose_label}{text}",
            text_color=verbose_color,
        )

def print_colored(text, text_color="\033[0m"):
    print(f"{text_color}{text}\033[0m")

def print_progress(width=52, total_delay=5, frame_delay=0, style="\033[0m", clear_after_done=True):
    content_width = width - 2
    if frame_delay == 0:
        frame_delay = total_delay / (content_width + 1)
    for i in range(0, content_width + 1):
        progress_line = "#" * i + " " * (content_width - i)
        output_line = f"\r[{progress_line}] ({i/content_width * 100:3.0f}%)"
        print(f"{style}{output_line}\033[0m", end="")
        time.sleep(frame_delay)
    if clear_after_done:
        print(f"\r", end="")
    else:
        print()

def clean_save_log_file(log_file):
    cleaned_text, cleaned_path = clean_log(log_file)
    with open(cleaned_path, "w") as f:
        f.write(cleaned_text)

def clean_log(log_file):
    """
    Cleans the provided log file by removing color codes and progress bars.

    Parameters:
    log_file (str): Path to the log file to clean.

    Returns:
    str: Cleaned log content.
    """

    # Regular expression pattern for ANSI escape sequences (color codes)
    ansi_escape = re.compile(r'\x1B\[[0-?9;]*[mK]')

    # Regular expression pattern to match progress bars
    progress_bar_pattern = re.compile(r'\[.*?\] \( *\d+%\)')

    with open(log_file, 'r', encoding='utf-8') as file:
        log_content = file.read()

    # Remove ANSI escape sequences
    cleaned_log = ansi_escape.sub('', log_content)

    # Remove progress bars
    cleaned_log = progress_bar_pattern.sub('', cleaned_log)

    # Clean up any leading/trailing whitespace
    cleaned_log = cleaned_log.strip()

    # Remove extra spaces and newlines
    cleaned_log = re.sub(r'\n{2,}', '\n', cleaned_log)

    return cleaned_log, f"{Path(log_file).parent}/{Path(log_file).stem}-cleaned.txt"