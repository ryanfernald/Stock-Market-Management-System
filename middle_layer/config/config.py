from src.classes.Config import Config


config = Config(
    fetch_new_data_interval=10, #s
#     other config parameters..

#     Verbose settings
    verbose=True,
    config_verbose_label="Config: ",
    config_verbose_color="\033[33m",
)
