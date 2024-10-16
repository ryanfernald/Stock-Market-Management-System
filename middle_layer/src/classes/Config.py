from src.functions.utils import print_verbose

class Config:
    """
    Configuration class for managing model settings, directories, and parameters.
    Adds timestamps to directory names and ensures directories exist.

    Attributes:
        verbose (bool): Flag to enable verbose logging.
    """
    def __init__(self, **kwargs):
        """
        Initialize the configuration with given parameters.

        Args:
            **kwargs: Arbitrary keyword arguments for configuration parameters.
        """
        self.__dict__.update(kwargs)

        if self.__dict__["verbose"]:
            self.print_verbose(f"Initializing configuration with parameters: {kwargs}")

    def print_verbose(self, text):
        print_verbose(
            text,
            self.__dict__["verbose"],
            self.__dict__["config_verbose_color"],
            self.__dict__["config_verbose_label"]
        )

    def add_parameter(self, key, value):
        """
        Add a key-value pair to the configuration parameters.

        Args:
            key (str): The key for the parameter.
            value (Any): The value for the parameter.
        """
        self.__dict__[key] = value
        if self.__dict__["verbose"]:
            self.print_verbose(f"Added parameter: {key} = {value}")

    def parameters_to_string(self):
        """
        Returns all configuration parameters as a formatted string.

        Returns:
            str: A string representation of all parameters.
        """
        params_str_list = []
        for key, value in self.__dict__.items():
            if isinstance(value, (list, tuple)):
                params_str_list.append(f"{key}:")
                for item in value:
                    params_str_list.append(f"    {item}")
            else:
                params_str_list.append(f"{key}: {value}")
        return "\n".join(params_str_list)
