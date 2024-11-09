from dotenv import load_dotenv
import os
from classes.DataBase import DataBase
load_dotenv()
db = DataBase(
    host=os.getenv("DATABASE_HOST"),
    user=os.getenv("DATABASE_USER"),
    password=os.getenv("DATABASE_PASSWORD"),
    database=os.getenv("DATABASE_NAME"),
    port=os.getenv("DATABASE_PORT", 3306),
    db='mysql'
)