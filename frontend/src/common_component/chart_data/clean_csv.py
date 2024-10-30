import pandas as pd
import json

def clean_and_filter_csv_pandas(input_file, output_file):
    # Load the CSV file with only the necessary columns
    df = pd.read_csv(input_file, usecols=['Date', 'Close'])
    
    # Remove commas and quotes from the "Close" column and convert to float
    df['Close'] = df['Close'].replace({',': '', '"': ''}, regex=True).astype(float)
    
    # Convert "Date" column to datetime format (MM/DD/YYYY)
    df['Date'] = pd.to_datetime(df['Date'], format='%m/%d/%Y')
    
    # Rename the "Date" column to "date"
    df.rename(columns={'Date': 'date'}, inplace=True)
    
    # Format the "date" column as a string in "YYYY-MM-DD" format
    df['date'] = df['date'].dt.strftime('%Y-%m-%d')
    
    # Display column types to confirm the changes
    print("Data types after cleaning:")
    print(df.info())
    
    # Convert DataFrame to a list of dictionaries
    data = df.to_dict(orient='records')
    
    # Save the cleaned data to a JSON file
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=4)
    print(f"Filtered and cleaned data has been written to {output_file}")

# Example usage
clean_and_filter_csv_pandas('frontend/src/common_component/apple.csv', 'apple_j.json')
